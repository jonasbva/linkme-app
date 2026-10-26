import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { requireUser, requireSuperAdmin, requireCreatorAccess, guardResponse, getUserPermissions } from '@/lib/auth'

// GET /api/admin/social-accounts?creator_id=xxx  — accounts for one creator
// GET /api/admin/social-accounts                 — ALL accounts with creator name + last scraped
export async function GET(req: NextRequest) {
  const creatorId = req.nextUrl.searchParams.get('creator_id')
  const supabase = createServerSupabaseClient()

  if (creatorId) {
    const gate = await requireCreatorAccess(creatorId, 'view_social')
    if (!gate.ok) return guardResponse(gate)
    const { data, error } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('creator_id', creatorId)
      .order('created_at', { ascending: true })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data)
  }

  // All accounts with creator name + last snapshot date
  const gate = await requireUser()
  if (!gate.ok) return guardResponse(gate)

  let accountsQuery = supabase
    .from('social_accounts')
    .select('id, creator_id, platform, username, is_active, created_at, status, status_detail, status_checked_at, consecutive_failures, creators(display_name)')
    .order('created_at', { ascending: true })

  // Non-super-admins only see accounts for creators they can access.
  if (!gate.user.is_super_admin) {
    const perms = await getUserPermissions(gate.user.id)
    if (!perms.grantAllCreators) {
      if (perms.visibleCreatorIds.length === 0) return NextResponse.json([])
      accountsQuery = accountsQuery.in('creator_id', perms.visibleCreatorIds)
    }
  }

  const { data: accounts, error } = await accountsQuery

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Get the latest snapshot per account (scraped_at + followers)
  const accountIds = (accounts || []).map((a: any) => a.id)
  const lastScrapedMap: Record<string, string> = {}
  const followersMap: Record<string, number | null> = {}
  const linkMap: Record<string, { id: string; label: string; infloww_link_id: string | null }> = {}

  if (accountIds.length > 0) {
    // Fetch recent snapshots — one per account is enough
    const { data: snapshots } = await supabase
      .from('social_snapshots')
      .select('social_account_id, scraped_at, followers')
      .in('social_account_id', accountIds)
      .order('scraped_at', { ascending: false })
      .limit(accountIds.length * 2)

    if (snapshots) {
      for (const s of snapshots) {
        // First occurrence per account is the latest (ordered DESC)
        if (!lastScrapedMap[s.social_account_id]) {
          lastScrapedMap[s.social_account_id] = s.scraped_at
          followersMap[s.social_account_id] = s.followers
        }
      }
    }

    // The OF tracking link each account carries in its bio. An account with no
    // active link, or one not yet bound to Infloww, is dark to conversions.
    const { data: links } = await supabase
      .from('tracking_links')
      .select('id, social_account_id, label, infloww_link_id')
      .in('social_account_id', accountIds)
      .eq('is_active', true)

    for (const l of links || []) {
      if (!l.social_account_id) continue
      const current = linkMap[l.social_account_id]
      // Prefer a link that is actually wired to Infloww.
      if (!current || (!current.infloww_link_id && l.infloww_link_id)) {
        linkMap[l.social_account_id] = { id: l.id, label: l.label, infloww_link_id: l.infloww_link_id }
      }
    }
  }

  const result = (accounts || []).map((a: any) => ({
    id: a.id,
    creator_id: a.creator_id,
    creator_name: a.creators?.display_name || 'Unknown',
    platform: a.platform,
    username: a.username,
    is_active: a.is_active,
    created_at: a.created_at,
    last_scraped: lastScrapedMap[a.id] || null,
    followers: followersMap[a.id] ?? null,
    status: a.status || 'never_seen',
    status_detail: a.status_detail || null,
    status_checked_at: a.status_checked_at || null,
    consecutive_failures: a.consecutive_failures ?? 0,
    tracking_link: linkMap[a.id] || null,
  }))

  return NextResponse.json(result)
}

