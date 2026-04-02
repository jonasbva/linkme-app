import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase'

function isAdmin() {
  const cookieStore = cookies()
  return cookieStore.get('admin_auth')?.value === 'true'
}

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
// Conservative: ~1.6 req/sec and tracks 60/min window
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
      console.warn(`Rate limited (429). Retrying in ${backoffMs}ms (attempt ${attempt}/${maxRetries})`)
      await new Promise((r) => setTimeout(r, backoffMs))
      lastRequestTime = Date.now()
      requestTimestamps.push(Date.now())
      const retryResponse = await fetch(url, { headers, cache: 'no-store' })
      if (retryResponse.status !== 429) return retryResponse
    }
    throw new Error('Infloww API rate limit exceeded after multiple retries. Please wait a minute and try again.')
  }

  return response
}

// ─── Paginated Fetch ────────────────────────────────────────────────
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
        `Infloww API error (${response.status}): ${errBody.errorMessage || response.statusText}`
      )
    }

    const body = await response.json()
    const items = body?.data?.list || []
    allItems.push(...items)

    hasMore = body?.hasMore === true
    const cursor = body?.cursor
    if (hasMore && cursor) {
      queryParams.set('cursor', cursor)
    } else {
      break
    }
  }

  return allItems
}

// ─── Per-Creator Transaction Fetch ──────────────────────────────────
async function fetchCreatorTransactions(
  creator: InflowwCreator,
  params: { startTime: string; endTime: string; startTime14d: string; days: number },
  headers: Record<string, string>
) {
  const { startTime, endTime, startTime14d, days } = params

  const periodTransactions = (await fetchAllPages(
    '/v1/transactions',
    { creatorId: creator.id, platformCode: 'OnlyFans', startTime, endTime, limit: '100' },
    headers
  )) as InflowwTransaction[]

  const transactions14d =
    days === 14
      ? periodTransactions
      : ((await fetchAllPages(
          '/v1/transactions',
          { creatorId: creator.id, platformCode: 'OnlyFans', startTime: startTime14d, endTime, limit: '100' },
          headers
        )) as InflowwTransaction[])

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

  const hourlyRevenue: Record<number, number> = {}
  const hourlySubs: Record<number, number> = {}
  for (let h = 0; h < 24; h++) {
    hourlyRevenue[h] = 0
    hourlySubs[h] = 0
  }
  if (days === 1) {
    for (const t of periodTransactions) {
      const hour = new Date(parseInt(t.createdTime)).getHours()
      hourlyRevenue[hour] += parseInt(t.net) / 100
      if (t.type === 'Subscription') hourlySubs[hour] += 1
    }
  }

  return {
    infloww_id: creator.id,
    name: creator.name,
    userName: creator.userName,
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
    hourlyRevenue: days === 1 ? hourlyRevenue : undefined,
    hourlySubs: days === 1 ? hourlySubs : undefined,
  }
}

