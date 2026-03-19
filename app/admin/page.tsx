import { createServerSupabaseClient } from '@/lib/supabase'
import Link from 'next/link'

async function getDashboardStats() {
  const supabase = createServerSupabaseClient()
  const [creatorsRes, clicksRes] = await Promise.all([
    supabase.from('creators').select('id, slug, display_name, avatar_url, is_active'),
    supabase.from('clicks').select('creator_id, type, country, created_at'),
  ])
  const creators = creatorsRes.data || []
  const clicks = clicksRes.data || []
  const now = new Date()
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const recentClicks = clicks.filter(c => new Date(c.created_at) > last30Days)
  const totalPageViews = clicks.filter(c => c.type === 'page_view').length
  const totalLinkClicks = clicks.filter(c => c.type === 'link_click').length
  const weeklyPageViews = clicks.filter(c => c.type === 'page_view' && new Date(c.created_at) > last7Days).length
  const countryMap: Record<string, number> = {}
  clicks.forEach(c => { if (c.country) countryMap[c.country] = (countryMap[c.country] || 0) + 1 })
  const topCountries = Object.entries(countryMap).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const creatorStats = creators.map(creator => {
    const cc = clicks.filter(c => c.creator_id === creator.id)
    return {
      ...creator,
      totalViews: cc.filter(c => c.type === 'page_view').length,
      totalClicks: cc.filter(c => c.type === 'link_click').length,
      last30Views: recentClicks.filter(c => c.creator_id === creator.id && c.type === 'page_view').length,
    }
  }).sort((a, b) => b.totalViews - a.totalViews)
  return { creatorStats, totalPageViews, totalLinkClicks, weeklyPageViews, topCountries }
}

export default async function AdminDashboard() {
  const { creatorStats, totalPageViews, totalLinkClicks, weeklyPageViews, topCountries } = await getDashboardStats()

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
        <Link
          href="/admin/creators/new"
          className="px-4 py-1.5 bg-white text-black text-[12px] font-medium rounded-lg hover:bg-white/90 transition-colors"
        >
          Add creator
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Creators" value={String(creatorStats.length)} />
        <Stat label="Page views" value={totalPageViews.toLocaleString()} />
        <Stat label="Link clicks" value={totalLinkClicks.toLocaleString()} />
        <Stat label="This week" value={weeklyPageViews.toLocaleString()} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-2">
          {creatorStats.map(c => (
            <Link
              key={c.id}
              href={`/admin/creators/${c.id}`}
              className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-colors"
            >
              <div className="flex items-center gap-3">
                {c.avatar_url ? (
                  <img src={c.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-white/[0.04] flex items-center justify-center text-[12px] font-medium text-white/25">
                    {c.display_name.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="text-[13px] font-medium text-white/90">{c.display_name}</p>
                  <p className="text-[11px] text-white/25">/{c.slug}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[13px] text-white/60 tabular-nums">{c.totalViews.toLocaleString()}</p>
                <p className="text-[11px] text-white/20">views</p>
              </div>
            </Link>
          ))}
          {creatorStats.length === 0 && (
            <p className="text-white/20 text-[13px] text-center py-8">No creators yet</p>
          )}
        </div>

        <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-5">
          <p className="text-[12px] text-white/25 mb-4">Top countries</p>
          <div className="space-y-2.5">
            {topCountries.map(([country, count]) => (
              <div key={country} className="flex items-center justify-between">
                <span className="text-[13px] text-white/50">{country}</span>
                <span className="text-[13px] text-white/80 font-medium tabular-nums">{count.toLocaleString()}</span>
              </div>
            ))}
            {topCountries.length === 0 && <p className="text-white/15 text-[12px]">No data yet</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-4">
      <p className="text-[11px] text-white/20 mb-1">{label}</p>
      <p className="text-xl font-semibold text-white/90 tracking-tight">{value}</p>
    </div>
  )
}
