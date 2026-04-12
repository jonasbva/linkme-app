/**
 * Shared Instagram scraping utilities via Apify
 *
 * Key optimizations:
 * - Batched scraping: send multiple usernames in one Apify call
 * - Residential proxy: prevents Instagram from blocking requests
 * - Post-level tracking: upserts individual posts into social_posts table
 * - Lightweight snapshots: scrape_date column for fast date filtering
 */

import { createServerSupabaseClient } from '@/lib/supabase'

const APIFY_TOKEN = process.env.APIFY_API_TOKEN
const BATCH_SIZE = 15 // Max usernames per Apify call to avoid timeout

export interface ScrapeMetrics {
  username: string
  followers: number | null
  following: number | null
  post_count: number | null
  total_views: number
  total_likes: number
  total_comments: number
  raw_data: any
}

export interface ScrapeResult {
  username: string
  status: 'ok' | 'error' | 'skipped'
  metrics?: ScrapeMetrics
  error?: string
  hint?: string
}

/**
 * Scrapes a batch of Instagram usernames in a single Apify call.
 * Returns one result per username (matched by username field in response).
 */
async function scrapeInstagramBatch(usernames: string[]): Promise<Map<string, ScrapeMetrics | { error: string }>> {
  if (!APIFY_TOKEN) throw new Error('APIFY_API_TOKEN is not set')
  if (usernames.length === 0) return new Map()

  const results = new Map<string, ScrapeMetrics | { error: string }>()

  const res = await fetch(
    `https://api.apify.com/v2/acts/apify~instagram-profile-scraper/run-sync-get-dataset-items?token=${APIFY_TOKEN}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usernames,
        resultsLimit: 12, // Get 12 latest posts per profile
        proxyConfiguration: {
          useApifyProxy: true,
        },
      }),
      cache: 'no-store',
    }
  )

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    // If the entire batch fails, mark all as errored
    for (const u of usernames) {
      results.set(u.toLowerCase(), { error: `Apify returned ${res.status}: ${body.slice(0, 200)}` })
    }
    return results
  }

  const items: any[] = await res.json()

  // Match each Apify result back to a username
  // Apify returns results in the same order but username casing may differ
  const profileMap = new Map<string, any>()
  for (const item of items) {
    const uname = (item.username || '').toLowerCase()
    if (uname) profileMap.set(uname, item)
  }

  for (const username of usernames) {
    const profile = profileMap.get(username.toLowerCase())

    if (!profile) {
      results.set(username.toLowerCase(), {
        error: `No data returned for @${username} — account may be private, banned, or username may be wrong`,
      })
      continue
    }

    if (profile.followersCount === undefined && profile.postsCount === undefined) {
      results.set(username.toLowerCase(), {
        error: `Empty profile for @${username} — account may be private or restricted`,
      })
      continue
    }

    const posts: any[] = profile.latestPosts ?? []
    let totalViews = 0, totalLikes = 0, totalComments = 0
    for (const post of posts) {
      totalViews += post.videoViewCount ?? 0
      totalLikes += post.likesCount ?? 0
      totalComments += post.commentsCount ?? 0
    }

    results.set(username.toLowerCase(), {
      username,
      followers: profile.followersCount ?? null,
      following: profile.followsCount ?? null,
      post_count: profile.postsCount ?? null,
      total_views: totalViews,
      total_likes: totalLikes,
      total_comments: totalComments,
      raw_data: profile,
    })
  }

  return results
}

/**
 * Scrapes a single Instagram username with retry logic.
 * Used for individual account scraping (the "Scrape" button on a single account).
 */
export async function scrapeSingleInstagram(username: string, retries = 2): Promise<ScrapeMetrics> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const results = await scrapeInstagramBatch([username])
      const result = results.get(username.toLowerCase())

      if (!result) {
        throw new Error(`No result returned for @${username}`)
      }
      if ('error' in result) {
        throw new Error(result.error)
      }
      return result
    } catch (err: any) {
      lastError = err
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, (attempt + 1) * 2000))
      }
    }
  }

  throw lastError ?? new Error(`Failed to scrape @${username} after ${retries + 1} attempts`)
}

/**
 * Scrapes all given accounts in batches and saves snapshots + post data.
 * Returns results for each account.
 *
 * @param accounts - Array of { id, username, creator_id, platform }
 * @param onProgress - Fires after each individual account is processed
 * @param onBatchStart - Fires when a new batch begins (for keepalive/UI updates)
 */
export async function scrapeAndSaveAll(
  accounts: { id: string; username: string; creator_id: string; platform: string }[],
  onProgress?: (done: number, total: number, username: string, status: 'ok' | 'error', error?: string) => void,
  onBatchStart?: (batchIndex: number, totalBatches: number, usernames: string[]) => void,
): Promise<ScrapeResult[]> {
  const supabase = createServerSupabaseClient()
  const igAccounts = accounts.filter(a => a.platform === 'instagram')
  const results: ScrapeResult[] = []

  // Mark non-Instagram as skipped
  for (const a of accounts) {
    if (a.platform !== 'instagram') {
      results.push({ username: a.username, status: 'skipped', error: 'Platform not yet supported' })
    }
  }

  if (igAccounts.length === 0) return results

  // Split into batches
  const batches: typeof igAccounts[] = []
  for (let i = 0; i < igAccounts.length; i += BATCH_SIZE) {
    batches.push(igAccounts.slice(i, i + BATCH_SIZE))
  }

  let done = 0

  for (let bi = 0; bi < batches.length; bi++) {
    const batch = batches[bi]
    const usernames = batch.map(a => a.username)

    // Notify that a new batch is starting (keeps SSE alive during long Apify calls)
    onBatchStart?.(bi + 1, batches.length, usernames)

    let batchResults: Map<string, ScrapeMetrics | { error: string }>
    try {
      batchResults = await scrapeInstagramBatch(usernames)
    } catch (err: any) {
      // Entire batch failed
      for (const account of batch) {
        done++
        const result: ScrapeResult = {
          username: account.username,
          status: 'error',
          error: err.message,
          hint: 'Batch request failed — try again later',
        }
        results.push(result)
        onProgress?.(done, igAccounts.length, account.username, 'error', err.message)
      }
      continue
    }

    // Process each account in the batch
    for (const account of batch) {
      done++
      const scraped = batchResults.get(account.username.toLowerCase())

      if (!scraped || 'error' in scraped) {
        const errorMsg = scraped && 'error' in scraped ? scraped.error : `No data for @${account.username}`
        results.push({
          username: account.username,
          status: 'error',
          error: errorMsg,
          hint: errorMsg.includes('private') ? 'Account may be private — verify the username is correct and public'
              : errorMsg.includes('No data') ? 'No data returned — check if the Instagram handle exists'
              : 'Scraping failed — try again or verify the username',
        })
        onProgress?.(done, igAccounts.length, account.username, 'error', errorMsg)
        continue
      }

      // Save snapshot (without raw_data for the lightweight row? No — we keep raw_data for post carousel)
      const today = new Date().toISOString().split('T')[0]
      const { error: snapErr } = await supabase
        .from('social_snapshots')
        .insert({
          social_account_id: account.id,
          followers: scraped.followers,
          following: scraped.following,
          post_count: scraped.post_count,
          total_views: scraped.total_views,
          total_likes: scraped.total_likes,
          total_comments: scraped.total_comments,
          raw_data: scraped.raw_data,
          scrape_date: today,
        })

      if (snapErr) {
        results.push({ username: account.username, status: 'error', error: snapErr.message })
        onProgress?.(done, igAccounts.length, account.username, 'error', snapErr.message)
        continue
      }

      // Upsert individual posts into social_posts for per-post tracking
      const posts: any[] = scraped.raw_data?.latestPosts ?? []
      for (const post of posts) {
        if (!post.shortCode) continue
        await supabase
          .from('social_posts')
          .upsert({
            social_account_id: account.id,
            post_short_code: post.shortCode,
            post_type: post.type ?? null,
            caption: (post.caption ?? '').slice(0, 2000),
            display_url: post.displayUrl ?? null,
            post_timestamp: post.timestamp ? new Date(post.timestamp * 1000).toISOString() : null,
            video_view_count: post.videoViewCount ?? 0,
            likes_count: post.likesCount ?? 0,
            comments_count: post.commentsCount ?? 0,
            last_seen_at: new Date().toISOString(),
            last_views: post.videoViewCount ?? 0,
            last_likes: post.likesCount ?? 0,
            last_comments: post.commentsCount ?? 0,
          }, {
            onConflict: 'social_account_id,post_short_code',
          })
      }

      results.push({ username: account.username, status: 'ok', metrics: scraped })
      onProgress?.(done, igAccounts.length, account.username, 'ok')
    }
  }

  return results
}
