import { createServerSupabaseClient } from './supabase'
import { decryptSecret } from './infloww-crypto'

// Shared Infloww revenue-cache rebuild logic.
//
// This was previously inlined in app/api/cron/revenue-cache/route.ts and
// invoked over HTTP (with a CRON_SECRET bearer) by the admin cache route.
// It now lives here so both the cron route and the admin cache route can call
// it in-process — no internal HTTP hop, no shared-secret coupling.

const INFLOWW_BASE = 'https://openapi.infloww.com'

interface InflowwTransaction {
  id: string
  transactionId: string
  fanId: string
  fanName: string
  createdTime: string
  type: string
  tipSource?: string
  status: string
  amount: string
  fee: string
  net: string
  currency: string
}

interface InflowwCreator {
  id: string
  name: string
  nickName: string
  userName: string
  tagName: string
}

// ─── Rate Limiter ───────────────────────────────────────────────────
let lastRequestTime = 0
const MIN_REQUEST_GAP_MS = 600
const requestTimestamps: number[] = []
const MAX_REQUESTS_PER_MINUTE = 50

async function rateLimitedFetch(
  url: string,
  headers: Record<string, string>,
  maxRetries = 3
): Promise<Response> {
  const now = Date.now()
  while (requestTimestamps.length > 0 && requestTimestamps[0] < now - 60000) {
    requestTimestamps.shift()
  }

  if (requestTimestamps.length >= MAX_REQUESTS_PER_MINUTE) {
    const waitUntil = requestTimestamps[0] + 60000
    const waitMs = waitUntil - Date.now() + 100
    if (waitMs > 0) await new Promise((r) => setTimeout(r, waitMs))
  }

  const elapsed = Date.now() - lastRequestTime
  if (elapsed < MIN_REQUEST_GAP_MS) {
    await new Promise((r) => setTimeout(r, MIN_REQUEST_GAP_MS - elapsed))
  }
  lastRequestTime = Date.now()
  requestTimestamps.push(Date.now())

  const response = await fetch(url, { headers, cache: 'no-store' })

  if (response.status === 429) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const retryAfter = parseInt(response.headers.get('retry-after') || '0', 10)
      const backoffMs = Math.max(retryAfter * 1000, attempt * 2000)
      console.warn(`[revenue-cache] Rate limited (429). Retrying in ${backoffMs}ms (attempt ${attempt}/${maxRetries})`)
      await new Promise((r) => setTimeout(r, backoffMs))
      lastRequestTime = Date.now()
      requestTimestamps.push(Date.now())
      const retryResponse = await fetch(url, { headers, cache: 'no-store' })
      if (retryResponse.status !== 429) return retryResponse
    }
    throw new Error('Infloww API rate limit exceeded after retries')
  }

  return response
}

async function fetchAllPages(
  endpoint: string,
  params: Record<string, string>,
  headers: Record<string, string>
): Promise<unknown[]> {
  const allItems: unknown[] = []
  let hasMore = true
  const queryParams = new URLSearchParams(params)

  while (hasMore) {
    const url = `${INFLOWW_BASE}${endpoint}?${queryParams.toString()}`
    const response = await rateLimitedFetch(url, headers)

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}))
      throw new Error(
        `Infloww API error (${response.status}): ${(errBody as any).errorMessage || response.statusText}`
      )
    }

    const body = await response.json()
    const items = (body as any)?.data?.list || []
    allItems.push(...items)

    hasMore = (body as any)?.hasMore === true
    const cursor = (body as any)?.cursor
    if (hasMore && cursor) {
      queryParams.set('cursor', cursor)
    } else {
      break
    }
  }

  return allItems
}

