import { createServerSupabaseClient } from '@/lib/supabase'
import DashboardClient from '@/components/admin/DashboardClient'
import { getSessionUser, getUserPermissions } from '@/lib/auth'

async function getDashboardStats(visibleCreatorIds?: string[]) {
  const supabase = createServerSupabaseClient()
  const [creatorsRes, clicksRes, tagsRes, creatorTagsRes, socialAccountsRes] = await Promise.all([
    supabase.from('creators').select('id, slug, display_name, avatar_url, is_active'),
    supabase.from('clicks').select('creator_id, type, country, created_at'),
    supabase.from('tags').select('*').order('name'),
    supabase.from('creator_tags').select('creator_id, tag_id'),
    supabase.from('social_accounts').select('id, creator_id, platform, username'),
  ])
  let creators = creatorsRes.data || []
  if (visibleCreatorIds) {
    creators = creators.filter(c => visibleCreatorIds.includes(c.id))
  }
  const clicks = (clicksRes.data || []).filter(c => !visibleCreatorIds || creators.some(cr => cr.id === c.creator_id))
  const tags = tagsRes.data || []
  const creatorTags = creatorTagsRes.data || []
  const socialAccounts = (socialAccountsRes.data || []).filter(sa => !visibleCreatorIds || creators.some(cr => cr.id === sa.creator_id))

  // Fetch latest snapshot per social account to get real followers + total_views
  const socialStats: { creator_id: string; followers: number; total_views: number }[] = []
  if (socialAccounts.length > 0) {
    const accountIds = socialAccounts.map(sa => sa.id)
    // Get the most recent snapshot for each account using distinct on
    const { data: snapshots } = await supabase
      .from('social_snapshots')
      .select('social_account_id, followers, total_views, scraped_at')
      .in('social_account_id', accountIds)
      .order('scraped_at', { ascending: false })

    // Deduplicate: keep only the latest per account
    const latestByAccount = new Map<string, { followers: number; total_views: number }>()
    ;(snapshots || []).forEach(s => {
      if (!latestByAccount.has(s.social_account_id)) {
        latestByAccount.set(s.social_account_id, { followers: s.followers || 0, total_views: s.total_views || 0 })
      }
    })

    socialAccounts.forEach(sa => {
      const snap = latestByAccount.get(sa.id)
      socialStats.push({
        creator_id: sa.creator_id,
        followers: snap?.followers || 0,
        total_views: snap?.total_views || 0,
      })
    })
  }

  const now = new Date()
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const totalPageViews = clicks.filter(c => c.type === 'page_view').length
  const totalLinkClicks = clicks.filter(c => c.type === 'link_click').length
  const weeklyPageViews = clicks.filter(c => c.type === 'page_view' && new Date(c.created_at) > last7Days).length
  const countryMap: Record<string, number> = {}
  clicks.forEach(c => { if (c.country) countryMap[c.country] = (countryMap[c.country] || 0) + 1 })
  const topCountries = Object.entries(countryMap).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const recentClicks = clicks.filter(c => new Date(c.created_at) > last30Days)
  const totalIgViews = socialStats.reduce((sum, s) => sum + s.total_views, 0)
  const totalFollowers = socialStats.reduce((sum, s) => sum + s.followers, 0)
  const creatorStats = creators.map(creator => {
    const cc = clicks.filter(c => c.creator_id === creator.id)
    const creatorSocial = socialStats.filter(s => s.creator_id === creator.id)
    return {
      ...creator,
      totalViews: cc.filter(c => c.type === 'page_view').length,
      totalClicks: cc.filter(c => c.type === 'link_click').length,
      last30Views: recentClicks.filter(c => c.creator_id === creator.id && c.type === 'page_view').length,
      tagIds: creatorTags.filter(ct => ct.creator_id === creator.id).map(ct => ct.tag_id),
      igViews: creatorSocial.reduce((sum, s) => sum + s.total_views, 0),
      followers: creatorSocial.reduce((sum, s) => sum + s.followers, 0),
    }
  }).sort((a, b) => b.totalViews - a.totalViews)
  return { creatorStats, totalPageViews, totalLinkClicks, weeklyPageViews, topCountries, tags, totalIgViews, totalFollowers }
}

export default async function AdminDashboard() {
  const user = await getSessionUser()
  let visibleCreatorIds: string[] | undefined
  if (user && !user.is_super_admin) {
    const { visibleCreatorIds: ids, grantAllCreators } = await getUserPermissions(user.id)
    // If any role grants all creators, don't filter
    if (!grantAllCreators) {
      visibleCreatorIds = ids
    }
  }
  const data = await getDashboardStats(visibleCreatorIds)
  return <DashboardClient {...data} isSuperAdmin={user?.is_super_admin} />
}
