import { createServerSupabaseClient } from './supabase'

// Shared server-side data fetchers for the admin overview (/admin) and the
// creators list (/admin/creators). Extracted from the old dashboard page so
// both routes can reuse the same scoped queries.

export interface CreatorStat {
  id: string
  slug: string
  display_name: string
  avatar_url?: string
  is_active: boolean
  custom_domain?: string
  linkme_enabled?: boolean
  followers: number
  followerGrowth: number
  totalViews: number
  totalLikes: number
  totalComments: number
  engagement: number
  lastScraped: string | null
  accounts: number
  tagIds: string[]
  ofHandle: string | null
  conversionAccountCount: number
}

export interface CreatorStatsBundle {
  creatorStats: CreatorStat[]
  totalFollowers: number
  followerGrowth7d: number
  totalEngagement: number
  engagementGrowth7d: number
  tags: { id: string; name: string; color: string }[]
  unmappedCreators: { infloww_id: string; name: string; userName: string }[]
}

// Per-creator social stats + aggregates, scoped to the creators the user may see.
export async function getCreatorStats(visibleCreatorIds?: string[]): Promise<CreatorStatsBundle> {
  const supabase = createServerSupabaseClient()
  const [creatorsRes, tagsRes, creatorTagsRes, inflowwCacheRes, inflowwMapRes, socialAccountsRes, conversionAccountsRes] = await Promise.all([
    supabase.from('creators').select('id, slug, display_name, avatar_url, is_active, custom_domain, linkme_enabled, of_handle'),
    supabase.from('tags').select('*').order('name'),
    supabase.from('creator_tags').select('creator_id, tag_id'),
    supabase.from('infloww_creators_cache').select('infloww_id, name, user_name'),
    supabase.from('infloww_creator_map').select('creator_id, infloww_creator_id'),
    supabase.from('social_accounts').select('id, creator_id, platform, username, is_active').eq('is_active', true),
    supabase.from('conversion_accounts').select('id, creator_id, handle, is_active'),
  ])
  let creators = creatorsRes.data || []
  if (visibleCreatorIds) {
    creators = creators.filter(c => visibleCreatorIds.includes(c.id))
  }
  const tags = tagsRes.data || []
  const creatorTags = creatorTagsRes.data || []
  const socialAccounts = socialAccountsRes.data || []

  // Latest + ~7-days-ago snapshot per social account (per-account queries avoid
  // a truncation bug where one account's snapshots crowd out others).
  const accountIds = socialAccounts.map(a => a.id)
  const latestSnapshots: any[] = []
  const prevSnapshots: any[] = []
  if (accountIds.length > 0) {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0]

    const perAccount = await Promise.all(
      accountIds.map(async (id) => {
        const [latestRes, prevRes] = await Promise.all([
          supabase
            .from('social_snapshots')
            .select('social_account_id, followers, following, total_views, total_likes, total_comments, scraped_at')
            .eq('social_account_id', id)
            .order('scraped_at', { ascending: false })
            .limit(1),
          supabase
            .from('social_snapshots')
            .select('social_account_id, followers, total_views, total_likes, total_comments, scraped_at')
            .eq('social_account_id', id)
            .lte('scrape_date', sevenDaysAgoStr)
            .order('scraped_at', { ascending: false })
            .limit(1),
        ])
        return { latest: latestRes.data?.[0] ?? null, prev: prevRes.data?.[0] ?? null }
      })
    )
    for (const r of perAccount) {
      if (r.latest) latestSnapshots.push(r.latest)
      if (r.prev) prevSnapshots.push(r.prev)
    }
  }

  let totalFollowers = 0
  let totalFollowers7dAgo = 0
  let totalEngagement = 0
  let totalEngagement7dAgo = 0

  const creatorSocialMap: Record<string, {
    followers: number; followersPrev: number; views: number; likes: number
    comments: number; engagement: number; engagementPrev: number; lastScraped: string | null; accounts: number
  }> = {}

  for (const account of socialAccounts) {
    const creatorId = account.creator_id
    if (!creatorSocialMap[creatorId]) {
      creatorSocialMap[creatorId] = { followers: 0, followersPrev: 0, views: 0, likes: 0, comments: 0, engagement: 0, engagementPrev: 0, lastScraped: null, accounts: 0 }
    }
    creatorSocialMap[creatorId].accounts++

    const latest = latestSnapshots.find(s => s.social_account_id === account.id)
    const prev = prevSnapshots.find(s => s.social_account_id === account.id)

    if (latest) {
      const f = latest.followers || 0
      const v = latest.total_views || 0
      const l = latest.total_likes || 0
      const c = latest.total_comments || 0
      creatorSocialMap[creatorId].followers += f
      creatorSocialMap[creatorId].views += v
      creatorSocialMap[creatorId].likes += l
      creatorSocialMap[creatorId].comments += c
      creatorSocialMap[creatorId].engagement += l + c
      totalFollowers += f
      totalEngagement += l + c
      if (!creatorSocialMap[creatorId].lastScraped || latest.scraped_at > creatorSocialMap[creatorId].lastScraped!) {
        creatorSocialMap[creatorId].lastScraped = latest.scraped_at
      }
    }
    if (prev) {
      const fPrev = prev.followers || 0
      const ePrev = (prev.total_likes || 0) + (prev.total_comments || 0)
      creatorSocialMap[creatorId].followersPrev += fPrev
      creatorSocialMap[creatorId].engagementPrev += ePrev
      totalFollowers7dAgo += fPrev
      totalEngagement7dAgo += ePrev
    }
  }

  const followerGrowth7d = totalFollowers - totalFollowers7dAgo
  const engagementGrowth7d = totalEngagement - totalEngagement7dAgo

  const conversionCountByCreator: Record<string, number> = {}
  for (const ca of (conversionAccountsRes.data || [])) {
    conversionCountByCreator[ca.creator_id] = (conversionCountByCreator[ca.creator_id] || 0) + 1
  }

  const creatorStats: CreatorStat[] = creators.map(creator => {
    const social = creatorSocialMap[creator.id]
    return {
      ...creator,
      followers: social?.followers || 0,
      followerGrowth: social ? (social.followers - social.followersPrev) : 0,
      totalViews: social?.views || 0,
      totalLikes: social?.likes || 0,
      totalComments: social?.comments || 0,
      engagement: social?.engagement || 0,
      lastScraped: social?.lastScraped || null,
      accounts: social?.accounts || 0,
      tagIds: creatorTags.filter(ct => ct.creator_id === creator.id).map(ct => ct.tag_id),
      ofHandle: (creator as any).of_handle || null,
      conversionAccountCount: conversionCountByCreator[creator.id] || 0,
    }
  }).sort((a, b) => b.followers - a.followers)

  // Unmapped Infloww creators (not linked via map / of_handle / conversion handle / slug).
  const inflowwCreators = inflowwCacheRes.data || []
  const mappedInflowwIds = new Set((inflowwMapRes.data || []).map((m: any) => m.infloww_creator_id))
  const allOfHandles = new Set(creators.map((c: any) => c.of_handle?.toLowerCase()).filter(Boolean))
  const allConversionHandles = new Set((conversionAccountsRes.data || []).map((ca: any) => ca.handle?.toLowerCase()).filter(Boolean))
  const creatorSlugs = new Set(creators.map(c => c.slug?.toLowerCase()))
  const unmappedCreators = inflowwCreators
    .filter(ic => {
      if (mappedInflowwIds.has(ic.infloww_id)) return false
      const userName = ic.user_name?.toLowerCase()
      if (!userName) return true
      if (allOfHandles.has(userName)) return false
      if (allConversionHandles.has(userName)) return false
      if (creatorSlugs.has(userName)) return false
      return true
    })
    .map(ic => ({ infloww_id: ic.infloww_id, name: ic.name, userName: ic.user_name }))

  return {
    creatorStats,
    totalFollowers,
    followerGrowth7d,
    totalEngagement,
    engagementGrowth7d,
    tags,
    unmappedCreators,
  }
}

