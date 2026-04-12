import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { getSessionUser } from '@/lib/auth'

// GET /api/admin/social-snapshots?creator_id=xxx&start=YYYY-MM-DD&end=YYYY-MM-DD
// Returns for each social account: the snapshot closest to start and closest to end,
// plus all snapshots in range for charting.
export async function GET(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const creatorId = req.nextUrl.searchParams.get('creator_id')
  const start = req.nextUrl.searchParams.get('start') // YYYY-MM-DD
  const end = req.nextUrl.searchParams.get('end')     // YYYY-MM-DD

  if (!creatorId) return NextResponse.json({ error: 'creator_id required' }, { status: 400 })

  const supabase = createServerSupabaseClient()

  // Get all social accounts for this creator
  const { data: accounts, error: accErr } = await supabase
    .from('social_accounts')
    .select('*')
    .eq('creator_id', creatorId)
    .order('created_at', { ascending: true })

  if (accErr) return NextResponse.json({ error: accErr.message }, { status: 400 })
  if (!accounts || accounts.length === 0) {
    return NextResponse.json({ accounts: [], totals: null })
  }

  const startDate = start || new Date().toISOString().split('T')[0]
  const endDate = end || new Date().toISOString().split('T')[0]
  const startTs = startDate + 'T00:00:00.000Z'
  const endTs = endDate + 'T23:59:59.999Z'

  const result = []

  for (const account of accounts) {
    // Get the latest snapshot at or before the end date (the "current" value)
    const { data: endSnaps } = await supabase
      .from('social_snapshots')
      .select('*')
      .eq('social_account_id', account.id)
      .lte('scraped_at', endTs)
      .order('scraped_at', { ascending: false })
      .limit(1)

    // Get the latest snapshot at or before the start date (the "baseline" value)
    const { data: startSnaps } = await supabase
      .from('social_snapshots')
      .select('*')
      .eq('social_account_id', account.id)
      .lte('scraped_at', startTs)
      .order('scraped_at', { ascending: false })
      .limit(1)

    // Get all snapshots in range for timeline/charting
    const { data: rangeSnaps } = await supabase
      .from('social_snapshots')
      .select('id, scraped_at, followers, following, post_count, total_views, total_likes, total_comments')
      .eq('social_account_id', account.id)
      .gte('scraped_at', startTs)
      .lte('scraped_at', endTs)
      .order('scraped_at', { ascending: true })

    const endSnapshot = endSnaps?.[0] ?? null
    const startSnapshot = startSnaps?.[0] ?? null

    result.push({
      ...account,
      snapshot: endSnapshot,
      startSnapshot,
      rangeSnapshots: rangeSnaps ?? [],
    })
  }

  // Compute totals with deltas
  const totals = {
    followers: 0,
    views: 0,
    likes: 0,
    comments: 0,
    followersDelta: 0,
    viewsDelta: 0,
    likesDelta: 0,
    commentsDelta: 0,
  }

  for (const acc of result) {
    const end = acc.snapshot
    const start = acc.startSnapshot
    totals.followers += end?.followers ?? 0
    totals.views += end?.total_views ?? 0
    totals.likes += end?.total_likes ?? 0
    totals.comments += end?.total_comments ?? 0

    if (start && end) {
      totals.followersDelta += (end.followers ?? 0) - (start.followers ?? 0)
      totals.viewsDelta += (end.total_views ?? 0) - (start.total_views ?? 0)
      totals.likesDelta += (end.total_likes ?? 0) - (start.total_likes ?? 0)
      totals.commentsDelta += (end.total_comments ?? 0) - (start.total_comments ?? 0)
    }
  }

  return NextResponse.json({ accounts: result, totals })
}
