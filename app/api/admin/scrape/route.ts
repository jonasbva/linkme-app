import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase'

function isAdmin() {
  return cookies().get('admin_auth')?.value === 'true'
}

// Scrapes public Instagram profile stats via Apify
async function scrapeInstagram(username: string) {
  const token = process.env.APIFY_API_TOKEN
  if (!token) throw new Error('APIFY_API_TOKEN is not set')

  const res = await fetch(
    `https://api.apify.com/v2/acts/apify~instagram-profile-scraper/run-sync-get-dataset-items?token=${token}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usernames: [username] }),
      cache: 'no-store',
    }
  )

  if (!res.ok) {
    throw new Error(`Apify returned ${res.status} for @${username}`)
  }

  const items = await res.json()
  const profile = items?.[0]

  if (!profile) {
    throw new Error(`No data returned from Apify for @${username}`)
  }

  // Aggregate stats from latest posts
  const posts: any[] = profile.latestPosts ?? []
  let totalViews = 0
  let totalLikes = 0
  let totalComments = 0

  for (const post of posts) {
    totalViews += post.videoViewCount ?? 0
    totalLikes += post.likesCount ?? 0
    totalComments += post.commentsCount ?? 0
  }

  return {
    followers: profile.followersCount ?? null,
    following: profile.followsCount ?? null,
    post_count: profile.postsCount ?? null,
    total_views: totalViews,
    total_likes: totalLikes,
    total_comments: totalComments,
    raw_data: profile,
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
    .select('id, scraped_at, followers, following, post_count, total_views, total_likes, total_comments, raw_data')
    .eq('social_account_id', accountId)
    .order('scraped_at', { ascending: false })
    .limit(limit)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}
