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

  // Top countries
  const countryMap: Record<string, number> = {}
  clicks.forEach(c => {
    if (c.country) countryMap[c.country] = (countryMap[c.country] || 0) + 1
  })
  const topCountries = Object.entries(countryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  // Per-creator stats
  const creatorStats = creators.map(creator => {
    const creatorClicks = clicks.filter(c => c.creator_id === creator.id)
    return {
      ...creator,
      totalViews: creatorClicks.filter(c => c.type === 'page_view').length,
      totalClicks: creatorClicks.filter(c => c.type === 'link_click').length,
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
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <Link
          href="/admin/creators/new"
          className="px-4 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-white/90 transition"
        >
          + Add Creator
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Creators" value={creatorStats.length} />
        <StatCard label="Total Page Views" value={totalPageViews.toLocaleString()} />
        <StatCard label="Total Link Clicks" value={totalLinkClicks.toLocaleString()} />
        <StatCard label="Views This Week" value={weeklyPageViews.toLocaleString()} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Creators list */}
        <div className="lg:col-span-2 bg-[#111] rounded-2xl p-6">
          <h2 className="text-lg font-medium mb-4">Creators</h2>
          <div className="space-y-3">
            {creatorStats.map(c => (
              <Link
                key={c.id}
                href={`/admin/creators/${c.id}`}
                className="flex items-center justify-between p-3 rounded-xl bg-[#1a1a1a] hover:bg-[#222] transition"
              >
                <div className="flex items-center gap-3">
                  {c.avatar_url ? (
                    <img src={c.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-[#2a2a2a] flex items-center justify-center text-sm font-bold text-white/40">
                      {c.display_name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-white">{c.display_name}</p>
                    <p className="text-xs text-white/40">/{c.slug}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-white/70">{c.totalViews.toLocaleString()} views</p>
                  <p className="text-xs text-white/30">{c.totalClicks.toLocaleString()} clicks</p>
                </div>
              </Link>
            ))}
            {creatorStats.length === 0 && (
              <p className="text-white/30 text-sm text-center py-4">No creators yet. Add one above!</p>
            )}
          </div>
        </div>

        {/* Top countries */}
        <div className="bg-[#111] rounded-2xl p-6">
          <h2 className="text-lg font-medium mb-4">Top Countries</h2>
          <div className="space-y-3">
            {topCountries.map(([country, count]) => (
              <div key={country} className="flex items-center justify-between">
                <span className="text-sm text-white/70">{country}</span>
                <span className="text-sm font-medium text-white">{count.toLocaleString()}</span>
              </div>
            ))}
            {topCountries.length === 0 && (
              <p className="text-white/30 text-sm">No data yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-[#111] rounded-2xl p-5">
      <p className="text-xs text-white/40 mb-1">{label}</p>
      <p className="text-2xl font-semibold text-white">{value}</p>
    </div>
  )
}
