import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { getSessionUser } from '@/lib/auth'

// GET /api/admin/social-accounts?creator_id=xxx  — accounts for one creator
// GET /api/admin/social-accounts                 — ALL accounts with creator name + last scraped
export async function GET(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const creatorId = req.nextUrl.searchParams.get('creator_id')
  const supabase = createServerSupabaseClient()

  if (creatorId) {
    const { data, error } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('creator_id', creatorId)
      .order('created_at', { ascending: true })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data)
  }

  // All accounts with creator name + last snapshot date
  const { data: accounts, error } = await supabase
    .from('social_accounts')
    .select('id, creator_id, platform, username, is_active, created_at, creators(display_name)')
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Get the latest snapshot per account (scraped_at + followers)
  const accountIds = (accounts || []).map((a: any) => a.id)
  const lastScrapedMap: Record<string, string> = {}
  const followersMap: Record<string, number | null> = {}

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
  }))

  return NextResponse.json(result)
}

// POST /api/admin/social-accounts — add a social account to track
export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { creator_id, platform, username } = await req.json()

  if (!creator_id || !platform || !username) {
    return NextResponse.json({ error: 'creator_id, platform, and username are required' }, { status: 400 })
  }

  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('social_accounts')
    .insert({ creator_id, platform, username: username.replace('@', '').trim() })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

// PATCH /api/admin/social-accounts — bulk update accounts
// Body: { updates: [{ id, username?, is_active?, platform? }] }
export async function PATCH(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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