// POST /api/admin/social-accounts — add a social account to track
//
// Body: { creator_id, platform, username, tracking_link? }
// tracking_link is the OF link that account carries in its bio. It is optional
// so a handle can still be added before its link exists, but an account without
// one is reported on the Overview until it is connected.
export async function POST(req: NextRequest) {
  const { creator_id, platform, username, tracking_link } = await req.json()

  if (!creator_id || !platform || !username) {
    return NextResponse.json({ error: 'creator_id, platform, and username are required' }, { status: 400 })
  }

  const gate = await requireCreatorAccess(creator_id, 'edit_social')
  if (!gate.ok) return guardResponse(gate)

  const supabase = createServerSupabaseClient()
  const handle = username.replace('@', '').trim()
  const { data, error } = await supabase
    .from('social_accounts')
    .insert({ creator_id, platform, username: handle })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  let link = null
  if (tracking_link && (tracking_link.infloww_link_id || tracking_link.url || tracking_link.label)) {
    // Another account must not already claim this Infloww link.
    if (tracking_link.infloww_link_id) {
      const { data: taken } = await supabase
        .from('tracking_links')
        .select('id, label')
        .eq('infloww_link_id', String(tracking_link.infloww_link_id))
        .maybeSingle()
      if (taken) {
        return NextResponse.json({
          account: data,
          link: null,
          warning: `@${handle} was added, but that Infloww link is already used by "${taken.label}".`,
        })
      }
    }

    const { count } = await supabase
      .from('tracking_links')
      .select('id', { count: 'exact', head: true })
      .eq('creator_id', creator_id)

    const { data: created, error: linkError } = await supabase
      .from('tracking_links')
      .insert({
        creator_id,
        social_account_id: data.id,
        label: (tracking_link.label || `@${handle} bio`).trim(),
        url: (tracking_link.url || '').trim() || null,
        infloww_link_id: tracking_link.infloww_link_id ? String(tracking_link.infloww_link_id) : null,
        infloww_link_name: tracking_link.infloww_link_name || null,
        infloww_code: tracking_link.infloww_code || null,
        infloww_synced_at: tracking_link.infloww_link_id ? new Date().toISOString() : null,
        sort_order: count ?? 0,
      })
      .select()
      .single()

    if (linkError) {
      return NextResponse.json({
        account: data,
        link: null,
        warning: `@${handle} was added, but its tracking link could not be saved: ${linkError.message}`,
      })
    }
    link = created
  }

  return NextResponse.json({ account: data, link })
}

// PATCH /api/admin/social-accounts — bulk update accounts
// Body: { updates: [{ id, username?, is_active?, platform? }] }
export async function PATCH(req: NextRequest) {
  const gate = await requireSuperAdmin()
  if (!gate.ok) return guardResponse(gate)

  const { updates } = await req.json()
  if (!Array.isArray(updates) || updates.length === 0) {
    return NextResponse.json({ error: 'updates array required' }, { status: 400 })
  }

  const supabase = createServerSupabaseClient()
  let success = 0
  let errors = 0

  for (const u of updates) {
    if (!u.id) { errors++; continue }
    const fields: any = {}
    if (u.username !== undefined) fields.username = u.username.replace('@', '').trim()
    if (u.is_active !== undefined) fields.is_active = u.is_active
    if (u.platform !== undefined) fields.platform = u.platform

    if (Object.keys(fields).length === 0) continue

    const { error } = await supabase
      .from('social_accounts')
      .update(fields)
      .eq('id', u.id)

    if (error) errors++
    else success++
  }

  return NextResponse.json({ success, errors })
}

// DELETE /api/admin/social-accounts?id=xxx
// DELETE /api/admin/social-accounts  body: { ids: [...] }  — bulk delete
export async function DELETE(req: NextRequest) {
  const gate = await requireSuperAdmin()
  if (!gate.ok) return guardResponse(gate)

  const id = req.nextUrl.searchParams.get('id')
  const supabase = createServerSupabaseClient()

  if (id) {
    const { error } = await supabase.from('social_accounts').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true })
  }

  // Bulk delete
  try {
    const { ids } = await req.json()
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'id param or ids array required' }, { status: 400 })
    }
    const { error } = await supabase.from('social_accounts').delete().in('id', ids)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true, deleted: ids.length })
  } catch {
    return NextResponse.json({ error: 'id param or ids array required' }, { status: 400 })
  }
}
