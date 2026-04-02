import { createServerSupabaseClient } from '@/lib/supabase'
import DashboardClient from '@/components/admin/DashboardClient'
import { getSessionUser, getUserPermissions } from '@/lib/auth'

async function getDashboardStats(visibleCreatorIds?: string[]) {
  const supabase = createServerSupabaseClient()
  const [creatorsRes, clicksRes, tagsRes, creatorTagsRes, inflowwCacheRes, inflowwMapRes] = await Promise.all([
    supabase.from('creators').select('id, slug, display_name, avatar_url, is_active, custom_domain'),
    supabase.from('clicks').select('creator_id, type, country, created_at'),
    supabase.from('tags').select('*').order('name'),
    supabase.from('creator_tags').select('creator_id, tag_id'),
    supabase.from('infloww_creators_cache').select('infloww_id, name, user_name'),
    supabase.from('infloww_creator_map').select('creator_id, infloww_creator_id'),
  ])
  let creators = creatorsRes.data || []
  if (visibleCreatorIds) {
    creators = creators.filter(c => visibleCreatorIds.includes(c.id))
  }
  const clicks = (clicksRes.data || []).filter(c => !visibleCreatorIds || creators.some(cr => cr.id === c.creator_id))
  const tags = tagsRes.data || []
  const creatorTags = creatorTagsRes.data || []

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
  const creatorStats = creators.map(creator => {
    const cc = clicks.filter(c => c.creator_id === creator.id)
    return {
      ...creator,
      totalViews: cc.filter(c => c.type === 'page_view').length,
      totalClicks: cc.filter(c => c.type === 'link_click').length,
      last30Views: recentClicks.filter(c => c.creator_id === creator.id && c.type === 'page_view').length,
      tagIds: creatorTags.filter(ct => ct.creator_id === creator.id).map(ct => ct.tag_id),
    }
  }).sort((a, b) => b.totalViews - a.totalViews)
  // Find unmapped Infloww creators
  const inflowwCreators = inflowwCacheRes.data || []
  const mappedInflowwIds = new Set((inflowwMapRes.data || []).map((m: any) => m.infloww_creator_id))
  // Also check by slug match
  const creatorSlugs = new Set(creators.map(c => c.slug?.toLowerCase()))
  const unmappedCreators = inflowwCreators
    .filter(ic => !mappedInflowwIds.has(ic.infloww_id) && !creatorSlugs.has(ic.user_name?.toLowerCase()))
    .map(ic => ({ infloww_id: ic.infloww_id, name: ic.name, userName: ic.user_name }))

  return { creatorStats, totalPageViews, totalLinkClicks, weeklyPageViews, topCountries, tags, unmappedCreators }
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
