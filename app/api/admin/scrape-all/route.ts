import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { getSessionUser } from '@/lib/auth'
import { scrapeAndSaveAll } from '@/lib/scraper'

export const maxDuration = 300 // 5 min for scraping all accounts

/**
 * POST /api/admin/scrape-all  { jobId }
 *
 * Client sends a jobId (UUID) it generated. The server creates the job row,
 * runs the full scrape synchronously (updating the row along the way),
 * and returns the final result as JSON when done.
 *
 * The client doesn't wait for the POST response — it fire-and-forgets this
 * call and polls GET for progress. The POST stays alive on Vercel because
 * the response hasn't been sent yet (still doing work).
 */
export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: any = {}
  try { body = await req.json() } catch {}
  const jobId = body.jobId
  if (!jobId) return NextResponse.json({ error: 'Missing jobId' }, { status: 400 })

  const supabase = createServerSupabaseClient()

  // Fetch active accounts
  const { data: accounts } = await supabase
    .from('social_accounts')
    .select('id, creator_id, platform, username')
    .eq('is_active', true)

  const igAccounts = (accounts || []).filter((a: any) => a.platform === 'instagram')
  const totalBatches = Math.ceil(igAccounts.length / 15)

  // Create job row with the client-provided ID
  const { error: jobErr } = await supabase
    .from('scrape_jobs')
    .insert({
      id: jobId,
      status: 'running',
      total: igAccounts.length,
      completed: 0,
      current_batch: 0,
      total_batches: totalBatches,
      success: 0,
      errors: 0,
      message: 'Starting...',
    })

  if (jobErr) {
    return NextResponse.json({ error: 'Failed to create job: ' + jobErr.message }, { status: 500 })
  }

  if (igAccounts.length === 0) {
    await supabase.from('scrape_jobs').update({
      status: 'done', message: 'No Instagram accounts', updated_at: new Date().toISOString(),
    }).eq('id', jobId)
    return NextResponse.json({ ok: true, total: 0 })
  }

  // Run the full scrape — this keeps the function alive on Vercel
  try {
    let success = 0
    let errors = 0

    await scrapeAndSaveAll(
      accounts || [],
      // onProgress: after each account is processed
      async (done, total, username, status, error) => {
        if (status === 'ok') success++
        else errors++
        await supabase.from('scrape_jobs').update({
          completed: done, success, errors,
          message: `Scraped @${username}`,
          updated_at: new Date().toISOString(),
        }).eq('id', jobId)
      },
      // onBatchStart: when a new Apify batch begins
      async (batchIndex, totalBatches, usernames) => {
        await supabase.from('scrape_jobs').update({
          current_batch: batchIndex, total_batches: totalBatches,
          message: `Batch ${batchIndex}/${totalBatches}...`,
          updated_at: new Date().toISOString(),
        }).eq('id', jobId)
      },
    )

    // Calculate conversion data for yesterday
    await supabase.from('scrape_jobs').update({
      message: 'Calculating conversions...', updated_at: new Date().toISOString(),
    }).eq('id', jobId)

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const targetDate = yesterday.toISOString().split('T')[0]
    const dateStart = targetDate + 'T00:00:00.000Z'
    const dateEnd = targetDate + 'T23:59:59.999Z'

    const { data: creators } = await supabase.from('creators').select('id')
    const { data: clicks } = await supabase
      .from('clicks')
      .select('creator_id, type')
      .gte('created_at', dateStart)
      .lte('created_at', dateEnd)

    const clickMap: Record<string, { profile_views: number; link_clicks: number }> = {}
    ;(clicks || []).forEach((c: any) => {
      if (!clickMap[c.creator_id]) clickMap[c.creator_id] = { profile_views: 0, link_clicks: 0 }
      if (c.type === 'page_view') clickMap[c.creator_id].profile_views++
      else if (c.type === 'link_click') clickMap[c.creator_id].link_clicks++
    })

    const prevDate = new Date(targetDate)
    prevDate.setDate(prevDate.getDate() - 1)
    const prevDateStr = prevDate.toISOString().split('T')[0]

    const viewsMap: Record<string, number> = {}
    for (const acc of igAccounts) {
      const [todaySnap, prevSnap] = await Promise.all([
        supabase.from('social_snapshots').select('total_views').eq('social_account_id', acc.id)
          .eq('scrape_date', targetDate).order('scraped_at', { ascending: false }).limit(1),
        supabase.from('social_snapshots').select('total_views').eq('social_account_id', acc.id)
          .eq('scrape_date', prevDateStr).order('scraped_at', { ascending: false }).limit(1),
      ])
      const diff = ((todaySnap.data as any)?.[0]?.total_views || 0) - ((prevSnap.data as any)?.[0]?.total_views || 0)
      if (diff > 0) viewsMap[acc.creator_id] = (viewsMap[acc.creator_id] || 0) + diff
    }

    for (const creator of (creators || [])) {
      const { data: existing } = await supabase
        .from('conversion_daily')
        .select('new_subs')
        .eq('creator_id', creator.id)
        .eq('date', targetDate)
        .single()
      await supabase.from('conversion_daily').upsert({
        creator_id: creator.id, date: targetDate,
        views: viewsMap[creator.id] || 0,
        profile_views: clickMap[creator.id]?.profile_views || 0,
        link_clicks: clickMap[creator.id]?.link_clicks || 0,
        new_subs: existing?.new_subs ?? 0,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'creator_id,date' })
    }

    // Mark job done
    await supabase.from('scrape_jobs').update({
      status: 'done', success, errors,
      message: `Done — ${success} scraped, ${errors} failed`,
      updated_at: new Date().toISOString(),
    }).eq('id', jobId)

    return NextResponse.json({ ok: true, success, errors, total: igAccounts.length })

  } catch (err: any) {
    await supabase.from('scrape_jobs').update({
      status: 'error',
      message: err.message?.slice(0, 500) || 'Unknown error',
      updated_at: new Date().toISOString(),
    }).eq('id', jobId)

    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

/**
 * GET /api/admin/scrape-all?jobId=xxx
 * Returns current progress for a scrape job. Client polls this every 3 seconds.
 */
export async function GET(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const jobId = req.nextUrl.searchParams.get('jobId')
  const supabase = createServerSupabaseClient()

  if (jobId) {
    const { data, error } = await supabase
      .from('scrape_jobs')
      .select('*')
      .eq('id', jobId)
      .single()

    if (error || !data) {
      // Job row might not exist yet (race condition) — return a "pending" state
      return NextResponse.json({ status: 'pending', completed: 0, total: 0, message: 'Starting...' })
    }
    return NextResponse.json(data)
  }

  // No jobId — return most recent job
  const { data } = await supabase
    .from('scrape_jobs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!data) {
    return NextResponse.json({ error: 'No jobs found' }, { status: 404 })
  }
  return NextResponse.json(data)
}
