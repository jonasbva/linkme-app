import { createServerSupabaseClient } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import CreatorEditor from '@/components/admin/CreatorEditor'

interface Props {
  params: { id: string }
}

export default async function EditCreatorPage({ params }: Props) {
  const isNew = params.id === 'new'
  let creator = null
  let links: any[] = []
  let analytics = null

  if (!isNew) {
    const supabase = createServerSupabaseClient()
    const [creatorRes, linksRes, clicksRes] = await Promise.all([
      supabase.from('creators').select('*').eq('id', params.id).single(),
      supabase.from('links').select('*').eq('creator_id', params.id).order('sort_order'),
      supabase.from('clicks').select('type, country, device, created_at').eq('creator_id', params.id),
    ])

    if (!creatorRes.data) notFound()
    creator = creatorRes.data
    links = linksRes.data || []

    const clicks = clicksRes.data || []
    const now = new Date()
    const last30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Build daily views chart data (last 30 days)
    const dailyMap: Record<string, { views: number; clicks: number }> = {}
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const key = d.toISOString().split('T')[0]
      dailyMap[key] = { views: 0, clicks: 0 }
    }
    clicks.forEach(c => {
      const key = new Date(c.created_at).toISOString().split('T')[0]
      if (dailyMap[key]) {
        if (c.type === 'page_view') dailyMap[key].views++
        else dailyMap[key].clicks++
      }
    })
    const dailyData = Object.entries(dailyMap).map(([date, v]) => ({
      date: date.slice(5), // MM-DD
      ...v,
    }))

    // Country breakdown
    const countryMap: Record<string, number> = {}
    clicks.forEach(c => {
      if (c.country) countryMap[c.country] = (countryMap[c.country] || 0) + 1
    })
    const countries = Object.entries(countryMap).sort((a, b) => b[1] - a[1]).slice(0, 10)

    // Device breakdown
    const deviceMap: Record<string, number> = {}
    clicks.forEach(c => { if (c.device) deviceMap[c.device] = (deviceMap[c.device] || 0) + 1 })

    // Per-link clicks
    const linkClicks: Record<string, number> = {}
    clicks.filter(c => c.type === 'link_click').forEach((c: any) => {
      if (c.link_id) linkClicks[c.link_id] = (linkClicks[c.link_id] || 0) + 1
    })

    analytics = {
      totalViews: clicks.filter(c => c.type === 'page_view').length,
      totalClicks: clicks.filter(c => c.type === 'link_click').length,
      last30Views: clicks.filter(c => c.type === 'page_view' && new Date(c.created_at) > last30).length,
      dailyData,
      countries,
      devices: deviceMap,
      linkClicks,
    }
  }

  return <CreatorEditor creator={creator} links={links} analytics={analytics} isNew={isNew} />
}