// ─── Merge with Supabase Data ───────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function mergeWithSupabase(creatorData: any[], supabase: any, startDate: Date, endDate: Date, days: number) {
  const startDateStr = startDate.toISOString().split('T')[0]
  const endDateStr = endDate.toISOString().split('T')[0]

  const { data: conversionData } = await supabase
    .from('conversion_daily')
    .select('creator_id, link_clicks, new_subs')
    .gte('date', startDateStr)
    .lte('date', endDateStr)

  const { data: allCreators } = await supabase.from('creators').select('id, slug, display_name, avatar_url')
  const creatorMap = new Map(allCreators?.map((c: { slug: string }) => [c.slug, c]) || [])
  const creatorIdMap = new Map(allCreators?.map((c: { id: string }) => [c.id, c]) || [])

  const clicksByCreator: Record<string, { clicks: number; subs: number }> = {}
  for (const row of conversionData || []) {
    if (!clicksByCreator[row.creator_id]) clicksByCreator[row.creator_id] = { clicks: 0, subs: 0 }
    clicksByCreator[row.creator_id].clicks += row.link_clicks || 0
    clicksByCreator[row.creator_id].subs += row.new_subs || 0
  }

  const { data: expectations } = await supabase.from('revenue_expectations').select('*')
  const { data: emergencies } = await supabase.from('revenue_emergency_status').select('*')
  const expMap = new Map(expectations?.map((e: { creator_id: string }) => [e.creator_id, e]) || [])
  const emergencyMap = new Map(emergencies?.map((e: { creator_id: string }) => [e.creator_id, e]) || [])

  const { data: creatorMappings } = await supabase.from('infloww_creator_map').select('creator_id, infloww_creator_id')
  const inflowwToSupabase = new Map(
    creatorMappings?.map((m: { infloww_creator_id: string; creator_id: string }) => [m.infloww_creator_id, m.creator_id]) || []
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mergedData = creatorData.map((cd: any) => {
    const mappedCreatorId = inflowwToSupabase.get(cd.infloww_id)
    const supabaseCreator = mappedCreatorId
      ? creatorIdMap.get(mappedCreatorId)
      : creatorMap.get(cd.userName?.toLowerCase()) || creatorMap.get(cd.name?.toLowerCase()) || null

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const creatorId = (supabaseCreator as any)?.id || null
    const convData = creatorId ? clicksByCreator[creatorId] : null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const expectation = creatorId ? expMap.get(creatorId) as any : null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const emergency = creatorId ? emergencyMap.get(creatorId) as any : null

    const linkClicks = convData?.clicks || 0
    const conversionRate = linkClicks > 0 ? (cd.newSubs / linkClicks) * 100 : 0

    return {
      ...cd,
      supabase_creator_id: creatorId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      avatar_url: (supabaseCreator as any)?.avatar_url || null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      display_name: (supabaseCreator as any)?.display_name || cd.name,
      linkClicks,
      conversionRate: Math.round(conversionRate * 100) / 100,
      expectation: expectation
        ? {
            daily_revenue_target: expectation.daily_revenue_target,
            revenue_per_fan_baseline: expectation.revenue_per_fan_baseline,
            check_frequency: expectation.check_frequency,
            free_subs: expectation.free_subs,
          }
        : null,
      generatedRevenuePct: expectation?.daily_revenue_target
        ? Math.round(((cd.totalRevenue / (expectation.daily_revenue_target * days)) - 1) * 1000) / 10
        : null,
      emergency_since: emergency?.emergency_since || null,
      emergency_notes: emergency?.notes || '',
    }
  })

  const totals = {
    totalTurnover: mergedData.reduce((s: number, c: { totalRevenue: number }) => s + c.totalRevenue, 0),
    totalNewSubs: mergedData.reduce((s: number, c: { newSubs: number }) => s + c.newSubs, 0),
    totalPurchases: mergedData.reduce((s: number, c: { totalPurchases: number }) => s + c.totalPurchases, 0),
    subscriptionRevenue: mergedData.reduce((s: number, c: { subscriptionRevenue: number }) => s + c.subscriptionRevenue, 0),
    messageRevenue: mergedData.reduce((s: number, c: { messageRevenue: number }) => s + c.messageRevenue, 0),
    tipRevenue: mergedData.reduce((s: number, c: { tipRevenue: number }) => s + c.tipRevenue, 0),
  }

  let hourlyChart = null
  if (days === 1) {
    hourlyChart = Array.from({ length: 24 }, (_, h) => ({
      hour: h,
      label: h === 0 ? '12 am' : h < 12 ? `${h} am` : h === 12 ? '12 pm' : `${h - 12} pm`,
      revenue: mergedData.reduce((s: number, c: { hourlyRevenue?: Record<number, number> }) => s + (c.hourlyRevenue?.[h] || 0), 0),
      subs: mergedData.reduce((s: number, c: { hourlySubs?: Record<number, number> }) => s + (c.hourlySubs?.[h] || 0), 0),
    }))
  }

  return {
    creators: mergedData,
    totals,
    hourlyChart,
    period: { days, startDate: startDate.toISOString(), endDate: endDate.toISOString() },
  }
}

