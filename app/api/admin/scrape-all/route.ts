import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { getSessionUser } from '@/lib/auth'
import { scrapeAndSaveAll } from '@/lib/scraper'

export const maxDuration = 300 // 5 min for scraping all accounts

/**
 * POST /api/admin/scrape-all
 * Starts a scrape job. Returns the job ID immediately.
 * The scrape runs in the background (within this same invocation).
 * Client polls GET /api/admin/scrape-all?jobId=xxx for progress.
 */
export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServerSupabaseClient()

  // Fetch active accounts
  const { data: accounts } = await supabase
    .from('social_accounts')
    .select('id, creator_id, platform, username')
    .eq('is_active', true)

  const igAccounts = (accounts || []).filter((a: any) => a.platform === 'instagram')

  if (igAccounts.length === 0) {
    return NextResponse.json({ jobId: null, total: 0, message: 'No Instagram accounts to scrape' })
  }

  const totalBatches = Math.ceil(igAccounts.length / 15)

  // Create job row
  const { data: job, error: jobErr } = await supabase
    .from('scrape_jobs')
    .insert({
      status: 'running',
      total: igAccounts.length,
      completed: 0,
      current_batch: 0,
      total_batches: totalBatches,
      success: 0,
      errors: 0,
      message: 'Starting...',
    })
    .select('id')
    .single()

  if (jobErr || !job) {
    return NextResponse.json({ error: 'Failed to create scrape job' }, { status: 500 })
  }

  const jobId = job.id

  // Return job ID immediately, then keep the function alive to do the scraping.
  // We use waitUntil-style: return response first, scraping continues.
  // On Vercel, the function stays alive until maxDuration as long as there's pending work.

  // We can't use waitUntil in Next.js App Router easily, so instead we use a
  // streaming response that writes a single JSON line immediately, then keeps
  // the connection open while scraping runs. The client only reads the first line.
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      // Send the job ID immediately so the client can start polling
      controller.enqueue(encoder.encode(JSON.stringify({ jobId, total: igAccounts.length }) + '\n'))

      try {
        let success = 0
        let errors = 0

        await scrapeAndSaveAll(
          accounts || [],
          // onProgress: fires after each account in a batch is saved
          (done, total, username, status, error) => {
            if (status === 'ok') success++
            else errors++
            // Update job row after each account
            supabase
              .from('scrape_jobs')
              .update({
                completed: done,
                success,
                errors,
                message: `Scraped @${username}`,
                updated_at: new Date().toISOString(),
              })
              .eq('id', jobId)
              .then(() => {})
          },
          // onBatchStart: fires when a new Apify batch begins
          (batchIndex, totalBatches, usernames) => {
            supabase
              .from('scrape_jobs')
              .update({
                current_batch: batchIndex,
                total_batches: totalBatches,
                message: `Batch ${batchIndex}/${totalBatches}...`,
                updated_at: new Date().toISOString(),
              })
              .eq('id', jobId)
              .then(() => {})
          },
        )

        // Calculate conversion data for yesterday
        await supabase
          .from('scrape_jobs')
          .update({ message: 'Calculating conversions...', updated_at: new Date().toISOString() })
          .eq('id', jobId)

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
            creator_id: creator.id,
            date: targetDate,
            views: viewsMap[creator.id] || 0,
            profile_views: clickMap[creator.id]?.profile_views || 0,
            link_clicks: clickMap[creator.id]?.link_clicks || 0,
            new_subs: existing?.new_subs ?? 0,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'creator_id,date' })
        }

        // Mark job done
        await supabase
          .from('scrape_jobs')
          .update({
            status: 'done',
            success,
            errors,
            message: `Done — ${success} scraped, ${errors} failed`,
            updated_at: new Date().toISOString(),
          })
          .eq('id', jobId)

      } catch (err: any) {
        await supabase
          .from('scrape_jobs')
          .update({
            status: 'error',
            message: err.message?.slice(0, 500) || 'Unknown error',
            updated_at: new Date().toISOString(),
          })
          .eq('id', jobId)
      } finally {
        controller.close()
      }
    }
  })

  return new Response(stream, {
    headers: { 'Content-Type': 'application/x-ndjson' },
  })
}

/**
 * GET /api/admin/scrape-all?jobId=xxx
 * Returns current progress for a scrape job.
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
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }
    return NextResponse.json(data)
  }

  // No jobId — return most recent job
  const { data, error } = await supabase
    .from('scrape_jobs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'No jobs found' }, { status: 404 })
  }
  return NextResponse.json(data)
}
