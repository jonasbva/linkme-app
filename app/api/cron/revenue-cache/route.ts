import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

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

// ─── Rate Limiter (same as data route) ──────────────────────────────
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
      console.warn(`[cron] Rate limited (429). Retrying in ${backoffMs}ms (attempt ${attempt}/${maxRetries})`)
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

// ─── GET Handler (called by Vercel Cron) ────────────────────────────
export async function GET(req: NextRequest) {
  // Verify cron secret (Vercel sets this header for cron jobs)
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServerSupabaseClient()

  const { data: config } = await supabase
    .from('infloww_config')
    .select('api_key, agency_oid')
    .limit(1)
    .single()

  if (!config?.api_key || !config?.agency_oid) {
    return NextResponse.json({ error: 'Infloww API not configured' }, { status: 400 })
  }

  const apiHeaders = {
    Accept: 'application/json',
    Authorization: config.api_key,
    'x-oid': config.agency_oid,
  }

  try {
    // Fetch today's data
    const now = new Date()
    const startOfDay = new Date(now)
    startOfDay.setHours(0, 0, 0, 0)
    const startTime = String(startOfDay.getTime())
    const endTime = String(now.getTime())

    // 14d lookback for sub averages
    const start14d = new Date(now)
    start14d.setDate(start14d.getDate() - 14)
    start14d.setHours(0, 0, 0, 0)
    const startTime14d = String(start14d.getTime())

    console.log('[cron] Fetching creator list...')
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
    const { data: creatorMap } = await supabase
      .from('infloww_creator_map')
      .select('infloww_creator_id, supabase_creator_id')

    const inflowwToSupabase: Record<string, string> = {}
    for (const m of creatorMap || []) {
      inflowwToSupabase[m.infloww_creator_id] = m.supabase_creator_id
    }

    console.log(`[cron] Fetching transactions for ${creators.length} creators...`)
    const creatorData = []
    for (const creator of creators) {
      // Period transactions (today)
      const periodTransactions = (await fetchAllPages(
        '/v1/transactions',
        { creatorId: creator.id, platformCode: 'OnlyFans', startTime, endTime, limit: '100' },
        apiHeaders
      )) as InflowwTransaction[]

      // 14d transactions for sub average
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
      const sbCreator = sbCreatorId ? (supabaseCreators || []).find((sc: any) => sc.id === sbCreatorId) : null

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

    const cachePayload = {
      creators: creatorData,
      totals,
      period: { days: 1, startDate: startOfDay.toISOString(), endDate: now.toISOString() },
    }

    // Upsert into cache
    await supabase
      .from('revenue_cache')
      .upsert(
        { cache_key: 'today', data: cachePayload, fetched_at: new Date().toISOString() },
        { onConflict: 'cache_key' }
      )

    console.log(`[cron] Revenue cache updated. Total revenue today: $${totals.totalTurnover}`)
    return NextResponse.json({
      ok: true,
      totalRevenue: totals.totalTurnover,
      creators: creators.length,
      fetchedAt: new Date().toISOString(),
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[cron] Revenue cache fetch error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
