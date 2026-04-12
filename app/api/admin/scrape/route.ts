import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { getSessionUser } from '@/lib/auth'
import { scrapeSingleInstagram, scrapeAndSaveAll } from '@/lib/scraper'

// POST /api/admin/scrape
// Body: { social_account_id: string } — scrapes that one account
// Or:   { creator_id: string }        — scrapes ALL active accounts for that creator (batched)
export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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
    .select('id, username, creator_id, platform')
    .in('id', accountIds)

  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 400 })

  // Single account = use retry logic; multiple = use batched scraping
  if (accounts.length === 1 && accounts[0].platform === 'instagram') {
    const account = accounts[0]
    try {
      const metrics = await scrapeSingleInstagram(account.username)
      const today = new Date().toISOString().split('T')[0]
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
          scrape_date: today,
        })
        .select()
        .single()

      if (insertError) {
        return NextResponse.json({ results: [{ account_id: account.id, username: account.username, error: insertError.message }] })
      }

      // Upsert posts
      const posts: any[] = metrics.raw_data?.latestPosts ?? []
      for (const post of posts) {
        if (!post.shortCode) continue
        await supabase.from('social_posts').upsert({
          social_account_id: account.id,
          post_short_code: post.shortCode,
          post_type: post.type ?? null,
          caption: (post.caption ?? '').slice(0, 2000),
          display_url: post.displayUrl ?? null,
          post_timestamp: post.timestamp && typeof post.timestamp === 'number' && !isNaN(new Date(post.timestamp * 1000).getTime()) ? new Date(post.timestamp * 1000).toISOString() : null,
          video_view_count: post.videoViewCount ?? 0,
          likes_count: post.likesCount ?? 0,
          comments_count: post.commentsCount ?? 0,
          last_seen_at: new Date().toISOString(),
          last_views: post.videoViewCount ?? 0,
          last_likes: post.likesCount ?? 0,
          last_comments: post.commentsCount ?? 0,
        }, { onConflict: 'social_account_id,post_short_code' })
      }

      return NextResponse.json({ results: [{ account_id: account.id, username: account.username, snapshot }] })
    } catch (err: any) {
      return NextResponse.json({ results: [{
        account_id: account.id,
        username: account.username,
        error: err.message,
        hint: err.message.includes('private') ? 'Account may be private — verify the username is correct and public'
            : err.message.includes('No data') ? 'No data returned — check if the Instagram handle exists'
            : 'Scraping failed — try again or verify the username',
      }] })
    }
  }

  // Multiple accounts: use batched scraping
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
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const accountId = req.nextUrl.searchParams.get('social_account_id')
  const limit = parseInt(req.nextUrl.searchParams.get('limit') ?? '30')

  if (!accountId) return NextResponse.json({ error: 'social_account_id required' }, { status: 400 })

  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('social_snapshots')
    .select('id, scraped_at, scrape_date, followers, following, post_count, total_views, total_likes, total_comments, raw_data')
    .eq('social_account_id', accountId)
    .order('scraped_at', { ascending: false })
    .limit(limit)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}
