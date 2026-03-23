import { createServerSupabaseClient } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import CreatorEditor from '@/components/admin/CreatorEditor'

interface Props {
  params: { id: string }
}

export default async function CreatorAnalysisPage({ params }: Props) {
  const supabase = createServerSupabaseClient()

  const [creatorRes, clicksRes] = await Promise.all([
    supabase.from('creators').select('*').eq('id', params.id).single(),
    supabase.from('clicks').select('type, country, country_code, device, link_id, created_at').eq('creator_id', params.id),
  ])

  if (!creatorRes.data) notFound()
  const creator = creatorRes.data

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
    date: date.slice(5),
    ...v,
  }))

  // Country breakdown
  const countryDetailMap: Record<string, { count: number; code: string }> = {}
  clicks.forEach(c => {
    if (c.country) {
      if (!countryDetailMap[c.country]) countryDetailMap[c.country] = { count: 0, code: c.country_code || '' }
      countryDetailMap[c.country].count++
    }
  })
  const countryDetails = Object.entries(countryDetailMap)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10)
    .map(([country, d]) => [country, d.code, d.count])

  // Device breakdown
  const deviceMap: Record<string, number> = {}
  clicks.forEach(c => { if (c.device) deviceMap[c.device] = (deviceMap[c.device] || 0) + 1 })

  // Per-link clicks
  const linkClicks: Record<string, number> = {}
  clicks.filter(c => c.type === 'link_click').forEach((c: any) => {
    if (c.link_id) linkClicks[c.link_id] = (linkClicks[c.link_id] || 0) + 1
  })

  // Raw clicks for client-side date filtering
  const rawClicks = clicks.map(c => ({
    type: c.type,
    country: c.country,
    country_code: c.country_code,
    device: c.device,
    link_id: c.link_id,
    created_at: c.created_at,
  }))

  const analytics = {
    totalViews: clicks.filter(c => c.type === 'page_view').length,
    totalClicks: clicks.filter(c => c.type === 'link_click').length,
    last30Views: clicks.filter(c => c.type === 'page_view' && new Date(c.created_at) > last30).length,
    dailyData,
    countryDetails,
    devices: deviceMap,
    linkClicks,
  }

  return (
    <CreatorEditor
      creator={creator}
      links={[]}
      analytics={analytics}
      rawClicks={rawClicks}
      isNew={false}
      mode="analysis"
    />
  )
}
