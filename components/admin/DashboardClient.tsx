'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useTheme } from './ThemeProvider'

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
  custom_domain?: string
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
  isSuperAdmin?: boolean
}

export default function DashboardClient({
  creatorStats: initialStats,
  totalPageViews,
  totalLinkClicks,
  weeklyPageViews,
  topCountries,
  tags,
  isSuperAdmin,
}: Props) {
  const { resolved } = useTheme()
  const isLight = resolved === 'light'

  const [creators, setCreators] = useState(initialStats)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [filterTag, setFilterTag] = useState<string>('all')
  const [search, setSearch] = useState('')

  // Revenue today
  const [revenueToday, setRevenueToday] = useState<number | null>(null)
  const [revenueLoading, setRevenueLoading] = useState(true)

  // Scrape all state
  const [scraping, setScraping] = useState(false)
  const [scrapeProgress, setScrapeProgress] = useState<{ index: number; total: number; username: string } | null>(null)
  const [scrapeResult, setScrapeResult] = useState<{ success: number; errors: number; total: number } | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Fetch revenue today from cache (instant, no Infloww API call)
  useEffect(() => {
    async function fetchRevenue() {
      try {
        const res = await fetch('/api/admin/revenue/cache?key=today')
        if (res.ok) {
          const data = await res.json()
          setRevenueToday(data?.totals?.totalTurnover ?? null)
        }
      } catch {
        // Revenue not available — that's fine, show N/A
      } finally {
        setRevenueLoading(false)
      }
    }
    fetchRevenue()
  }, [])

  async function scrapeAll() {
    setScraping(true)
    setScrapeProgress(null)
    setScrapeResult(null)
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await fetch('/api/admin/scrape-all', { method: 'POST', signal: controller.signal })
      const reader = res.body?.getReader()
      if (!reader) return
      const decoder = new TextDecoder()
      let buf = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })
        const lines = buf.split('\n')
        buf = lines.pop() || ''
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const data = JSON.parse(line.slice(6))
            if (data.type === 'progress') setScrapeProgress({ index: data.index, total: data.total, username: data.username })
            if (data.type === 'calculating') setScrapeProgress(prev => prev ? { ...prev, username: 'Calculating conversions...' } : null)
            if (data.type === 'done') {
              setScrapeResult({ success: data.success, errors: data.errors, total: data.total })
              setScrapeProgress(null)
            }
          } catch {}
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') setScrapeResult({ success: 0, errors: 1, total: 0 })
    }
    setScraping(false)
  }

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

  // Style helpers
  const cardCls = isLight
    ? 'bg-black/[0.03] border border-black/[0.06]'
    : 'bg-white/[0.05] border border-white/[0.08]'
  const textPrimary = isLight ? 'text-black/90' : 'text-white/95'
  const textSecondary = isLight ? 'text-black/50' : 'text-white/60'
  const textTertiary = isLight ? 'text-black/30' : 'text-white/40'

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className={`text-xl font-semibold tracking-tight ${textPrimary}`}>Dashboard</h1>
        <div className="flex items-center gap-3">
          {/* Scrape all button — super admin only */}
          {isSuperAdmin && <button
            onClick={scrapeAll}
            disabled={scraping}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-150 ${
              scraping
                ? isLight ? 'bg-blue-500/10 text-blue-600 border border-blue-500/15' : 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                : scrapeResult
                  ? scrapeResult.errors > 0
                    ? isLight ? 'bg-amber-500/10 text-amber-600 border border-amber-500/15' : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                    : isLight ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/15' : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                  : isLight
                    ? 'bg-black/[0.04] text-black/50 border border-black/[0.08] hover:text-black/80 hover:bg-black/[0.06] hover:border-black/[0.12]'
                    : 'bg-white/[0.04] text-white/50 border border-white/[0.08] hover:text-white/80 hover:bg-white/[0.06] hover:border-white/[0.12]'
            }`}
          >
            {scraping ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2v4m0 12v4m-7.07-3.93l2.83-2.83m8.48-8.48l2.83-2.83M2 12h4m12 0h4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83" opacity="0.3" />
                  <path d="M12 2v4" />
                </svg>
                {scrapeProgress
                  ? `Scraping ${scrapeProgress.index}/${scrapeProgress.total} — @${scrapeProgress.username}`
                  : 'Starting...'
                }
              </>
            ) : scrapeResult ? (
              `${scrapeResult.success}/${scrapeResult.total} scraped${scrapeResult.errors > 0 ? ` (${scrapeResult.errors} failed)` : ''}`
            ) : (
              <>
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Scrape all accounts
              </>
            )}
          </button>}
          {isSuperAdmin && <Link
            href="/admin/creators/new"
            className={`px-4 py-1.5 text-[12px] font-medium rounded-lg transition-colors ${
              isLight ? 'bg-black text-white hover:bg-black/90' : 'bg-white text-black hover:bg-white/90'
            }`}
          >
            Add creator
          </Link>}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`${cardCls} rounded-xl p-4`}>
          <p className={`text-[11px] ${textTertiary} mb-1`}>Revenue today</p>
          <p className={`text-xl font-semibold tracking-tight ${textPrimary}`}>
            {revenueLoading ? '...' : revenueToday !== null ? `$${revenueToday.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : 'N/A'}
          </p>
        </div>
        <div className={`${cardCls} rounded-xl p-4`}>
          <p className={`text-[11px] ${textTertiary} mb-1`}>Page views</p>
          <p className={`text-xl font-semibold tracking-tight ${textPrimary}`}>{totalPageViews.toLocaleString()}</p>
        </div>
        <div className={`${cardCls} rounded-xl p-4`}>
          <p className={`text-[11px] ${textTertiary} mb-1`}>Link clicks</p>
          <p className={`text-xl font-semibold tracking-tight ${textPrimary}`}>{totalLinkClicks.toLocaleString()}</p>
        </div>
        <div className={`${cardCls} rounded-xl p-4`}>
          <p className={`text-[11px] ${textTertiary} mb-1`}>Weekly views</p>
          <p className={`text-xl font-semibold tracking-tight ${textPrimary}`}>{weeklyPageViews.toLocaleString()}</p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Search creators..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className={`rounded-lg px-3 py-1.5 text-[13px] outline-none w-48 ${
            isLight
              ? 'bg-white border border-black/10 text-black/80 placeholder:text-black/25 focus:border-black/30'
              : 'bg-white/[0.04] border border-white/[0.08] text-white/80 placeholder-white/25 focus:border-white/20'
          }`}
        />
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setFilterTag('all')}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
              filterTag === 'all'
                ? isLight ? 'bg-black/[0.08] text-black/70' : 'bg-white/[0.12] text-white/80'
                : isLight ? 'bg-black/[0.03] text-black/30 hover:text-black/50' : 'bg-white/[0.04] text-white/30 hover:text-white/50'
            }`}
          >
            All
          </button>
          {tags.map(tag => (
            <button
              key={tag.id}
              onClick={() => setFilterTag(filterTag === tag.id ? 'all' : tag.id)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors border ${
                filterTag === tag.id ? 'border-current' : 'border-transparent'
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
                className={`flex items-center justify-between p-4 rounded-xl transition-all duration-150 group ${
                  isLight
                    ? 'bg-black/[0.02] border border-black/[0.06] hover:border-black/[0.10] hover:bg-black/[0.03]'
                    : 'bg-white/[0.05] border border-white/[0.08] hover:border-white/[0.12] hover:bg-white/[0.07]'
                }`}
              >
                <Link href={`/admin/creators/${c.id}/analysis`} className="flex items-center gap-3 flex-1 min-w-0">
                  {c.avatar_url ? (
                    <img src={c.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-medium ${
                      isLight ? 'bg-black/[0.06] text-black/40' : 'bg-white/[0.08] text-white/40'
                    }`}>
                      {c.display_name.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-[13px] font-medium truncate ${textPrimary}`}>{c.display_name}</p>
                      {creatorTags.map(tag => (
                        <span
                          key={tag.id}
                          className="px-1.5 py-0.5 rounded text-[10px] font-medium flex-shrink-0"
                          style={{ color: tag.color, backgroundColor: tag.color + '18' }}
                        >
                          {tag.name}
                        </span>
                      ))}
                      {!c.is_active && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          isLight ? 'bg-amber-500/15 text-amber-600' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className={`text-[11px] ${textTertiary}`}>/{c.slug}</p>
                  </div>
                </Link>
                <div className="flex items-center gap-3">
                  <div className="text-right mr-2">
                    <p className={`text-[13px] tabular-nums ${textSecondary}`}>{c.totalViews.toLocaleString()}</p>
                    <p className={`text-[11px] ${textTertiary}`}>views</p>
                  </div>
                  {/* Creator action buttons — visible on hover */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                      href={`/admin/creators/${c.id}/edit`}
                      className={`px-2.5 py-1 text-[11px] rounded-lg transition-colors ${
                        isLight ? 'text-black/40 hover:text-black/70 hover:bg-black/[0.04]' : 'text-white/35 hover:text-white/70 hover:bg-white/[0.06]'
                      }`}
                    >
                      Edit
                    </Link>
                    <Link
                      href={c.custom_domain ? `https://${c.custom_domain}` : `/${c.slug}`}
                      target="_blank"
                      className={`px-2.5 py-1 text-[11px] rounded-lg transition-colors ${
                        isLight ? 'text-black/40 hover:text-black/70 hover:bg-black/[0.04]' : 'text-white/35 hover:text-white/70 hover:bg-white/[0.06]'
                      }`}
                    >
                      Preview
                    </Link>
                    {isSuperAdmin && <button
                      onClick={(e) => { e.preventDefault(); deleteCreator(c.id, c.display_name) }}
                      disabled={deleting === c.id}
                      className={`px-2.5 py-1 text-[11px] rounded-lg transition-colors ${
                        isLight ? 'text-red-500/50 hover:text-red-600 hover:bg-red-500/10' : 'text-red-400/60 hover:text-red-400 hover:bg-red-500/10'
                      }`}
                    >
                      {deleting === c.id ? '...' : 'Delete'}
                    </button>}
                  </div>
                </div>
              </div>
            )
          })}
          {filtered.length === 0 && (
            <p className={`text-[13px] text-center py-8 ${textTertiary}`}>
              {search || filterTag !== 'all' ? 'No creators match your filter' : 'No creators yet'}
            </p>
          )}
        </div>

        <div className="space-y-5">
          <div className={`${cardCls} rounded-xl p-5`}>
            <p className={`text-[12px] ${textTertiary} mb-4`}>Top countries</p>
            <div className="space-y-2.5">
              {topCountries.map(([country, count]) => (
                <div key={country} className="flex items-center justify-between">
                  <span className={`text-[13px] ${textSecondary}`}>{country}</span>
                  <span className={`text-[13px] font-medium tabular-nums ${textPrimary}`}>{count.toLocaleString()}</span>
                </div>
              ))}
              {topCountries.length === 0 && <p className={`text-[12px] ${textTertiary}`}>No data yet</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
