import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { requireUser, requireCreatorAccess, canAccessCreator, guardResponse, getUserPermissions } from '@/lib/auth'

/**
 * Conversions API — two layers.
 *
 * Data model:
 *   creator (= the OF account every IG link funnels into)
 *     → creator_daily        one row per creator per day: new_subs
 *     → creator_expectations one row per creator: daily_sub_target
 *     → tracking_links       N links (one per IG bio link)
 *         → link_daily       one row per link per day: views / profile_views / link_clicks
 *
 * Both daily tables are entered by hand; the rows are generated for every
 * creator/link so the traffic team only types numbers.
 */

// Creator scope for the caller. null = unrestricted (super-admin / grant-all).
async function creatorScope(user: { id: string; is_super_admin: boolean }): Promise<string[] | null> {
  if (user.is_super_admin) return null
  const perms = await getUserPermissions(user.id)
  if (perms.grantAllCreators) return null
  return perms.visibleCreatorIds
}

// GET /api/admin/conversions?action=expectations
// GET /api/admin/conversions?action=creator_daily&creator_id=…&from=…&to=…
// GET /api/admin/conversions?action=link_daily&from=…&to=…
export async function GET(req: NextRequest) {
  const gate = await requireUser()
  if (!gate.ok) return guardResponse(gate)
  const supabase = createServerSupabaseClient()

  const visibleIds = await creatorScope(gate.user)
  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action')

  if (action === 'expectations') {
    let q = supabase.from('creator_expectations').select('*')
    if (visibleIds !== null) {
      if (visibleIds.length === 0) return NextResponse.json([])
      q = q.in('creator_id', visibleIds)
    }
    const { data, error } = await q
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  if (action === 'creator_daily') {
    const creatorId = searchParams.get('creator_id')
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    let q = supabase.from('creator_daily').select('*')
    if (creatorId) q = q.eq('creator_id', creatorId)
    if (from) q = q.gte('date', from)
    if (to) q = q.lte('date', to)
    if (visibleIds !== null) {
      if (visibleIds.length === 0) return NextResponse.json([])
      q = q.in('creator_id', visibleIds)
    }

    const { data, error } = await q.order('date', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  if (action === 'link_daily') {
    const creatorId = searchParams.get('creator_id')
    const linkId = searchParams.get('tracking_link_id')
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    // link_daily has no creator_id, so resolve the visible links first.
    let linksQ = supabase.from('tracking_links').select('id, creator_id')
    if (creatorId) linksQ = linksQ.eq('creator_id', creatorId)
    if (visibleIds !== null) {
      if (visibleIds.length === 0) return NextResponse.json([])
      linksQ = linksQ.in('creator_id', visibleIds)
    }
    const { data: links, error: linksErr } = await linksQ
    if (linksErr) return NextResponse.json({ error: linksErr.message }, { status: 500 })

    let ids = (links || []).map(l => l.id)
    if (linkId) ids = ids.filter(id => id === linkId)
    if (ids.length === 0) return NextResponse.json([])

    let q = supabase.from('link_daily').select('*').in('tracking_link_id', ids)
    if (from) q = q.gte('date', from)
    if (to) q = q.lte('date', to)

    const { data, error } = await q.order('date', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}

export async function POST(req: NextRequest) {
  const gate = await requireUser()
  if (!gate.ok) return guardResponse(gate)
  const supabase = createServerSupabaseClient()
  const body = await req.json()

  /**
   * Daily-sub target for a creator.
   * Body: { action: 'set_expectation', creator_id, daily_sub_target }
   */
  if (body.action === 'set_expectation') {
    const { creator_id, daily_sub_target } = body
    if (!creator_id) return NextResponse.json({ error: 'creator_id is required' }, { status: 400 })

    const access = await requireCreatorAccess(creator_id, 'input_conversions')
    if (!access.ok) return guardResponse(access)

    const { data, error } = await supabase
      .from('creator_expectations')
      .upsert(
        { creator_id, daily_sub_target: Number(daily_sub_target) || 0, updated_at: new Date().toISOString() },
        { onConflict: 'creator_id' }
      )
      .select()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  /**
   * Batch write new_subs for many creators on one date.
   * Body: { action: 'set_daily_subs', date, entries: [{ creator_id, new_subs }, …] }
   */
  if (body.action === 'set_daily_subs') {
    const { date, entries } = body as { date: string; entries: { creator_id: string; new_subs: number }[] }
    if (!date || !Array.isArray(entries)) {
      return NextResponse.json({ error: 'date and entries are required' }, { status: 400 })
    }

    const creatorIds = Array.from(new Set(entries.map(e => e.creator_id)))
    if (!gate.user.is_super_admin) {
      for (const cid of creatorIds) {
        if (!(await canAccessCreator(gate.user.id, cid, 'input_conversions'))) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }
      }
    }

    const upserts = entries.map(e => ({
      creator_id: e.creator_id,
      date,
      new_subs: Number(e.new_subs) || 0,
      updated_at: new Date().toISOString(),
    }))
    if (upserts.length === 0) return NextResponse.json([])

    const { data, error } = await supabase
      .from('creator_daily')
      .upsert(upserts, { onConflict: 'creator_id,date' })
      .select()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  /**
   * One creator's new_subs on one date.
   * Body: { action: 'update_creator_cell', creator_id, date, value }
   */
  if (body.action === 'update_creator_cell') {
    const { creator_id, date, value } = body
    if (!creator_id || !date) {
      return NextResponse.json({ error: 'creator_id and date are required' }, { status: 400 })
    }

    const access = await requireCreatorAccess(creator_id, 'input_conversions')
    if (!access.ok) return guardResponse(access)

    const { data, error } = await supabase
      .from('creator_daily')
      .upsert(
        { creator_id, date, new_subs: Number(value) || 0, updated_at: new Date().toISOString() },
        { onConflict: 'creator_id,date' }
      )
      .select()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  /**
   * One link's traffic figure on one date.
   * Body: { action: 'update_link_cell', tracking_link_id, date, field, value }
   */
  if (body.action === 'update_link_cell') {
    const { tracking_link_id, date, field, value } = body
    const allowedFields = ['views', 'profile_views', 'link_clicks']
    if (!allowedFields.includes(field)) {
      return NextResponse.json({ error: 'Invalid field' }, { status: 400 })
    }
    if (!tracking_link_id || !date) {
      return NextResponse.json({ error: 'tracking_link_id and date are required' }, { status: 400 })
    }

    const { data: link, error: linkErr } = await supabase
      .from('tracking_links')
      .select('id, creator_id')
      .eq('id', tracking_link_id)
      .single()
    if (linkErr || !link) return NextResponse.json({ error: 'Link not found' }, { status: 404 })

    const access = await requireCreatorAccess(link.creator_id, 'input_conversions')
    if (!access.ok) return guardResponse(access)

    const { data: existing } = await supabase
      .from('link_daily')
      .select('views, profile_views, link_clicks')
      .eq('tracking_link_id', tracking_link_id)
      .eq('date', date)
      .maybeSingle()

    const row = {
      tracking_link_id,
      date,
      views: existing?.views ?? 0,
      profile_views: existing?.profile_views ?? 0,
      link_clicks: existing?.link_clicks ?? 0,
      [field]: Number(value) || 0,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('link_daily')
      .upsert(row, { onConflict: 'tracking_link_id,date' })
      .select()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  /**
   * Batch write link traffic for one date.
   * Body: { action: 'set_link_daily', date,
   *         entries: [{ tracking_link_id, views, profile_views, link_clicks }, …] }
   */
  if (body.action === 'set_link_daily') {
    const { date, entries } = body as {
      date: string
      entries: { tracking_link_id: string; views: number; profile_views: number; link_clicks: number }[]
    }
    if (!date || !Array.isArray(entries)) {
      return NextResponse.json({ error: 'date and entries are required' }, { status: 400 })
    }

    const linkIds = entries.map(e => e.tracking_link_id)
    const { data: links, error: linksErr } = await supabase
      .from('tracking_links')
      .select('id, creator_id')
      .in('id', linkIds)
    if (linksErr) return NextResponse.json({ error: linksErr.message }, { status: 500 })

    const creatorByLink = Object.fromEntries((links || []).map(l => [l.id, l.creator_id]))
    if (!gate.user.is_super_admin) {
      const creatorIds = Array.from(new Set(Object.values(creatorByLink))) as string[]
      for (const cid of creatorIds) {
        if (!(await canAccessCreator(gate.user.id, cid, 'input_conversions'))) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }
      }
    }

    const upserts = entries
      .filter(e => creatorByLink[e.tracking_link_id])
      .map(e => ({
        tracking_link_id: e.tracking_link_id,
        date,
        views: Number(e.views) || 0,
        profile_views: Number(e.profile_views) || 0,
        link_clicks: Number(e.link_clicks) || 0,
        updated_at: new Date().toISOString(),
      }))
    if (upserts.length === 0) return NextResponse.json([])

    const { data, error } = await supabase
      .from('link_daily')
      .upsert(upserts, { onConflict: 'tracking_link_id,date' })
      .select()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
