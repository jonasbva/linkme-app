import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

function isAdmin() {
  return cookies().get('admin_auth')?.value === 'true'
}

// GET /api/admin/conversions — fetch all conversion data
export async function GET(req: NextRequest) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = createServerSupabaseClient()

  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action')

  if (action === 'expectations') {
    const { data, error } = await supabase
      .from('conversion_expectations')
      .select('*')
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  if (action === 'daily') {
    const creatorId = searchParams.get('creator_id')
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    let query = supabase.from('conversion_daily').select('*')
    if (creatorId) query = query.eq('creator_id', creatorId)
    if (from) query = query.gte('date', from)
    if (to) query = query.lte('date', to)
    query = query.order('date', { ascending: false })

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}

// POST /api/admin/conversions — create/update conversion data
export async function POST(req: NextRequest) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = createServerSupabaseClient()
  const body = await req.json()

  if (body.action === 'set_expectation') {
    const { creator_id, daily_sub_target } = body
    const { data, error } = await supabase
      .from('conversion_expectations')
      .upsert(
        { creator_id, daily_sub_target, updated_at: new Date().toISOString() },
        { onConflict: 'creator_id' }
      )
      .select()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  if (body.action === 'set_daily_subs') {
    // Batch upsert daily subs for multiple creators on a given date
    const { date, entries } = body as { date: string; entries: { creator_id: string; new_subs: number }[] }
    const upserts = entries.map((e: any) => ({
      creator_id: e.creator_id,
      date,
      new_subs: e.new_subs,
      updated_at: new Date().toISOString(),
    }))
    const { data, error } = await supabase
      .from('conversion_daily')
      .upsert(upserts, { onConflict: 'creator_id,date' })
      .select()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  if (body.action === 'update_subs') {
    // Update subs for a single row in the table
    const { creator_id, date, new_subs } = body
    const { data, error } = await supabase
      .from('conversion_daily')
      .upsert(
        { creator_id, date, new_subs, updated_at: new Date().toISOString() },
        { onConflict: 'creator_id,date' }
      )
      .select()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  if (body.action === 'calculate_daily') {
    // Calculate views, profile_views, link_clicks for all creators for a given date
    const targetDate = body.date || (() => {
      const d = new Date(); d.setDate(d.getDate() - 1)
      return d.toISOString().split('T')[0]
    })()

    const dateStart = targetDate + 'T00:00:00.000Z'
    const dateEnd = targetDate + 'T23:59:59.999Z'

    // Get all creators
    const { data: creators } = await supabase.from('creators').select('id')
    if (!creators) return NextResponse.json({ error: 'No creators' }, { status: 500 })

    // Get all clicks for the date
    const { data: clicks } = await supabase
      .from('clicks')
      .select('creator_id, type')
      .gte('created_at', dateStart)
      .lte('created_at', dateEnd)

    // Aggregate clicks per creator
    const clickMap: Record<string, { profile_views: number; link_clicks: number }> = {}
    ;(clicks || []).forEach((c: any) => {
      if (!clickMap[c.creator_id]) clickMap[c.creator_id] = { profile_views: 0, link_clicks: 0 }
      if (c.type === 'page_view') clickMap[c.creator_id].profile_views++
      else if (c.type === 'link_click') clickMap[c.creator_id].link_clicks++
    })

    // Get social snapshots for the date — we need total_views diffs
    // Social snapshots store cumulative total_views, so we need the diff between
    // the snapshot on this date and the previous day
    const { data: socialAccounts } = await supabase
      .from('social_accounts')
      .select('id, creator_id')
      .eq('is_active', true)

    const prevDate = new Date(targetDate)
    prevDate.setDate(prevDate.getDate() - 1)
    const prevDateStr = prevDate.toISOString().split('T')[0]

    const viewsMap: Record<string, number> = {}

    if (socialAccounts && socialAccounts.length > 0) {
      // Get the latest snapshot for each account on target date and previous date
      for (const acc of socialAccounts) {
        const [todaySnap, prevSnap] = await Promise.all([
          supabase
            .from('social_snapshots')
            .select('total_views')
            .eq('social_account_id', acc.id)
            .gte('scraped_at', dateStart)
            .lte('scraped_at', dateEnd)
            .order('scraped_at', { ascending: false })
            .limit(1),
          supabase
            .from('social_snapshots')
            .select('total_views')
            .eq('social_account_id', acc.id)
            .gte('scraped_at', prevDateStr + 'T00:00:00.000Z')
            .lte('scraped_at', prevDateStr + 'T23:59:59.999Z')
            .order('scraped_at', { ascending: false })
            .limit(1),
        ])

        const todayViews = todaySnap.data?.[0]?.total_views || 0
        const prevViews = prevSnap.data?.[0]?.total_views || 0
        const diff = todayViews - prevViews
        if (diff > 0) {
          viewsMap[acc.creator_id] = (viewsMap[acc.creator_id] || 0) + diff
        }
      }
    }

    // Upsert daily rows for each creator
    const upserts = creators.map((creator: any) => ({
      creator_id: creator.id,
      date: targetDate,
      views: viewsMap[creator.id] || 0,
      profile_views: clickMap[creator.id]?.profile_views || 0,
      link_clicks: clickMap[creator.id]?.link_clicks || 0,
      updated_at: new Date().toISOString(),
    }))

    // Use upsert with merge — preserve existing new_subs values
    const results = []
    for (const row of upserts) {
      // Check if row exists to preserve new_subs
      const { data: existing } = await supabase
        .from('conversion_daily')
        .select('new_subs')
        .eq('creator_id', row.creator_id)
        .eq('date', row.date)
        .single()

      const upsertData = existing
        ? { ...row, new_subs: existing.new_subs }
        : { ...row, new_subs: 0 }

      const { data, error } = await supabase
        .from('conversion_daily')
        .upsert(upsertData, { onConflict: 'creator_id,date' })
        .select()

      if (data) results.push(...data)
    }

    return NextResponse.json({ calculated: results.length, date: targetDate })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