function calculateBreakdown(transactions: InflowwTransaction[]) {
  let totalGross = 0, totalNet = 0, subscriptionNet = 0, recurringSubNet = 0
  let newSubNet = 0, messageNet = 0, tipNet = 0, otherNet = 0

  for (const t of transactions) {
    const gross = parseInt(t.amount) / 100
    const net = parseInt(t.net) / 100
    totalGross += gross
    totalNet += net

    switch (t.type) {
      case 'Subscription': subscriptionNet += net; newSubNet += net; break
      case 'Recurring Subscription': subscriptionNet += net; recurringSubNet += net; break
      case 'Messages': messageNet += net; break
      case 'Tips': tipNet += net; break
      default: otherNet += net; break
    }
  }

  const round = (n: number) => Math.round(n * 100) / 100
  return {
    totalGross: round(totalGross), totalNet: round(totalNet),
    subscriptionNet: round(subscriptionNet), recurringSubNet: round(recurringSubNet),
    newSubNet: round(newSubNet), messageNet: round(messageNet),
    tipNet: round(tipNet), otherNet: round(otherNet),
  }
}

// ─── Cache key resolution (must match the admin cache route) ────────
const LIVE_WINDOW_MS = 2 * 60 * 1000 // 2 minutes
const LIVE_BUCKET_MS = 60 * 1000     // 1 minute

function floorToMinute(ms: number): number {
  return Math.floor(ms / LIVE_BUCKET_MS) * LIVE_BUCKET_MS
}

export function isLiveRange(toMs: number, nowMs: number): boolean {
  return Math.abs(nowMs - toMs) <= LIVE_WINDOW_MS
}

export function buildCacheKey(fromMs: number, toMs: number, nowMs: number): string {
  if (isLiveRange(toMs, nowMs)) {
    return `live:${fromMs}-${floorToMinute(toMs)}`
  }
  return `rng:${fromMs}-${toMs}`
}

export function parseMaybeMs(v: string | null): number | null {
  if (!v) return null
  if (/^\d+$/.test(v)) return parseInt(v, 10)
  const t = Date.parse(v)
  return Number.isFinite(t) ? t : null
}