export interface OverviewData {
  totalFollowers: number
  followerGrowth7d: number
  totalEngagement: number
  engagementGrowth7d: number
  activeCreators: number
  creatorsWithSocial: number
  newSubs7d: number
  newSubsToday: number
  revenueToday: number | null
  emergencies: { creator_id: string; name: string; since: string | null; notes: string }[]
  targetMissesToday: number
  staleCreators: number
  unmappedCount: number
}

// Lightweight overview for the command-center dashboard. Reuses getCreatorStats
// for social aggregates, then adds cheap conversion/revenue/attention signals.
// Deliberately avoids any live Infloww API call so the dashboard stays fast.
export async function getOverviewData(visibleCreatorIds?: string[]): Promise<OverviewData> {
  const supabase = createServerSupabaseClient()
  const base = await getCreatorStats(visibleCreatorIds)

  const today = new Date().toISOString().split('T')[0]
  const sevenAgo = new Date(); sevenAgo.setDate(sevenAgo.getDate() - 7)
  const sevenAgoStr = sevenAgo.toISOString().split('T')[0]

  const scopeDaily = (q: any) => (visibleCreatorIds ? q.in('creator_id', visibleCreatorIds) : q)

  const [dailyRecentRes, expectationsRes, todayDailyRes, emergencyRes, revCacheRes] = await Promise.all([
    scopeDaily(supabase.from('conversion_daily').select('new_subs, date, creator_id').gte('date', sevenAgoStr)),
    scopeDaily(supabase.from('conversion_expectations').select('conversion_account_id, creator_id, daily_sub_target')),
    scopeDaily(supabase.from('conversion_daily').select('conversion_account_id, creator_id, new_subs, date').eq('date', today)),
    scopeDaily(supabase.from('revenue_emergency_status').select('creator_id, emergency_since, notes').not('emergency_since', 'is', null)),
    supabase.from('revenue_cache').select('data, fetched_at').eq('cache_key', 'today').maybeSingle(),
  ])

  const dailyRecent = dailyRecentRes.data || []
  const newSubs7d = dailyRecent.reduce((s: number, r: any) => s + (r.new_subs || 0), 0)
  const newSubsToday = dailyRecent.filter((r: any) => r.date === today).reduce((s: number, r: any) => s + (r.new_subs || 0), 0)

  // Count accounts that have a positive target but are below it today.
  const targetByAccount: Record<string, number> = {}
  for (const e of (expectationsRes.data || [])) {
    if (e.conversion_account_id && (e.daily_sub_target || 0) > 0) targetByAccount[e.conversion_account_id] = e.daily_sub_target
  }
  const subsTodayByAccount: Record<string, number> = {}
  for (const r of (todayDailyRes.data || [])) {
    if (r.conversion_account_id) subsTodayByAccount[r.conversion_account_id] = (subsTodayByAccount[r.conversion_account_id] || 0) + (r.new_subs || 0)
  }
  let targetMissesToday = 0
  for (const [accId, target] of Object.entries(targetByAccount)) {
    if ((subsTodayByAccount[accId] || 0) < target) targetMissesToday++
  }

  // Emergencies → attach creator names.
  const emRows = emergencyRes.data || []
  const nameById: Record<string, string> = {}
  for (const c of base.creatorStats) nameById[c.id] = c.display_name
  const emergencies = emRows.map((e: any) => ({
    creator_id: e.creator_id,
    name: nameById[e.creator_id] || 'Unknown creator',
    since: e.emergency_since,
    notes: e.notes || '',
  }))

  // Revenue today from the cheap cache row (no live fetch).
  let revenueToday: number | null = null
  const cacheData = (revCacheRes as any)?.data?.data
  if (cacheData?.totals?.totalTurnover != null) revenueToday = cacheData.totals.totalTurnover

  // Stale = active creator with social accounts but no scrape in 3+ days.
  const threeAgo = Date.now() - 3 * 86400000
  const staleCreators = base.creatorStats.filter(c =>
    c.is_active && c.accounts > 0 && (!c.lastScraped || new Date(c.lastScraped).getTime() < threeAgo)
  ).length

  return {
    totalFollowers: base.totalFollowers,
    followerGrowth7d: base.followerGrowth7d,
    totalEngagement: base.totalEngagement,
    engagementGrowth7d: base.engagementGrowth7d,
    activeCreators: base.creatorStats.filter(c => c.is_active).length,
    creatorsWithSocial: base.creatorStats.filter(c => c.accounts > 0).length,
    newSubs7d,
    newSubsToday,
    revenueToday,
    emergencies,
    targetMissesToday,
    staleCreators,
    unmappedCount: base.unmappedCreators.length,
  }
}
