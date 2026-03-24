'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Tag {
  id: string
  name: string
  color: string
}

interface CreatorStat {
  id: string
  slug: string
  display_name: string
  avatar_url?: string
  is_active: boolean
  totalViews: number
  totalClicks: number
  last30Views: number
  tagIds: string[]
}

interface Props {
  creatorStats: CreatorStat[]
  totalPageViews: number
  totalLinkClicks: number
  weeklyPageViews: number
  topCountries: [string, number][]
  tags: Tag[]
}

export default function DashboardClient({
  creatorStats: initialStats,
  totalPageViews,
  totalLinkClicks,
  weeklyPageViews,
  topCountries,
  tags,
}: Props) {
  const router = useRouter()
  const [creators, setCreators] = useState(initialStats)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [filterTag, setFilterTag] = useState<string>('all')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    let list = creators
    if (filterTag !== 'all') {
      list = list.filter(c => c.tagIds.includes(filterTag))
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(c =>
        c.display_name.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q)
      )
    }
    return list
  }, [creators, filterTag, search])

  async function deleteCreator(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This removes all their links, clicks, and data permanently.`)) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/admin/creators/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setCreators(prev => prev.filter(c => c.id !== id))
      }
    } finally {
      setDeleting(null)
    }
  }

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
        <Stat label="Creators" value={String(creators.length)} />
        <Stat label="Page views" value={totalPageViews.toLocaleString()} />
        <Stat label="Link clicks" value={totalLinkClicks.toLocaleString()} />
        <Stat label="This week" value={weeklyPageViews.toLocaleString()} />
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Search creators..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-1.5 text-[13px] text-white/80 placeholder-white/25 outline-none focus:border-white/20 w-48"
        />
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setFilterTag('all')}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
              filterTag === 'all'
                ? 'bg-white/[0.12] text-white/80'
                : 'bg-white/[0.04] text-white/30 hover:text-white/50'
            }`}
          >
            All
          </button>
          {tags.map(tag => (
            <button
              key={tag.id}
              onClick={() => setFilterTag(filterTag === tag.id ? 'all' : tag.id)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors border ${
                filterTag === tag.id
                  ? 'border-current'
                  : 'border-transparent'
              }`}
              style={{
                color: tag.color,
                backgroundColor: filterTag === tag.id ? tag.color + '20' : tag.color + '10',
              }}
            >
              {tag.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-2">
          {filtered.map(c => {
            const creatorTags = tags.filter(t => c.tagIds.includes(t.id))
            return (
              <div
                key={c.id}
                className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.03] transition-all duration-150 group"
              >
                <Link href={`/admin/creators/${c.id}/analysis`} className="flex items-center gap-3 flex-1 min-w-0">
                  {c.avatar_url ? (
                    <img src={c.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-white/[0.04] flex items-center justify-center text-[12px] font-medium text-white/25">
                      {c.display_name.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[13px] font-medium text-white/90 truncate">{c.display_name}</p>
                      {creatorTags.map(tag => (
                        <span
                          key={tag.id}
                          className="px-1.5 py-0.5 rounded text-[10px] font-medium flex-shrink-0"
                          style={{ color: tag.color, backgroundColor: tag.color + '18' }}
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                    <p className="text-[11px] text-white/25">/{c.slug}</p>
                  </div>
                </Link>
                <div className="flex items-center gap-3">
                  <div className="text-right mr-2">
                    <p className="text-[13px] text-white/60 tabular-nums">{c.totalViews.toLocaleString()}</p>
                    <p className="text-[11px] text-white/20">views</p>
                  </div>
                  <button
                    onClick={(e) => { e.preventDefault(); deleteCreator(c.id, c.display_name) }}
                    disabled={deleting === c.id}
                    className="px-2 py-1 text-[11px] text-red-400/60 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors opacity-0 group-hover:opacity-100"
                  >
                    {deleting === c.id ? '...' : 'Delete'}
                  </button>
                </div>
              </div>
            )
          })}
          {filtered.length === 0 && (
            <p className="text-white/20 text-[13px] text-center py-8">
              {search || filterTag !== 'all' ? 'No creators match your filter' : 'No creators yet'}
            </p>
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