function pad(n: number) { return String(n).padStart(2, '0') }
function localYmd(d: Date) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` }

// Resolve a [fromMs, toMs] window from cron/admin query params:
// explicit from/to → legacy ?date=YYYY-MM-DD → default (today 00:00 → now).
export function resolveRevenueRange(searchParams: URLSearchParams): { fromMs: number; toMs: number } {
  const fromParam = parseMaybeMs(searchParams.get('from'))
  const toParam = parseMaybeMs(searchParams.get('to'))
  const dateParam = searchParams.get('date')

  const now = new Date()
  const nowMs = now.getTime()

  if (fromParam !== null && toParam !== null) {
    return { fromMs: fromParam, toMs: toParam }
  }
  if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
    const startOfDay = new Date(dateParam + 'T00:00:00')
    const endOfDay = new Date(dateParam + 'T23:59:59.999')
    const todayStr = localYmd(now)
    return {
      fromMs: startOfDay.getTime(),
      toMs: dateParam === todayStr ? nowMs : endOfDay.getTime(),
    }
  }
  const startOfDay = new Date(now)
  startOfDay.setHours(0, 0, 0, 0)
  return { fromMs: startOfDay.getTime(), toMs: nowMs }
}

export type RebuildResult =
  | { ok: true; cacheKey: string; totalRevenue: number; creators: number; fromMs: number; toMs: number; fetchedAt: string }
  | { ok: true; skipped: true; reason: string }
  | { ok: false; status: number; error: string }

// Fetch revenue from Infloww for [fromMs, toMs] and write it to revenue_cache.
// Returns a plain result object; callers map it to an HTTP response.
export async function rebuildRevenueCache(fromMs: number, toMs: number): Promise<RebuildResult> {
  const supabase = createServerSupabaseClient()

  const { data: config } = await supabase
    .from('infloww_config')
    .select('api_key, agency_oid, fetching_enabled')
    .limit(1)
    .single()

  if (config?.fetching_enabled === false) {
    console.log('[revenue-cache] Revenue fetching is disabled. Skipping.')
    return { ok: true, skipped: true, reason: 'fetching_disabled' }
  }

  const apiKey = await decryptSecret(config?.api_key)
  if (!apiKey || !config?.agency_oid) {
    return { ok: false, status: 400, error: 'Infloww API not configured' }
  }

  const apiHeaders = {
    Accept: 'application/json',
    Authorization: apiKey,
    'x-oid': config.agency_oid,
  }

  try {
    const now = new Date()
    const nowMs = now.getTime()

    const startDate = new Date(fromMs)
    const endDate = new Date(toMs)
    const startTime = String(fromMs)
    const endTime = String(toMs)

    // 14d lookback anchored at the range start (for sub averages)
    const start14d = new Date(startDate)
    start14d.setDate(start14d.getDate() - 14)
    start14d.setHours(0, 0, 0, 0)
    const startTime14d = String(start14d.getTime())

    console.log(`[revenue-cache] Fetching creator list for range ${startDate.toISOString()} → ${endDate.toISOString()}`)
    const creators = (await fetchAllPages(
      '/v1/creators',
      { platformCode: 'OnlyFans', limit: '100' },
      apiHeaders
    )) as InflowwCreator[]

    // Update creators cache
    for (const c of creators) {
      await supabase
        .from('infloww_creators_cache')
        .upsert(
          { infloww_id: c.id, name: c.name, user_name: c.userName, nick_name: c.nickName || '', last_seen_at: new Date().toISOString() },
          { onConflict: 'infloww_id' }
        )
    }

    // Fetch Supabase creator profiles for display_name + avatar
    const { data: supabaseCreators } = await supabase
      .from('creators')
      .select('id, slug, display_name, avatar_url')

    // Build infloww_id -> supabase creator mapping
    const { data: creatorMappings } = await supabase
      .from('infloww_creator_map')
      .select('infloww_creator_id, creator_id')

    const inflowwToSupabase: Record<string, string> = {}
    for (const m of creatorMappings || []) {
      inflowwToSupabase[m.infloww_creator_id] = m.creator_id
    }

    // Also build slug/name lookup for fallback matching
    const creatorBySlug: Record<string, any> = {}
    for (const sc of supabaseCreators || []) {
      if ((sc as any).slug) creatorBySlug[(sc as any).slug.toLowerCase()] = sc
      if ((sc as any).display_name) creatorBySlug[(sc as any).display_name.toLowerCase()] = sc
    }

    console.log(`[revenue-cache] Fetching transactions for ${creators.length} creators...`)
    const creatorData = []
    for (const creator of creators) {
      // Period transactions (selected range)
      const periodTransactions = (await fetchAllPages(
        '/v1/transactions',
        { creatorId: creator.id, platformCode: 'OnlyFans', startTime, endTime, limit: '100' },
        apiHeaders
      )) as InflowwTransaction[]

      // 14d transactions for sub average (anchored at range start)
      const transactions14d = (await fetchAllPages(
        '/v1/transactions',
        { creatorId: creator.id, platformCode: 'OnlyFans', startTime: startTime14d, endTime, limit: '100' },
        apiHeaders
      )) as InflowwTransaction[]

      const breakdown = calculateBreakdown(periodTransactions)
      const newSubs14d = transactions14d.filter((t) => t.type === 'Subscription')
      const subAvg14d = newSubs14d.length > 0 ? Math.round(newSubs14d.length / 14) : 0

      const periodNewSubs = periodTransactions.filter((t) => t.type === 'Subscription')
      const periodRecSubs = periodTransactions.filter((t) => t.type === 'Recurring Subscription')
      const messageFans = new Set(periodTransactions.filter((t) => t.type === 'Messages').map((t) => t.fanId))
      const purchasingFans = new Set(periodTransactions.map((t) => t.fanId))
      const sellingChatFans = new Set(
        periodTransactions.filter((t) => t.type === 'Messages' && parseInt(t.amount) > 0).map((t) => t.fanId)
      )

      const textingRatio = breakdown.totalNet > 0 ? (breakdown.messageNet / breakdown.totalNet) * 100 : 0
      const avgFanSpend = purchasingFans.size > 0 ? breakdown.totalNet / purchasingFans.size : 0

      const sbCreatorId = inflowwToSupabase[creator.id] || null
      let sbCreator = sbCreatorId ? (supabaseCreators || []).find((sc: any) => sc.id === sbCreatorId) : null
      // Fallback: match by username or name if no explicit mapping
      if (!sbCreator) {
        sbCreator = creatorBySlug[creator.userName?.toLowerCase()] || creatorBySlug[creator.name?.toLowerCase()] || null
      }

      creatorData.push({
        infloww_id: creator.id,
        name: creator.name,
        userName: creator.userName,
        display_name: (sbCreator as any)?.display_name || creator.name,
        avatar_url: (sbCreator as any)?.avatar_url || null,
        supabase_creator_id: sbCreatorId,
        totalRevenue: breakdown.totalNet,
        totalGross: breakdown.totalGross,
        subscriptionRevenue: breakdown.subscriptionNet,
        recurringSubRevenue: breakdown.recurringSubNet,
        newSubRevenue: breakdown.newSubNet,
        messageRevenue: breakdown.messageNet,
        tipRevenue: breakdown.tipNet,
        otherRevenue: breakdown.otherNet,
        totalPurchases: periodTransactions.length,
        newSubs: periodNewSubs.length,
        recurringSubs: periodRecSubs.length,
        openChats: messageFans.size,
        sellingChats: sellingChatFans.size,
        textingRatio: Math.round(textingRatio * 100) / 100,
        avgFanSpend: Math.round(avgFanSpend * 100) / 100,
        subAvg14d,
        totalSubs14d: newSubs14d.length,
      })
    }

    // Calculate totals
    const totals = {
      totalTurnover: creatorData.reduce((s, c) => s + c.totalRevenue, 0),
      totalNewSubs: creatorData.reduce((s, c) => s + c.newSubs, 0),
      totalPurchases: creatorData.reduce((s, c) => s + c.totalPurchases, 0),
      subscriptionRevenue: creatorData.reduce((s, c) => s + c.subscriptionRevenue, 0),
      messageRevenue: creatorData.reduce((s, c) => s + c.messageRevenue, 0),
      tipRevenue: creatorData.reduce((s, c) => s + c.tipRevenue, 0),
    }

    const durationMs = toMs - fromMs
    const days = Math.max(1, Math.round(durationMs / 86400000))
    const cachePayload = {
      creators: creatorData,
      totals,
      period: { days, startDate: startDate.toISOString(), endDate: endDate.toISOString(), fromMs, toMs },
    }

    // Build the canonical cache key for this range.
    const rangeKey = buildCacheKey(fromMs, toMs, nowMs)
    const fetchedAt = new Date().toISOString()

    // Always write the range key. Additionally write backward-compat aliases:
    //  - 'today' when range is today 00:00 → (live/now)
    //  - 'YYYY-MM-DD' when range covers exactly one local day
    const startOfStartDay = new Date(startDate); startOfStartDay.setHours(0, 0, 0, 0)
    const endOfStartDay = new Date(startDate); endOfStartDay.setHours(23, 59, 59, 999)
    const startIsMidnight = fromMs === startOfStartDay.getTime()
    const isSingleLocalDay =
      startIsMidnight && (toMs === endOfStartDay.getTime() || (isLiveRange(toMs, nowMs) && localYmd(startDate) === localYmd(now)))
    const legacyDateKey = isSingleLocalDay ? localYmd(startDate) : null
    const isTodayLive = isSingleLocalDay && localYmd(startDate) === localYmd(now) && isLiveRange(toMs, nowMs)

    const upserts: any[] = [
      supabase.from('revenue_cache').upsert(
        { cache_key: rangeKey, data: cachePayload, fetched_at: fetchedAt },
        { onConflict: 'cache_key' }
      ),
    ]
    if (legacyDateKey) {
      upserts.push(
        supabase.from('revenue_cache').upsert(
          { cache_key: legacyDateKey, data: cachePayload, fetched_at: fetchedAt },
          { onConflict: 'cache_key' }
        )
      )
    }
    if (isTodayLive) {
      upserts.push(
        supabase.from('revenue_cache').upsert(
          { cache_key: 'today', data: cachePayload, fetched_at: fetchedAt },
          { onConflict: 'cache_key' }
        )
      )
    }
    await Promise.all(upserts)

    console.log(`[revenue-cache] Cache updated (${rangeKey}). Total revenue: $${totals.totalTurnover}`)
    return {
      ok: true,
      cacheKey: rangeKey,
      totalRevenue: totals.totalTurnover,
      creators: creators.length,
      fromMs,
      toMs,
      fetchedAt,
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[revenue-cache] fetch error:', message)
    return { ok: false, status: 500, error: message }
  }
}
