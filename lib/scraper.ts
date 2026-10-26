/**
 * Shared Instagram scraping utilities via Apify
 *
 * Key optimizations:
 * - Batched scraping: send multiple usernames in one Apify call
 * - Residential proxy: prevents Instagram from blocking requests
 * - Post-level tracking: upserts individual posts into social_posts table
 * - Lightweight snapshots: scrape_date column for fast date filtering
 */

import { createClient } from '@supabase/supabase-js'
import { createServerSupabaseClient } from '@/lib/supabase'

const APIFY_TOKEN = process.env.APIFY_API_TOKEN
const BATCH_SIZE = 15 // Max usernames per Apify call to avoid timeout

/**
 * Normalise a post timestamp to an ISO string, or null if unusable.
 *
 * Apify sends `timestamp` as an ISO string ("2024-06-30T22:06:22.000Z"), but
 * older payloads used unix seconds. This accepted numbers only, so every post
 * landed with a NULL post_timestamp — handle both, and milliseconds too.
 */
function safeTimestamp(ts: unknown): string | null {
  if (ts == null) return null
  try {
    let d: Date
    if (typeof ts === 'number') {
      // Seconds vs milliseconds: anything below ~1e12 is seconds.
      d = new Date(ts < 1e12 ? ts * 1000 : ts)
    } else if (typeof ts === 'string') {
      const numeric = Number(ts)
      d = Number.isFinite(numeric) && ts.trim() !== ''
        ? new Date(numeric < 1e12 ? numeric * 1000 : numeric)
        : new Date(ts)
    } else {
      return null
    }
    if (isNaN(d.getTime())) return null
    return d.toISOString()
  } catch {
    return null
  }
}

/**
 * Why Instagram gave us nothing usable.
 *
 *  removed    — no item at all: the handle is gone, banned, or misspelt
 *  private    — exists, flagged private
 *  restricted — exists and public, but hidden from logged-out viewers, so
 *               Instagram withholds counts and posts. Identity and avatar
 *               still come through, which is why this still yields a picture.
 *  transient  — Apify itself failed (HTTP error, rate limit). Says nothing
 *               about the account, so the stored status is left alone.
 */
export type ScrapeFailureReason = 'removed' | 'private' | 'restricted' | 'transient'

export interface ScrapeFailure {
  error: string
  reason: ScrapeFailureReason
  /** Present for restricted/private accounts — still worth caching. */
  profile_pic_url?: string | null
}

