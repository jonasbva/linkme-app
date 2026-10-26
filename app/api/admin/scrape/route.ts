import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { requireUser, requireCreatorAccess, guardResponse } from '@/lib/auth'
import { scrapeAndSaveAll } from '@/lib/scraper'

// POST /api/admin/scrape
// Body: { social_account_id: string } — scrapes that one account
// Or:   { creator_id: string }        — scrapes ALL active accounts for that creator (batched)
export async function POST(req: NextRequest) {
  const base = await requireUser()
  if (!base.ok) return guardResponse(base)

  const body = await req.json()
  const supabase = createServerSupabaseClient()

  // Resolve the creator this scrape targets + which accounts to scrape.
  let creatorId: string | null = null
  let accountIds: string[] = []

  if (body.social_account_id) {
    const { data: acc } = await supabase
      .from('social_accounts')
      .select('id, creator_id')
      .eq('id', body.social_account_id)
      .single()
    if (!acc) return NextResponse.json({ error: 'Social account not found' }, { status: 404 })
    creatorId = acc.creator_id
    accountIds = [acc.id]
  } else if (body.creator_id) {
    creatorId = body.creator_id
    const { data: accounts, error } = await supabase
      .from('social_accounts')
      .select('id')
      .eq('creator_id', body.creator_id)
      .eq('is_active', true)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    accountIds = accounts.map((a) => a.id)
  } else {
    return NextResponse.json({ error: 'social_account_id or creator_id required' }, { status: 400 })
  }

  // Scoped: caller must be able to edit this creator's social accounts.
  const gate = await requireCreatorAccess(creatorId!, 'edit_social')
  if (!gate.ok) return guardResponse(gate)

  if (accountIds.length === 0) {
    return NextResponse.json({ error: 'No active social accounts found' }, { status: 404 })
  }

  // Fetch the account details
  const { data: accounts, error: fetchError } = await supabase
    .from('social_accounts')
    .select('id, username, creator_id, platform')
    .in('id', accountIds)

  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 400 })

  // One path for one account or many: the batch walk already records account
  // status, caches avatars (including for restricted profiles) and saves posts.
  // The old single-account branch retried three times with backoff, which just
  // spent 45s re-confirming that a restricted profile is still restricted.
  const results = await scrapeAndSaveAll(accounts)
  return NextResponse.json({
    results: results.map(r => ({
      account_id: accounts.find(a => a.username.toLowerCase() === r.username.toLowerCase())?.id,
      username: r.username,
      ...(r.status === 'ok' ? { status: 'ok' } : { error: r.error, hint: r.hint }),
    })),
  })
}

// GET /api/admin/scrape?social_account_id=xxx&limit=30
// Returns snapshot history for a social account
export async function GET(req: NextRequest) {
  const base = await requireUser()
  if (!base.ok) return guardResponse(base)

  const accountId = req.nextUrl.searchParams.get('social_account_id')
  const limit = parseInt(req.nextUrl.searchParams.get('limit') ?? '30')

  if (!accountId) return NextResponse.json({ error: 'social_account_id required' }, { status: 400 })

  const supabase = createServerSupabaseClient()

  // Scope: caller must be able to view this account's creator.
  const { data: acc } = await supabase
    .from('social_accounts')
    .select('creator_id')
    .eq('id', accountId)
    .single()
  if (!acc) return NextResponse.json({ error: 'Social account not found' }, { status: 404 })
  const gate = await requireCreatorAccess(acc.creator_id, 'view_social')
  if (!gate.ok) return guardResponse(gate)

  const { data, error } = await supabase
    .from('social_snapshots')
    .select('id, scraped_at, scrape_date, followers, following, post_count, total_views, total_likes, total_comments, raw_data')
    .eq('social_account_id', accountId)
    .order('scraped_at', { ascending: false })
    .limit(limit)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}
