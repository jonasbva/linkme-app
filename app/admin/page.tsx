import { createServerSupabaseClient } from '@/lib/supabase'
import DashboardClient from '@/components/admin/DashboardClient'
import { getSessionUser, getUserPermissions } from '@/lib/auth'

async function getDashboardStats(visibleCreatorIds?: string[]) {
  const supabase = createServerSupabaseClient()
  const [creatorsRes, tagsRes, creatorTagsRes, inflowwCacheRes, inflowwMapRes, socialAccountsRes] = await Promise.all([
    supabase.from('creators').select('id, slug, display_name, avatar_url, is_active, custom_domain'),
    supabase.from('tags').select('*').order('name'),
    supabase.from('creator_tags').select('creator_id, tag_id'),
    supabase.from('infloww_creators_cache').select('infloww_id, name, user_name'),
    supabase.from('infloww_creator_map').select('creator_id, infloww_creator_id'),
    supabase.from('social_accounts').select('id, creator_id, platform, username, is_active').eq('is_active', true),
  ])
  let creators = creatorsRes.data || []
  if (visibleCreatorIds) {
    creators = creators.filter(c => visibleCreatorIds.includes(c.id))
  }
  const tags = tagsRes.data || []
  const creatorTags = creatorTagsRes.data || []
  const socialAccounts = socialAccountsRes.data || []

  // Fetch latest snapshot per social account for social stats
  const accountIds = socialAccounts.map(a => a.id)
  let latestSnapshots: any[] = []
  let prevSnapshots: any[] = []
  if (accountIds.length > 0) {
    // Get latest snapshot per account (using distinct on via RPC or fetching all recent)
    const { data: snaps } = await supabase
      .from('social_snapshots')
      .select('social_account_id, followers, following, total_views, total_likes, total_comments, scraped_at')
      .in('social_account_id', accountIds)
      .order('scraped_at', { ascending: false })
      .limit(accountIds.length * 2) // Get enough to find latest per account

    if (snaps) {
      // Get latest snapshot per account
      const seen = new Set<string>()
      for (const snap of snaps) {
        if (!seen.has(snap.social_account_id)) {
          seen.add(snap.social_account_id)
          latestSnapshots.push(snap)
        }
      }
    }

    // Get snapshots from ~7 days ago for growth calculation (use scrape_date index)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0]
    const { data: oldSnaps } = await supabase
      .from('social_snapshots')
      .select('social_account_id, followers, total_views, total_likes, total_comments, scraped_at')
      .in('social_account_id', accountIds)
      .lte('scrape_date', sevenDaysAgoStr)
      .order('scraped_at', { ascending: false })
      .limit(accountIds.length * 2)

    if (oldSnaps) {
      const seenOld = new Set<string>()
      for (const snap of oldSnaps) {
        if (!seenOld.has(snap.social_account_id)) {
          seenOld.add(snap.social_account_id)
          prevSnapshots.push(snap)
        }
      }
    }
  }

  // Build per-creator social stats
  let totalFollowers = 0
  let totalFollowers7dAgo = 0
  let totalEngagement = 0
  let totalEngagement7dAgo = 0

  const creatorSocialMap: Record<string, {
    followers: number
    followersPrev: number
    views: number
    likes: number
    comments: number
    engagement: number
    engagementPrev: number
    lastScraped: string | null
    accounts: number
  }> = {}

  // Map social accounts to creators
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

  const creatorStats = creators.map(creator => {
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
    }
  }).sort((a, b) => b.followers - a.followers)

  // Find unmapped Infloww creators
  const inflowwCreators = inflowwCacheRes.data || []
  const mappedInflowwIds = new Set((inflowwMapRes.data || []).map((m: any) => m.infloww_creator_id))
  const creatorSlugs = new Set(creators.map(c => c.slug?.toLowerCase()))
  const unmappedCreators = inflowwCreators
    .filter(ic => !mappedInflowwIds.has(ic.infloww_id) && !creatorSlugs.has(ic.user_name?.toLowerCase()))
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

export default async function AdminDashboard() {
  const user = await getSessionUser()
  let visibleCreatorIds: string[] | undefined
  let userPermissions: Record<string, string[]> | undefined
  if (user && !user.is_super_admin) {
    const { visibleCreatorIds: ids, grantAllCreators, permissions, allCreatorsPermissions } = await getUserPermissions(user.id)
    if (!grantAllCreators) {
      visibleCreatorIds = ids
    }
    // Serialize permissions (Sets → arrays) for client component
    const serialized: Record<string, string[]> = {}
    for (const [creatorId, perms] of Object.entries(permissions)) {
      serialized[creatorId] = Array.from(perms)
    }
    // If grantAllCreators, merge allCreatorsPermissions into every creator's entry
    if (grantAllCreators) {
      const allPermsArr = Array.from(allCreatorsPermissions)
      // Will be applied client-side via isSuperAdmin or allCreatorsPermissions
      serialized['__all__'] = allPermsArr
    }
    userPermissions = serialized
  }
  const data = await getDashboardStats(visibleCreatorIds)
  return <DashboardClient {...data} isSuperAdmin={user?.is_super_admin} userPermissions={userPermissions} />
}
