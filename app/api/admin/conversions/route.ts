import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { getSessionUser } from '@/lib/auth'

/**
 * Conversions API — keyed on conversion_account_id (not creator_id).
 *
 * Data model:
 *   One creator → N conversion_accounts → N conversion_daily rows + 1 expectation row
 */

// GET /api/admin/conversions?action=expectations  → list all expectations
// GET /api/admin/conversions?action=daily&account_id=…&from=…&to=… → daily rows
export async function GET(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = createServerSupabaseClient()

  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action')

  if (action === 'expectations') {
    const { data, error } = await supabase.from('conversion_expectations').select('*')
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  if (action === 'daily') {
    const accountId = searchParams.get('account_id')
    const creatorId = searchParams.get('creator_id') // legacy: filter by creator via account lookup
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    let query = supabase.from('conversion_daily').select('*')
    if (accountId) query = query.eq('conversion_account_id', accountId)
    if (creatorId && !accountId) query = query.eq('creator_id', creatorId)
    if (from) query = query.gte('date', from)
    if (to) query = query.lte('date', to)
    query = query.order('date', { ascending: false })

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}

// POST /api/admin/conversions
export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = createServerSupabaseClient()
  const body = await req.json()

  /**
   * Set/clear the daily-sub target for a conversion_account.
   * Body: { action: 'set_expectation', conversion_account_id, daily_sub_target }
   */
  if (body.action === 'set_expectation') {
    const { conversion_account_id, daily_sub_target } = body
    if (!conversion_account_id) {
      return NextResponse.json({ error: 'conversion_account_id is required' }, { status: 400 })
    }
    // We need creator_id for the row (NOT NULL FK). Look it up.
    const { data: ca, error: caErr } = await supabase
      .from('conversion_accounts')
      .select('id, creator_id')
      .eq('id', conversion_account_id)
      .single()
    if (caErr || !ca) return NextResponse.json({ error: 'Conversion account not found' }, { status: 404 })

    const { data, error } = await supabase
      .from('conversion_expectations')
      .upsert(
        {
          conversion_account_id,
          creator_id: ca.creator_id,
          daily_sub_target,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'conversion_account_id' }
      )
      .select()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  /**
   * Batch write new_subs for many accounts on a given date.
   * Body: { action: 'set_daily_subs', date, entries: [{ conversion_account_id, new_subs }, ...] }
   */
  if (body.action === 'set_daily_subs') {
    const { date, entries } = body as {
      date: string
      entries: { conversion_account_id: string; new_subs: number }[]
    }
    if (!date || !Array.isArray(entries)) {
      return NextResponse.json({ error: 'date and entries are required' }, { status: 400 })
    }

    // Pull creator_id for every account_id in one query.
    const accountIds = entries.map(e => e.conversion_account_id)
    const { data: accounts, error: accErr } = await supabase
      .from('conversion_accounts')
      .select('id, creator_id')
      .in('id', accountIds)
    if (accErr) return NextResponse.json({ error: accErr.message }, { status: 500 })
    const creatorByAccount = Object.fromEntries((accounts || []).map(a => [a.id, a.creator_id]))

    // Preserve existing views / profile_views / link_clicks per (account, date).
    const { data: existingRows } = await supabase
      .from('conversion_daily')
      .select('conversion_account_id, views, profile_views, link_clicks')
      .eq('date', date)
      .in('conversion_account_id', accountIds)
    const existingMap: Record<string, { views: number; profile_views: number; link_clicks: number }> = {}
    ;(existingRows || []).forEach((r: any) => {
      existingMap[r.conversion_account_id] = {
        views: r.views,
        profile_views: r.profile_views,
        link_clicks: r.link_clicks,
      }
    })

    const upserts = entries
      .filter(e => creatorByAccount[e.conversion_account_id])
      .map(e => ({
        conversion_account_id: e.conversion_account_id,
        creator_id: creatorByAccount[e.conversion_account_id],
        date,
        new_subs: e.new_subs,
        views: existingMap[e.conversion_account_id]?.views ?? 0,
        profile_views: existingMap[e.conversion_account_id]?.profile_views ?? 0,
        link_clicks: existingMap[e.conversion_account_id]?.link_clicks ?? 0,
        updated_at: new Date().toISOString(),
      }))

    if (upserts.length === 0) return NextResponse.json([])

    const { data, error } = await supabase
      .from('conversion_daily')
      .upsert(upserts, { onConflict: 'conversion_account_id,date' })
      .select()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  /**
   * Update one field on a single daily row.
   * Body: { action: 'update_cell', conversion_account_id, date, field, value }
   */
  if (body.action === 'update_cell') {
    const { conversion_account_id, date, field, value } = body
    const allowedFields = ['views', 'profile_views', 'link_clicks', 'new_subs']
    if (!allowedFields.includes(field)) {
      return NextResponse.json({ error: 'Invalid field' }, { status: 400 })
    }
    if (!conversion_account_id) {
      return NextResponse.json({ error: 'conversion_account_id is required' }, { status: 400 })
    }

    const { data: ca, error: caErr } = await supabase
      .from('conversion_accounts')
      .select('id, creator_id')
      .eq('id', conversion_account_id)
      .single()
    if (caErr || !ca) return NextResponse.json({ error: 'Conversion account not found' }, { status: 404 })

    const { data: existing } = await supabase
      .from('conversion_daily')
      .select('views, profile_views, link_clicks, new_subs')
      .eq('conversion_account_id', conversion_account_id)
      .eq('date', date)
      .maybeSingle()

    const upsertData = {
      conversion_account_id,
      creator_id: ca.creator_id,
      date,
      views: existing?.views ?? 0,
      profile_views: existing?.profile_views ?? 0,
      link_clicks: existing?.link_clicks ?? 0,
      new_subs: existing?.new_subs ?? 0,
      [field]: value,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('conversion_daily')
      .upsert(upsertData, { onConflict: 'conversion_account_id,date' })
      .select()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  /**
   * Auto-calculate views / profile_views / link_clicks per conversion_account
   * for a given date (from clicks + social_snapshots).
   *
   * NOTE: clicks + social_accounts are still keyed by creator_id. For now we
   * attribute them to each creator's MAIN conversion account (display_label IS NULL)
   * and leave alts (ESP, second, etc.) untouched — those are filled by hand in
   * the conversion sheet.
   *
   * Body: { action: 'calculate_daily', date? }
   */
  if (body.action === 'calculate_daily') {
    const targetDate =
      body.date ||
      (() => {
        const d = new Date()
        d.setDate(d.getDate() - 1)
        return d.toISOString().split('T')[0]
      })()

    const dateStart = targetDate + 'T00:00:00.000Z'
    const dateEnd = targetDate + 'T23:59:59.999Z'

    // Fetch all main conversion accounts (one per creator).
    const { data: mainAccounts } = await supabase
      .from('conversion_accounts')
      .select('id, creator_id, display_label')
      .is('display_label', null)
    if (!mainAccounts) return NextResponse.json({ error: 'No conversion accounts' }, { status: 500 })

    // Clicks per creator → attribute to the creator's main conv account.
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

    // Views per creator (diff of total_views across snapshots on this date vs prev).
    const { data: socialAccounts } = await supabase
      .from('social_accounts')
      .select('id, creator_id')
      .eq('is_active', true)

    const prevDate = new Date(targetDate)
    prevDate.setDate(prevDate.getDate() - 1)
    const prevDateStr = prevDate.toISOString().split('T')[0]

    const viewsMap: Record<string, number> = {}
    if (socialAccounts) {
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
        if (diff > 0) viewsMap[acc.creator_id] = (viewsMap[acc.creator_id] || 0) + diff
      }
    }

    // Upsert per main conversion account, preserving new_subs.
    const results: any[] = []
    for (const ma of mainAccounts) {
      const { data: existing } = await supabase
        .from('conversion_daily')
        .select('new_subs')
        .eq('conversion_account_id', ma.id)
        .eq('date', targetDate)
        .maybeSingle()

      const row = {
        conversion_account_id: ma.id,
        creator_id: ma.creator_id,
        date: targetDate,
        views: viewsMap[ma.creator_id] || 0,
        profile_views: clickMap[ma.creator_id]?.profile_views || 0,
        link_clicks: clickMap[ma.creator_id]?.link_clicks || 0,
        new_subs: existing?.new_subs ?? 0,
        updated_at: new Date().toISOString(),
      }

      const { data } = await supabase
        .from('conversion_daily')
        .upsert(row, { onConflict: 'conversion_account_id,date' })
        .select()
      if (data) results.push(...data)
    }

    return NextResponse.json({ calculated: results.length, date: targetDate })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
