import { createServerSupabaseClient } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import CreatorEditor from '@/components/admin/CreatorEditor'

interface Props {
  params: { id: string }
}

// Fetch all clicks using pagination (Supabase defaults to 1000 rows max)
async function fetchAllClicks(supabase: any, creatorId: string) {
  const allClicks: any[] = []
  const PAGE_SIZE = 1000
  let from = 0
  let hasMore = true

  while (hasMore) {
    const { data, error } = await supabase
      .from('clicks')
      .select('type, country, country_code, device, link_id, created_at')
      .eq('creator_id', creatorId)
      .order('created_at', { ascending: true })
      .range(from, from + PAGE_SIZE - 1)

    if (error) {
      console.error('Error fetching clicks:', error)
      break
    }

    if (data && data.length > 0) {
      allClicks.push(...data)
      from += PAGE_SIZE
      hasMore = data.length === PAGE_SIZE
    } else {
      hasMore = false
    }
  }

  return allClicks
}

export default async function CreatorAnalysisPage({ params }: Props) {
  const supabase = createServerSupabaseClient()

  const [creatorRes, clicks, linksRes] = await Promise.all([
    supabase.from('creators').select('*').eq('id', params.id).single(),
    fetchAllClicks(supabase, params.id),
    supabase.from('links').select('*').eq('creator_id', params.id).order('sort_order'),
  ])

  if (!creatorRes.data) notFound()
  const creator = creatorRes.data
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
  const dailyData = Object.entries(dailyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, v]) => ({
      date: date.slice(5),
      ...v,
    }))

  // Country breakdown (label null/empty countries as "Unknown")
  const countryDetailMap: Record<string, { count: number; code: string }> = {}
  clicks.forEach(c => {
    const country = c.country || 'Unknown'
    const code = c.country_code || ''
    if (!countryDetailMap[country]) countryDetailMap[country] = { count: 0, code }
    countryDetailMap[country].count++
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
      links={linksRes.data || []}
      analytics={analytics}
      rawClicks={rawClicks}
      isNew={false}
      mode="analysis"
    />
  )
}
