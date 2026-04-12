import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { getSessionUser } from '@/lib/auth'

// Lightweight columns — everything except raw_data (which can be 50-100KB per row)
const LIGHT_COLS = 'id, social_account_id, scraped_at, scrape_date, followers, following, post_count, total_views, total_likes, total_comments'

// GET /api/admin/social-snapshots?creator_id=xxx&start=YYYY-MM-DD&end=YYYY-MM-DD
// Returns for each social account: the snapshot closest to start and closest to end,
// plus all snapshots in range for charting.
// Only the end snapshot includes raw_data (for the post carousel).
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

  const result = []

  for (const account of accounts) {
    // End snapshot: full data (includes raw_data for post carousel)
    const { data: endSnaps } = await supabase
      .from('social_snapshots')
      .select('*')
      .eq('social_account_id', account.id)
      .lte('scrape_date', endDate)
      .order('scraped_at', { ascending: false })
      .limit(1)

    // Start snapshot: lightweight (no raw_data needed, just numbers for delta calculation)
    const { data: startSnaps } = await supabase
      .from('social_snapshots')
      .select(LIGHT_COLS)
      .eq('social_account_id', account.id)
      .lte('scrape_date', startDate)
      .order('scraped_at', { ascending: false })
      .limit(1)

    // Range snapshots: lightweight (for charting)
    const { data: rangeSnaps } = await supabase
      .from('social_snapshots')
      .select(LIGHT_COLS)
      .eq('social_account_id', account.id)
      .gte('scrape_date', startDate)
      .lte('scrape_date', endDate)
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
    const endSnap = acc.snapshot
    const startSnap = acc.startSnapshot
    totals.followers += endSnap?.followers ?? 0
    totals.views += endSnap?.total_views ?? 0
    totals.likes += endSnap?.total_likes ?? 0
    totals.comments += endSnap?.total_comments ?? 0

    if (startSnap && endSnap) {
      totals.followersDelta += (endSnap.followers ?? 0) - (startSnap.followers ?? 0)
      totals.viewsDelta += (endSnap.total_views ?? 0) - (startSnap.total_views ?? 0)
      totals.likesDelta += (endSnap.total_likes ?? 0) - (startSnap.total_likes ?? 0)
      totals.commentsDelta += (endSnap.total_comments ?? 0) - (startSnap.total_comments ?? 0)
    }
  }

  return NextResponse.json({ accounts: result, totals })
}