export interface ScrapeMetrics {
  username: string
  followers: number | null
  following: number | null
  post_count: number | null
  total_views: number
  total_likes: number
  total_comments: number
  /** Instagram CDN avatar. Signed and expiring, so it is refreshed every scrape. */
  profile_pic_url: string | null
  /** The link in the bio, if the account carries one. Usually null — see bioLink(). */
  bio_link: string | null
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
async function scrapeInstagramBatch(usernames: string[]): Promise<Map<string, ScrapeMetrics | ScrapeFailure>> {
  if (!APIFY_TOKEN) throw new Error('APIFY_API_TOKEN is not set')
  if (usernames.length === 0) return new Map()

  const results = new Map<string, ScrapeMetrics | ScrapeFailure>()

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
      results.set(u.toLowerCase(), {
        error: `Apify returned ${res.status}: ${body.slice(0, 200)}`,
        reason: 'transient',
      })
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

    // No item at all: Instagram does not serve this handle any more.
    if (!profile) {
      results.set(username.toLowerCase(), {
        error: `@${username} is not available on Instagram — removed, banned, or the handle is wrong`,
        reason: 'removed',
      })
      continue
    }

    // An item without counts means Instagram withheld the profile body. Two
    // very different things look identical at this point, and the avatar is
    // what separates them: a RESTRICTED account still hands back its identity
    // and picture, while a REMOVED one comes back as a bare shell with no
    // avatar at all. (Verified against a known-restricted and a known-removed
    // handle — Instagram's own page says "Restricted profile" vs "Profile
    // isn't available", and only the former carries profilePicUrl.)
    if (profile.followersCount === undefined && profile.postsCount === undefined) {
      const pic = profile.profilePicUrlHD || profile.profilePicUrl || null

      if (!pic) {
        results.set(username.toLowerCase(), {
          error: `@${username} is not available on Instagram — removed, banned, or the handle is wrong`,
          reason: 'removed',
        })
        continue
      }

      const isPrivate = profile.private === true
      results.set(username.toLowerCase(), {
        error: isPrivate
          ? `@${username} is private`
          : `@${username} is restricted — Instagram hides it from logged-out visitors`,
        reason: isPrivate ? 'private' : 'restricted',
        profile_pic_url: pic,
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
      profile_pic_url: profile.profilePicUrlHD || profile.profilePicUrl || null,
      bio_link: bioLink(profile),
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
  onProgress?: (done: number, total: number, username: string, status: 'ok' | 'error', error?: string) => void | Promise<void>,
  onBatchStart?: (batchIndex: number, totalBatches: number, usernames: string[]) => void | Promise<void>,
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

    // Notify that a new batch is starting
    await onBatchStart?.(bi + 1, batches.length, usernames)

    let batchResults: Map<string, ScrapeMetrics | ScrapeFailure>
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
        await onProgress?.(done, igAccounts.length, account.username, 'error', err.message)
      }
      continue
    }

    // Process each account in the batch
    for (const account of batch) {
      done++
      const scraped = batchResults.get(account.username.toLowerCase())

      if (!scraped || 'error' in scraped) {
        const failure = scraped && 'error' in scraped ? scraped : null
        const errorMsg = failure?.error ?? `No data for @${account.username}`
        const reason = failure?.reason ?? 'removed'

        if (reason !== 'transient') await recordAccountStatus(account.id, reason, errorMsg)

        // A restricted or private account still returns its avatar, so the
        // creator keeps a picture even while the profile itself is dark.
        if (failure?.profile_pic_url) {
          const stored = await cacheProfilePic(account.id, failure.profile_pic_url)
          if (stored) await refreshCreatorAvatar(account.creator_id)
        }

        results.push({
          username: account.username,
          status: 'error',
          error: errorMsg,
          hint: reason === 'restricted'
              ? 'Instagram is hiding this profile from logged-out visitors — it needs unrestricting'
              : reason === 'private'
              ? 'Switch the account to public so it can be tracked'
              : reason === 'transient'
              ? 'Scraping service error — the next run retries this account'
              : 'Not available on Instagram — check the handle, or the account is gone',
        })
        await onProgress?.(done, igAccounts.length, account.username, 'error', errorMsg)
        continue
      }

      const saveErr = await saveScrapedAccount(account, scraped)
      if (!saveErr) await recordAccountStatus(account.id, 'ok', null)
      if (saveErr) {
        results.push({ username: account.username, status: 'error', error: saveErr })
        await onProgress?.(done, igAccounts.length, account.username, 'error', saveErr)
        continue
      }

      results.push({ username: account.username, status: 'ok', metrics: scraped })
      await onProgress?.(done, igAccounts.length, account.username, 'ok')
    }
  }

  return results
}


/**
 * Point a creator's avatar at one of its Instagram accounts.
 *
 * Preference order: the account whose picture was refreshed most recently, so
 * the creator always shows a live (non-expired) URL. Creators with no scraped
 * account keep whatever avatar they already had.
 */
export async function refreshCreatorAvatar(creatorId: string): Promise<string | null> {
  const supabase = createServerSupabaseClient()

  const { data: accounts } = await supabase
    .from('social_accounts')
    .select('profile_pic_url, profile_pic_updated_at')
    .eq('creator_id', creatorId)
    .eq('is_active', true)
    .not('profile_pic_url', 'is', null)
    .order('profile_pic_updated_at', { ascending: false, nullsFirst: false })
    .limit(1)

  const pic = accounts?.[0]?.profile_pic_url || null
  if (!pic) return null

  await supabase.from('creators').update({ avatar_url: pic }).eq('id', creatorId)
  return pic
}


/**
 * Copy an Instagram avatar into Supabase storage and return a permanent URL.
 *
 * Instagram's CDN links are signed and expire within about a day, so storing
 * them directly would leave most avatars broken. Instead we pull the bytes once
 * per scrape and overwrite a stable object per account, giving a URL that keeps
 * working between scrapes. A cache-busting suffix makes the swap visible.
 *
 * Failure here is never fatal — the scrape itself has already succeeded.
 */
export async function cacheProfilePic(socialAccountId: string, igUrl: string): Promise<string | null> {
  const AVATAR_BUCKET = 'creators'
  const MAX_BYTES = 5 * 1024 * 1024

  try {
    const res = await fetch(igUrl, { redirect: 'follow' })
    if (!res.ok) return null

    const contentType = res.headers.get('content-type') || ''
    if (!contentType.startsWith('image/')) return null

    const buffer = new Uint8Array(await res.arrayBuffer())
    if (buffer.byteLength === 0 || buffer.byteLength > MAX_BYTES) return null

    // A clean client: the shared one forces cache:'no-store', which the storage
    // SDK does not expect.
    const storage = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } },
    )

    const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg'
    const path = `avatars/${socialAccountId}.${ext}`

    const { error } = await storage.storage
      .from(AVATAR_BUCKET)
      .upload(path, buffer, { contentType, upsert: true })
    if (error) return null

    const { data } = storage.storage.from(AVATAR_BUCKET).getPublicUrl(path)
    const publicUrl = `${data.publicUrl}?v=${Date.now()}`

    const supabase = createServerSupabaseClient()
    await supabase
      .from('social_accounts')
      .update({ profile_pic_url: publicUrl, profile_pic_updated_at: new Date().toISOString() })
      .eq('id', socialAccountId)

    return publicUrl
  } catch {
    return null
  }
}