// ─── GET Handler ────────────────────────────────────────────────────
// Query params: ?days=1 &date=2026-04-01 &stream=true
export async function GET(req: NextRequest) {
  if (!isAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const days = parseInt(searchParams.get('days') || '1', 10)
  const dateParam = searchParams.get('date')
  const stream = searchParams.get('stream') === 'true'

  const supabase = createServerSupabaseClient()

  const { data: config } = await supabase
    .from('infloww_config')
    .select('api_key, agency_oid')
    .limit(1)
    .single()

  if (!config?.api_key || !config?.agency_oid) {
    const errMsg = 'Infloww API not configured. Please set your API key and Agency OID in Settings.'
    if (stream) {
      return new Response(`data: ${JSON.stringify({ type: 'error', error: errMsg })}\n\n`, {
        headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' },
      })
    }
    return NextResponse.json({ error: errMsg }, { status: 400 })
  }

  const apiHeaders = {
    Accept: 'application/json',
    Authorization: config.api_key,
    'x-oid': config.agency_oid,
  }

  const now = new Date()
  let endDate = dateParam ? new Date(dateParam + 'T23:59:59Z') : new Date()
  // Infloww API rejects endTime in the future — cap at current time
  if (endDate.getTime() > now.getTime()) {
    endDate = now
  }
  const startDate = new Date(endDate)
  if (days === 1) {
    // "Today" / single day: start at midnight of that day, not 24h back
    startDate.setUTCHours(0, 0, 0, 0)
  } else {
    startDate.setDate(startDate.getDate() - days)
    startDate.setHours(0, 0, 0, 0)
  }

  const startTime = String(startDate.getTime())
  const endTime = String(endDate.getTime())

  const start14d = new Date(endDate)
  start14d.setDate(start14d.getDate() - 14)
  start14d.setHours(0, 0, 0, 0)
  const startTime14d = String(start14d.getTime())

  // === Streaming mode (SSE with progress) ===
  if (stream) {
    const encoder = new TextEncoder()
    const readableStream = new ReadableStream({
      async start(controller) {
        const send = (data: Record<string, unknown>) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
        }

        try {
          send({ type: 'progress', step: 'creators', message: 'Fetching creator list...' })

          const creators = (await fetchAllPages(
            '/v1/creators',
            { platformCode: 'OnlyFans', limit: '100' },
            apiHeaders
          )) as InflowwCreator[]

          for (const c of creators) {
            await supabase
              .from('infloww_creators_cache')
              .upsert(
                { infloww_id: c.id, name: c.name, user_name: c.userName, nick_name: c.nickName || '', last_seen_at: new Date().toISOString() },
                { onConflict: 'infloww_id' }
              )
          }

          send({ type: 'progress', step: 'transactions', total: creators.length, current: 0, message: `Found ${creators.length} creators. Fetching transactions...` })

          const creatorData = []
          for (let i = 0; i < creators.length; i++) {
            const creator = creators[i]
            send({ type: 'progress', step: 'transactions', total: creators.length, current: i + 1, message: `Fetching ${creator.name} (${i + 1}/${creators.length})...` })
            const result = await fetchCreatorTransactions(creator, { startTime, endTime, startTime14d, days }, apiHeaders)
            creatorData.push(result)
          }

          send({ type: 'progress', step: 'merging', message: 'Merging with local data...' })
          const finalResult = await mergeWithSupabase(creatorData, supabase, startDate, endDate, days)
          send({ type: 'complete', ...finalResult })
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Unknown error'
          console.error('Revenue data fetch error:', message)
          send({ type: 'error', error: message })
        } finally {
          controller.close()
        }
      },
    })

    return new Response(readableStream, {
      headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' },
    })
  }

  // === Non-streaming mode ===
  try {
    const creators = (await fetchAllPages(
      '/v1/creators',
      { platformCode: 'OnlyFans', limit: '100' },
      apiHeaders
    )) as InflowwCreator[]

    for (const c of creators) {
      await supabase
        .from('infloww_creators_cache')
        .upsert(
          { infloww_id: c.id, name: c.name, user_name: c.userName, nick_name: c.nickName || '', last_seen_at: new Date().toISOString() },
          { onConflict: 'infloww_id' }
        )
    }

    const creatorData = []
    for (const creator of creators) {
      const result = await fetchCreatorTransactions(creator, { startTime, endTime, startTime14d, days }, apiHeaders)
      creatorData.push(result)
    }

    const finalResult = await mergeWithSupabase(creatorData, supabase, startDate, endDate, days)
    return NextResponse.json(finalResult)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Revenue data fetch error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// ─── Revenue Breakdown Calculator ───────────────────────────────────
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
