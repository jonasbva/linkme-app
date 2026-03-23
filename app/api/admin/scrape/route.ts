import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase'

function isAdmin() {
  return cookies().get('admin_auth')?.value === 'true'
}

// Scrapes public Instagram profile stats for a given username
async function scrapeInstagram(username: string) {
  const url = `https://i.instagram.com/api/v1/users/web_profile_info/?username=${username}`

  const res = await fetch(url, {
    headers: {
      'x-ig-app-id': '936619743392459',
      'User-Agent':
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      Accept: '*/*',
      'Accept-Language': 'en-US,en;q=0.9',
      Referer: 'https://www.instagram.com/',
    },
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error(`Instagram returned ${res.status} for @${username}`)
  }

  const json = await res.json()
  const user = json?.data?.user

  if (!user) {
    throw new Error(`No user data found for @${username}`)
  }

  // Pull aggregate stats from recent media (reels + posts)
  const edges: any[] = user.edge_owner_to_timeline_media?.edges ?? []
  let totalViews = 0
  let totalLikes = 0
  let totalComments = 0

  for (const edge of edges) {
    const node = edge.node
    totalViews += node.video_view_count ?? 0
    totalLikes += node.edge_liked_by?.count ?? 0
    totalComments += node.edge_media_to_comment?.count ?? 0
  }

  return {
    followers: user.edge_followed_by?.count ?? null,
    following: user.edge_follow?.count ?? null,
    post_count: user.edge_owner_to_timeline_media?.count ?? null,
    total_views: totalViews,
    total_likes: totalLikes,
    total_comments: totalComments,
    raw_data: user,
  }
}

// POST /api/admin/scrape
// Body: { social_account_id: string } — scrapes that account and saves a snapshot
// Or:   { creator_id: string }        — scrapes ALL active accounts for that creator
export async function POST(req: NextRequest) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const supabase = createServerSupabaseClient()

  // Resolve which social accounts to scrape
  let accountIds: string[] = []

  if (body.social_account_id) {
    accountIds = [body.social_account_id]
  } else if (body.creator_id) {
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

  if (accountIds.length === 0) {
    return NextResponse.json({ error: 'No active social accounts found' }, { status: 404 })
  }

  // Fetch the account details
  const { data: accounts, error: fetchError } = await supabase
    .from('social_accounts')
    .select('*')
    .in('id', accountIds)

  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 400 })

  const results = []

  for (const account of accounts) {
    try {
      let metrics

      if (account.platform === 'instagram') {
        metrics = await scrapeInstagram(account.username)
      } else {
        results.push({ account_id: account.id, username: account.username, error: 'Platform not yet supported' })
        continue
      }

      // Save the snapshot
      const { data: snapshot, error: insertError } = await supabase
        .from('social_snapshots')
        .insert({
          social_account_id: account.id,
          followers: metrics.followers,
          following: metrics.following,
          post_count: metrics.post_count,
          total_views: metrics.total_views,
          total_likes: metrics.total_likes,
          total_comments: metrics.total_comments,
          raw_data: metrics.raw_data,
        })
        .select()
        .single()

      if (insertError) {
        results.push({ account_id: account.id, username: account.username, error: insertError.message })
      } else {
        results.push({ account_id: account.id, username: account.username, snapshot })
      }
    } catch (err: any) {
      results.push({ account_id: account.id, username: account.username, error: err.message })
    }
  }

  return NextResponse.json({ results })
}

// GET /api/admin/scrape?social_account_id=xxx&limit=30
// Returns snapshot history for a social account
export async function GET(req: NextRequest) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const accountId = req.nextUrl.searchParams.get('social_account_id')
  const limit = parseInt(req.nextUrl.searchParams.get('limit') ?? '30')

  if (!accountId) return NextResponse.json({ error: 'social_account_id required' }, { status: 400 })

  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('social_snapshots')
    .select('id, scraped_at, followers, following, post_count, total_views, total_likes, total_comments')
    .eq('social_account_id', accountId)
    .order('scraped_at', { ascending: false })
    .limit(limit)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}