/**
 * The link in the account's Instagram bio, if it has one.
 *
 * Most of these accounts leave the bio link empty and send people to a story
 * highlight instead, so null is the common answer. When there is one it is
 * usually a link-in-bio page (link.me, sltb.io), not the OnlyFans tracking
 * link itself — Instagram only ever exposes this first hop.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function bioLink(profile: any): string | null {
  const direct = typeof profile?.externalUrl === 'string' ? profile.externalUrl.trim() : ''
  if (direct) return direct
  const list = Array.isArray(profile?.externalUrls) ? profile.externalUrls : []
  for (const entry of list) {
    const url = typeof entry === 'string' ? entry : entry?.url
    if (typeof url === 'string' && url.trim()) return url.trim()
  }
  return null
}

/**
 * Persist one scraped account: snapshot row, cached avatar, and its posts.
 *
 * Shared by the batch walk and the single-account admin scrape. Those two had
 * separate copies and drifted — the single-account one kept an older timestamp
 * parser and never refreshed avatars — so this is the one place it happens.
 *
 * Returns an error message, or null on success.
 */
export async function saveScrapedAccount(
  account: { id: string; creator_id: string; username: string },
  scraped: ScrapeMetrics,
): Promise<string | null> {
  const supabase = createServerSupabaseClient()
  const today = new Date().toISOString().split('T')[0]

  const { error: snapErr } = await supabase.from('social_snapshots').insert({
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
  if (snapErr) return snapErr.message

  // Record the bio link on every scrape, including when there is none — an
  // account that stopped carrying a link is exactly what we want to notice.
  await supabase
    .from('social_accounts')
    .update({ bio_link: scraped.bio_link ?? null, bio_link_checked_at: new Date().toISOString() })
    .eq('id', account.id)

  // Instagram's own avatar links expire within about a day, so cache the bytes.
  if (scraped.profile_pic_url) {
    const stored = await cacheProfilePic(account.id, scraped.profile_pic_url)
    if (stored) await refreshCreatorAvatar(account.creator_id)
  }

  // One batched upsert rather than a round trip per post.
  const posts: any[] = scraped.raw_data?.latestPosts ?? []
  const now = new Date().toISOString()
  const postRows = posts
    .filter(p => p.shortCode)
    .map(post => ({
      social_account_id: account.id,
      post_short_code: post.shortCode,
      post_type: post.type ?? null,
      caption: (post.caption ?? '').slice(0, 2000),
      display_url: post.displayUrl ?? null,
      post_timestamp: safeTimestamp(post.timestamp),
      video_view_count: post.videoViewCount ?? 0,
      likes_count: post.likesCount ?? 0,
      comments_count: post.commentsCount ?? 0,
      last_seen_at: now,
      last_views: post.videoViewCount ?? 0,
      last_likes: post.likesCount ?? 0,
      last_comments: post.commentsCount ?? 0,
    }))

  if (postRows.length > 0) {
    const { error } = await supabase
      .from('social_posts')
      .upsert(postRows, { onConflict: 'social_account_id,post_short_code' })
    if (error) return error.message
  }

  return null
}


/**
 * Record whether Instagram served this account's profile on the last attempt.
 *
 * Instagram hides a *restricted* profile from logged-out viewers exactly as it
 * hides a removed one, and the scraper sees the same emptiness either way — so
 * this records reachability, not a verdict on why. `consecutive_failures`
 * separates a one-off blip from an account that is genuinely dark: the longer
 * the streak, the less likely it is transient.
 */
export async function recordAccountStatus(
  socialAccountId: string,
  status: 'ok' | Exclude<ScrapeFailureReason, 'transient'>,
  detail: string | null,
): Promise<void> {
  const supabase = createServerSupabaseClient()

  if (status === 'ok') {
    await supabase
      .from('social_accounts')
      .update({
        status: 'ok',
        status_detail: null,
        status_checked_at: new Date().toISOString(),
        consecutive_failures: 0,
      })
      .eq('id', socialAccountId)
    return
  }

  const { data: current } = await supabase
    .from('social_accounts')
    .select('consecutive_failures')
    .eq('id', socialAccountId)
    .maybeSingle()

  await supabase
    .from('social_accounts')
    .update({
      status,
      status_detail: detail,
      status_checked_at: new Date().toISOString(),
      consecutive_failures: (current?.consecutive_failures ?? 0) + 1,
    })
    .eq('id', socialAccountId)
}
