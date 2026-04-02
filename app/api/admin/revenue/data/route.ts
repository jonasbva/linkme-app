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

// Rate limiter: max 4 requests per second (stay under the 5/sec hard limit)
let lastRequestTime = 0
const MIN_REQUEST_GAP_MS = 250 // 250ms = 4 requests/sec max

async function rateLimitedFetch(
  url: string,
  headers: Record<string, string>
): Promise<Response> {
  const now = Date.now()
  const elapsed = now - lastRequestTime
  if (elapsed < MIN_REQUEST_GAP_MS) {
    await new Promise((r) => setTimeout(r, MIN_REQUEST_GAP_MS - elapsed))
  }
  lastRequestTime = Date.now()

  const response = await fetch(url, { headers, cache: 'no-store' })

  // Handle 429 with retry-after
  if (response.status === 429) {
    const retryAfter = parseInt(response.headers.get('retry-after') || '5', 10)
    await new Promise((r) => setTimeout(r, retryAfter * 1000))
    lastRequestTime = Date.now()
    return fetch(url, { headers, cache: 'no-store' })
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

// GET: Fetch revenue data from Infloww API + Supabase conversion data
// Query params: ?days=1 (1, 3, 7, 14, 30) &date=2026-04-01 (optional specific date)
export async function GET(req: NextRequest) {
  if (!isAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const days = parseInt(searchParams.get('days') || '1', 10)
  const dateParam = searchParams.get('date') // optional: specific end date

  const supabase = createServerSupabaseClient()

  // 1. Get Infloww config
  const { data: config } = await supabase
    .from('infloww_config')
    .select('api_key, agency_oid')
    .limit(1)
    .single()

  if (!config?.api_key || !config?.agency_oid) {
    return NextResponse.json(
      { error: 'Infloww API not configured. Please set your API key and Agency OID in Settings.' },
      { status: 400 }
    )
  }

  const headers = {
    Accept: 'application/json',
    Authorization: config.api_key,
    'x-oid': config.agency_oid,
  }

  // 2. Calculate time range
  const endDate = dateParam ? new Date(dateParam + 'T23:59:59Z') : new Date()
  const startDate = new Date(endDate)
  startDate.setDate(startDate.getDate() - days)
  startDate.setHours(0, 0, 0, 0)

  const startTime = String(startDate.getTime())
  const endTime = String(endDate.getTime())

  // Also calculate 14-day range for sub averages
  const start14d = new Date(endDate)
  start14d.setDate(start14d.getDate() - 14)
  start14d.setHours(0, 0, 0, 0)
  const startTime14d = String(start14d.getTime())

  try {
    // 3. Fetch all creators from Infloww
    const creators = (await fetchAllPages(
      '/v1/creators',
      { platformCode: 'OnlyFans', limit: '100' },
      headers
    )) as InflowwCreator[]

    // 3b. Cache Infloww creators in Supabase (upsert so dropdown is always fresh)
    for (const c of creators) {
      await supabase
        .from('infloww_creators_cache')
        .upsert(
          { infloww_id: c.id, name: c.name, user_name: c.userName, nick_name: c.nickName || '', last_seen_at: new Date().toISOString() },
          { onConflict: 'infloww_id' }
        )
    }

    // 4. Fetch transactions for each creator SEQUENTIALLY to respect rate limits
    //    Infloww allows 5 req/sec and 60 req/min — sequential with 250ms gaps keeps us safe
    const creatorData = []
    for (const creator of creators) {
      const creatorResult = await (async () => {
        // Fetch transactions for the requested period
        const periodTransactions = (await fetchAllPages(
          '/v1/transactions',
          {
            creatorId: creator.id,
            platformCode: 'OnlyFans',
            startTime,
            endTime,
            limit: '100',
          },
          headers
        )) as InflowwTransaction[]

        // Fetch 14-day transactions for sub average calculation
        const transactions14d = days === 14
          ? periodTransactions
          : (await fetchAllPages(
              '/v1/transactions',
              {
                creatorId: creator.id,
                platformCode: 'OnlyFans',
                startTime: startTime14d,
                endTime,
                limit: '100',
              },
              headers
            )) as InflowwTransaction[]

        // Calculate revenue breakdown for the period
        const breakdown = calculateBreakdown(periodTransactions)

        // Calculate 14d subscription stats
        const subs14d = transactions14d.filter(
          (t) => t.type === 'Subscription' || t.type === 'Recurring Subscription'
        )
        const newSubs14d = transactions14d.filter((t) => t.type === 'Subscription')
        const subAvg14d = newSubs14d.length > 0 ? Math.round(newSubs14d.length / 14) : 0

        // Calculate period subs
        const periodNewSubs = periodTransactions.filter((t) => t.type === 'Subscription')
        const periodRecSubs = periodTransactions.filter((t) => t.type === 'Recurring Subscription')

        // Unique fans who sent messages
        const messageFans = new Set(
          periodTransactions
            .filter((t) => t.type === 'Messages')
            .map((t) => t.fanId)
        )

        // Fans who actually purchased (any type)
        const purchasingFans = new Set(periodTransactions.map((t) => t.fanId))

        // Selling chats = fans with message AND at least one other purchase type
        const sellingChatFans = new Set(
          periodTransactions
            .filter((t) => t.type === 'Messages' && parseInt(t.amount) > 0)
            .map((t) => t.fanId)
        )

        // Texting ratio = message revenue / total revenue
        const textingRatio =
          breakdown.totalNet > 0
            ? (breakdown.messageNet / breakdown.totalNet) * 100
            : 0

        // Average fan spend
        const avgFanSpend =
          purchasingFans.size > 0
            ? breakdown.totalNet / purchasingFans.size
            : 0

        // Build hourly data for charts (group transactions by hour)
        const hourlyRevenue: Record<number, number> = {}
        const hourlySubs: Record<number, number> = {}
        for (let h = 0; h < 24; h++) {
          hourlyRevenue[h] = 0
          hourlySubs[h] = 0
        }

        // Only build hourly for single-day view
        if (days === 1) {
          for (const t of periodTransactions) {
            const hour = new Date(parseInt(t.createdTime)).getHours()
            hourlyRevenue[hour] += parseInt(t.net) / 100
            if (t.type === 'Subscription') {
              hourlySubs[hour] += 1
            }
          }
        }

        return {
          infloww_id: creator.id,
          name: creator.name,
          userName: creator.userName,

          // Revenue breakdown
          totalRevenue: breakdown.totalNet,
          totalGross: breakdown.totalGross,
          subscriptionRevenue: breakdown.subscriptionNet,
          recurringSubRevenue: breakdown.recurringSubNet,
          newSubRevenue: breakdown.newSubNet,
          messageRevenue: breakdown.messageNet,
          tipRevenue: breakdown.tipNet,
          otherRevenue: breakdown.otherNet,

          // Counts
          totalPurchases: periodTransactions.length,
          newSubs: periodNewSubs.length,
          recurringSubs: periodRecSubs.length,
          openChats: messageFans.size,
          sellingChats: sellingChatFans.size,

          // Ratios
          textingRatio: Math.round(textingRatio * 100) / 100,
          avgFanSpend: Math.round(avgFanSpend * 100) / 100,

          // 14d stats
          subAvg14d,
          totalSubs14d: newSubs14d.length,

          // Hourly chart data (only for 1-day view)
          hourlyRevenue: days === 1 ? hourlyRevenue : undefined,
          hourlySubs: days === 1 ? hourlySubs : undefined,
        }
      })()
      creatorData.push(creatorResult)
    }

    // 5. Get conversion data from Supabase (link clicks for conversion rate)
    const startDateStr = startDate.toISOString().split('T')[0]
    const endDateStr = endDate.toISOString().split('T')[0]

    const { data: conversionData } = await supabase
      .from('conversion_daily')
      .select('creator_id, link_clicks, new_subs')
      .gte('date', startDateStr)
      .lte('date', endDateStr)

    // Build a map of creator slug -> link clicks
    const { data: allCreators } = await supabase
      .from('creators')
      .select('id, slug, display_name, avatar_url')

    const creatorMap = new Map(allCreators?.map((c) => [c.slug, c]) || [])
    const creatorIdMap = new Map(allCreators?.map((c) => [c.id, c]) || [])

    // Aggregate conversion data by creator
    const clicksByCreator: Record<string, { clicks: number; subs: number }> = {}
    for (const row of conversionData || []) {
      if (!clicksByCreator[row.creator_id]) {
        clicksByCreator[row.creator_id] = { clicks: 0, subs: 0 }
      }
      clicksByCreator[row.creator_id].clicks += row.link_clicks || 0
      clicksByCreator[row.creator_id].subs += row.new_subs || 0
    }

    // 6. Get expectations and emergency status
    const { data: expectations } = await supabase
      .from('revenue_expectations')
      .select('*')

    const { data: emergencies } = await supabase
      .from('revenue_emergency_status')
      .select('*')

    const expMap = new Map(expectations?.map((e) => [e.creator_id, e]) || [])
    const emergencyMap = new Map(emergencies?.map((e) => [e.creator_id, e]) || [])

    // 6b. Get creator mappings (Infloww ID → Supabase creator)
    const { data: creatorMappings } = await supabase
      .from('infloww_creator_map')
      .select('creator_id, infloww_creator_id')

    const inflowwToSupabase = new Map(
      creatorMappings?.map((m) => [m.infloww_creator_id, m.creator_id]) || []
    )

    // 7. Merge Infloww data with Supabase data
    const mergedData = creatorData.map((cd) => {
      // Use explicit mapping first, fall back to username/slug matching
      const mappedCreatorId = inflowwToSupabase.get(cd.infloww_id)
      const supabaseCreator = mappedCreatorId
        ? creatorIdMap.get(mappedCreatorId)
        : creatorMap.get(cd.userName?.toLowerCase()) ||
          creatorMap.get(cd.name?.toLowerCase()) ||
          null

      const creatorId = supabaseCreator?.id || null
      const convData = creatorId ? clicksByCreator[creatorId] : null
      const expectation = creatorId ? expMap.get(creatorId) : null
      const emergency = creatorId ? emergencyMap.get(creatorId) : null

      const linkClicks = convData?.clicks || 0
      const conversionRate =
        linkClicks > 0 ? (cd.newSubs / linkClicks) * 100 : 0

      return {
        ...cd,
        supabase_creator_id: creatorId,
        avatar_url: supabaseCreator?.avatar_url || null,
        display_name: supabaseCreator?.display_name || cd.name,

        // Conversion data
        linkClicks,
        conversionRate: Math.round(conversionRate * 100) / 100,

        // Expectations
        expectation: expectation
          ? {
              daily_revenue_target: expectation.daily_revenue_target,
              revenue_per_fan_baseline: expectation.revenue_per_fan_baseline,
              check_frequency: expectation.check_frequency,
              free_subs: expectation.free_subs,
            }
          : null,

        // Generated revenue % = (actual / expected) - 1
        generatedRevenuePct: expectation?.daily_revenue_target
          ? Math.round(
              ((cd.totalRevenue / (expectation.daily_revenue_target * days)) - 1) * 1000
            ) / 10
          : null,

        // Emergency status
        emergency_since: emergency?.emergency_since || null,
        emergency_notes: emergency?.notes || '',
      }
    })

    // 8. Calculate totals for the overview
    const totals = {
      totalTurnover: mergedData.reduce((s, c) => s + c.totalRevenue, 0),
      totalNewSubs: mergedData.reduce((s, c) => s + c.newSubs, 0),
      totalPurchases: mergedData.reduce((s, c) => s + c.totalPurchases, 0),
      subscriptionRevenue: mergedData.reduce((s, c) => s + c.subscriptionRevenue, 0),
      messageRevenue: mergedData.reduce((s, c) => s + c.messageRevenue, 0),
      tipRevenue: mergedData.reduce((s, c) => s + c.tipRevenue, 0),
    }

    // 9. Build aggregated hourly chart data (only for 1-day view)
    let hourlyChart = null
    if (days === 1) {
      hourlyChart = Array.from({ length: 24 }, (_, h) => ({
        hour: h,
        label: h === 0 ? '12 am' : h < 12 ? `${h} am` : h === 12 ? '12 pm' : `${h - 12} pm`,
        revenue: mergedData.reduce((s, c) => s + (c.hourlyRevenue?.[h] || 0), 0),
        subs: mergedData.reduce((s, c) => s + (c.hourlySubs?.[h] || 0), 0),
      }))
    }

    return NextResponse.json({
      creators: mergedData,
      totals,
      hourlyChart,
      period: { days, startDate: startDate.toISOString(), endDate: endDate.toISOString() },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Revenue data fetch error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

function calculateBreakdown(transactions: InflowwTransaction[]) {
  let totalGross = 0
  let totalNet = 0
  let subscriptionNet = 0
  let recurringSubNet = 0
  let newSubNet = 0
  let messageNet = 0
  let tipNet = 0
  let otherNet = 0

  for (const t of transactions) {
    const gross = parseInt(t.amount) / 100
    const net = parseInt(t.net) / 100
    totalGross += gross
    totalNet += net

    switch (t.type) {
      case 'Subscription':
        subscriptionNet += net
        newSubNet += net
        break
      case 'Recurring Subscription':
        subscriptionNet += net
        recurringSubNet += net
        break
      case 'Messages':
        messageNet += net
        break
      case 'Tips':
        tipNet += net
        break
      default:
        otherNet += net
        break
    }
  }

  return {
    totalGross: Math.round(totalGross * 100) / 100,
    totalNet: Math.round(totalNet * 100) / 100,
    subscriptionNet: Math.round(subscriptionNet * 100) / 100,
    recurringSubNet: Math.round(recurringSubNet * 100) / 100,
    newSubNet: Math.round(newSubNet * 100) / 100,
    messageNet: Math.round(messageNet * 100) / 100,
    tipNet: Math.round(tipNet * 100) / 100,
    otherNet: Math.round(otherNet * 100) / 100,
  }
}
