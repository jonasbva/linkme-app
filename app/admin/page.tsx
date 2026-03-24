import { createServerSupabaseClient } from '@/lib/supabase'
import DashboardClient from '@/components/admin/DashboardClient'

async function getDashboardStats() {
  const supabase = createServerSupabaseClient()
  const [creatorsRes, clicksRes, tagsRes, creatorTagsRes] = await Promise.all([
    supabase.from('creators').select('id, slug, display_name, avatar_url, is_active'),
    supabase.from('clicks').select('creator_id, type, country, created_at'),
    supabase.from('tags').select('*').order('name'),
    supabase.from('creator_tags').select('creator_id, tag_id'),
  ])
  const creators = creatorsRes.data || []
  const clicks = clicksRes.data || []
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
  return { creatorStats, totalPageViews, totalLinkClicks, weeklyPageViews, topCountries, tags }
}

export default async function AdminDashboard() {
  const data = await getDashboardStats()
  return <DashboardClient {...data} />
}
