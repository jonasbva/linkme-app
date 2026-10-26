import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { requireUser, guardResponse } from '@/lib/auth'
import { decryptSecret } from '@/lib/infloww-crypto'
import { rateLimitedFetch, mapWithConcurrency, CREATOR_CONCURRENCY } from '@/lib/infloww-rate-limit'

const INFLOWW_BASE = 'https://openapi.infloww.com'

// A full revenue pull is one Infloww round trip per creator (plus paging), so
// give it the longest window Vercel allows. Without this the route inherited
// the default and was killed mid-fetch, which is why Revenue often showed
// nothing in production while working locally.
export const maxDuration = 300

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

// One upsert instead of one per creator. This cache backs the Overview's
// "unmapped Infloww creators" count, so it only stays current while revenue is
// being fetched successfully.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function cacheInflowwCreators(creators: InflowwCreator[], supabase: any) {
  if (creators.length === 0) return
  const seenAt = new Date().toISOString()
  await supabase.from('infloww_creators_cache').upsert(
    creators.map((c) => ({
      infloww_id: c.id,
      name: c.name,
      user_name: c.userName,
      nick_name: c.nickName || '',
      last_seen_at: seenAt,
    })),
    { onConflict: 'infloww_id' }
  )
}

// ─── Per-Creator Transaction Fetch ──────────────────────────────────
async function fetchCreatorTransactions(
  creator: InflowwCreator,
  params: { startTime: string; endTime: string; startTime14d: string; days: number },
  headers: Record<string, string>
) {
  const { startTime, endTime, startTime14d, days } = params

  // The 14-day baseline and the selected period overlap, so fetch the wider of
  // the two once and slice both out of it. This used to be two separate pulls
  // per creator, which doubled the request count for no new data — the single
  // biggest reason a full refresh ran past the function timeout.
  const windowStart = Math.min(Number(startTime), Number(startTime14d))
  const allTransactions = (await fetchAllPages(
    '/v1/transactions',
    { creatorId: creator.id, platformCode: 'OnlyFans', startTime: String(windowStart), endTime, limit: '100' },
    headers
  )) as InflowwTransaction[]

  const at = (t: InflowwTransaction) => Number(t.createdTime)
  const periodStart = Number(startTime)
  const baselineStart = Number(startTime14d)
  const periodTransactions = allTransactions.filter((t) => at(t) >= periodStart)
  const transactions14d = allTransactions.filter((t) => at(t) >= baselineStart)
  void days

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

  // Subs come from the creator layer; link clicks from the creator's links.
  const [{ data: subsRows }, { data: linkRows }] = await Promise.all([
    supabase
      .from('creator_daily')
      .select('creator_id, new_subs')
      .gte('date', startDateStr)
      .lte('date', endDateStr),
    supabase
      .from('link_daily')
      .select('link_clicks, tracking_links!inner(creator_id)')
      .gte('date', startDateStr)
      .lte('date', endDateStr),
  ])

  const { data: allCreators } = await supabase.from('creators').select('id, slug, display_name, avatar_url')
  const creatorMap = new Map(allCreators?.map((c: { slug: string }) => [c.slug, c]) || [])
  const creatorIdMap = new Map(allCreators?.map((c: { id: string }) => [c.id, c]) || [])

  const clicksByCreator: Record<string, { clicks: number; subs: number }> = {}
  const bucket = (creatorId: string) => {
    if (!clicksByCreator[creatorId]) clicksByCreator[creatorId] = { clicks: 0, subs: 0 }
    return clicksByCreator[creatorId]
  }
  for (const row of subsRows || []) bucket(row.creator_id).subs += row.new_subs || 0
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const row of (linkRows || []) as any[]) {
    const creatorId = row.tracking_links?.creator_id
    if (creatorId) bucket(creatorId).clicks += row.link_clicks || 0
  }

  // Revenue expectations were removed: targets per creator were never kept up
  // to date, so "x% of target" was noise. Emergencies stay — those are set by
  // hand when something is actually wrong.
  const { data: emergencies } = await supabase.from('revenue_emergency_status').select('*')
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
  const gate = await requireUser()
  if (!gate.ok) return guardResponse(gate)

  const { searchParams } = new URL(req.url)
  const days = parseInt(searchParams.get('days') || '1', 10)
  const dateParam = searchParams.get('date')
  const stream = searchParams.get('stream') === 'true'

  const supabase = createServerSupabaseClient()

  const { data: config } = await supabase
    .from('infloww_config')
    .select('api_key, agency_oid, fetching_enabled')
    .limit(1)
    .single()

  if (config?.fetching_enabled === false) {
    const errMsg = 'Revenue data fetching is currently disabled. Enable it in Settings to fetch live data.'
    if (stream) {
      return new Response(`data: ${JSON.stringify({ type: 'error', error: errMsg })}\n\n`, {
        headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' },
      })
    }
    return NextResponse.json({ error: errMsg, fetching_disabled: true }, { status: 403 })
  }

  const apiKey = await decryptSecret(config?.api_key)
  if (!apiKey || !config?.agency_oid) {
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
    Authorization: apiKey,
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

          await cacheInflowwCreators(creators, supabase)

          send({ type: 'progress', step: 'transactions', total: creators.length, current: 0, message: `Found ${creators.length} creators. Fetching transactions...` })

          let completed = 0
          const creatorData = await mapWithConcurrency(creators, CREATOR_CONCURRENCY, async (creator) => {
            const result = await fetchCreatorTransactions(creator, { startTime, endTime, startTime14d, days }, apiHeaders)
            completed++
            send({ type: 'progress', step: 'transactions', total: creators.length, current: completed, message: `Fetched ${creator.name} (${completed}/${creators.length})...` })
            return result
          })

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

    await cacheInflowwCreators(creators, supabase)

    const creatorData = await mapWithConcurrency(creators, CREATOR_CONCURRENCY, (creator) =>
      fetchCreatorTransactions(creator, { startTime, endTime, startTime14d, days }, apiHeaders)
    )

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
