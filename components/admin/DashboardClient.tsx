'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
  followers: number
  followerGrowth: number
  totalViews: number
  totalLikes: number
  totalComments: number
  engagement: number
  lastScraped: string | null
  accounts: number
  tagIds: string[]
}

interface UnmappedCreator {
  infloww_id: string
  name: string
  userName: string
}

interface Props {
  creatorStats: CreatorStat[]
  totalFollowers: number
  followerGrowth7d: number
  totalEngagement: number
  engagementGrowth7d: number
  tags: Tag[]
  unmappedCreators: UnmappedCreator[]
  isSuperAdmin?: boolean
  userPermissions?: Record<string, string[]>
}

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toLocaleString()
}

function GrowthBadge({ value, isLight }: { value: number; isLight: boolean }) {
  if (value === 0) return null
  const positive = value > 0
  return (
    <span className={`inline-flex items-center gap-0.5 text-[11px] font-medium px-1.5 py-0.5 rounded-full transition-colors ${
      positive
        ? 'text-emerald-500 bg-emerald-500/10'
        : 'text-red-400 bg-red-400/10'
    }`}>
      {positive ? '↑' : '↓'} {fmt(Math.abs(value))}
    </span>
  )
}

// ─── Tooltip (2s delay, anchors left/right based on screen position) ─
function Tooltip({ text, children, isLight }: { text: string; children: React.ReactNode; isLight: boolean }) {
  const [visible, setVisible] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // 'center' default, switches to 'left' or 'right' based on screen position
  const [anchor, setAnchor] = useState<'left' | 'center' | 'right'>('center')
  const [side, setSide] = useState<'top' | 'bottom'>('top')

  function handleEnter() {
    timerRef.current = setTimeout(() => {
      const wrapper = wrapperRef.current
      if (wrapper) {
        const rect = wrapper.getBoundingClientRect()
        const midpoint = rect.left + rect.width / 2
        // If element is in the right third of the screen, anchor tooltip to the right
        if (midpoint > window.innerWidth * 0.65) setAnchor('right')
        // If in the left third, anchor left
        else if (midpoint < window.innerWidth * 0.35) setAnchor('left')
        else setAnchor('center')
        // Vertical: flip below if too close to top
        setSide(rect.top < 60 ? 'bottom' : 'top')
      }
      setVisible(true)
    }, 1000)
  }

  function handleLeave() {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = null
    setVisible(false)
  }

  const anchorCls =
    anchor === 'right' ? 'right-0' :
    anchor === 'left' ? 'left-0' :
    'left-1/2 -translate-x-1/2'

  const arrowCls =
    anchor === 'right' ? 'right-4' :
    anchor === 'left' ? 'left-4' :
    'left-1/2 -translate-x-1/2'

  return (
    <div
      className="relative inline-block"
      ref={wrapperRef}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {children}
      {visible && (
        <div
          style={{ width: 280 }}
          className={`absolute z-50 px-3 py-2 rounded-lg border text-[11px] leading-relaxed pointer-events-none ${anchorCls} ${
            side === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
          } ${
            isLight
              ? 'bg-white text-black/80 border-black/10 shadow-lg shadow-black/5'
              : 'bg-[#111] text-white/90 border-white/[0.08] shadow-2xl shadow-black/60'
          }`}
        >
          {text}
          <div
            className={`absolute ${arrowCls} w-2 h-2 rotate-45 border ${
              side === 'top' ? 'top-full -mt-1 border-t-0 border-l-0' : 'bottom-full -mb-1 border-b-0 border-r-0'
            } ${
              isLight
                ? 'bg-white border-black/10'
                : 'bg-[#111] border-white/[0.08]'
            }`}
          />
        </div>
      )}
    </div>
  )
}

type SortKey = 'name' | 'followers' | 'views' | 'engagement'
type SortDir = 'asc' | 'desc'

export default function DashboardClient({
  creatorStats: initialStats,
  totalFollowers,
  followerGrowth7d,
  totalEngagement,
  engagementGrowth7d,
  tags,
  unmappedCreators,
  isSuperAdmin,
  userPermissions,
}: Props) {
  const router = useRouter()
  const { resolved } = useTheme()
  const isLight = resolved === 'light'

  // Permission check: super admins see everything, others check per-creator permissions
  function hasPermission(creatorId: string, permission: string): boolean {
    if (isSuperAdmin) return true
    if (!userPermissions) return false
    return (userPermissions[creatorId]?.includes(permission) ?? false)
      || (userPermissions['__all__']?.includes(permission) ?? false)
  }

  const [creators, setCreators] = useState(initialStats)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [filterTag, setFilterTag] = useState<string>('all')
  const [search, setSearch] = useState('')

  // Sort state
  const [sortKey, setSortKey] = useState<SortKey>('followers')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  // Scrape all state
  const [scraping, setScraping] = useState(false)
  const [scrapeProgress, setScrapeProgress] = useState<{ completed: number; total: number; message: string } | null>(null)
  const [scrapeResult, setScrapeResult] = useState<{ success: number; errors: number; total: number } | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  async function scrapeAll() {
    setScraping(true)
    setScrapeProgress({ completed: 0, total: 0, message: 'Starting...' })
    setScrapeResult(null)

    // Generate job ID client-side so we can start polling immediately
    const jobId = crypto.randomUUID()

    // Fire-and-forget: POST runs the full scrape (stays alive on Vercel up to 5 min)
    // We don't await or read the response — just let it run
    fetch('/api/admin/scrape-all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId }),
    }).catch(() => {})

    // Poll every 3 seconds for progress
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/admin/scrape-all?jobId=${jobId}`)
        const job = await res.json()

        // 'pending' means job row doesn't exist yet — keep waiting
        if (job.status === 'pending') return

        setScrapeProgress({
          completed: job.completed ?? 0,
          total: job.total ?? 0,
          message: job.message || 'Working...',
        })

        if (job.status === 'done' || job.status === 'error') {
          if (pollRef.current) clearInterval(pollRef.current)
          pollRef.current = null
          setScrapeResult({ success: job.success ?? 0, errors: job.errors ?? 0, total: job.total ?? 0 })
          setScrapeProgress(null)
          setScraping(false)
          // Refresh server data so dashboard stats update
          router.refresh()
        }
      } catch {
        // Poll failed (network blip) — keep trying
      }
    }, 3000)
  }

  // Cleanup poll interval on unmount
  useEffect(() => {
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [])

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(prev => prev === 'desc' ? 'asc' : 'desc')
    } else {
      setSortKey(key)
      setSortDir(key === 'name' ? 'asc' : 'desc')
    }
  }

  const filtered = useMemo(() => {
    let list = [...creators]
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
    // Sort
    list.sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case 'name': cmp = a.display_name.localeCompare(b.display_name); break
        case 'followers': cmp = a.followers - b.followers; break
        case 'views': cmp = a.totalViews - b.totalViews; break
        case 'engagement': cmp = a.engagement - b.engagement; break
      }
      return sortDir === 'desc' ? -cmp : cmp
    })
    return list
  }, [creators, filterTag, search, sortKey, sortDir])

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

  // Sort button style helper
  function sortBtnCls(key: SortKey) {
    const active = sortKey === key
    return `px-2 py-0.5 text-[10px] font-medium rounded transition-all duration-150 cursor-pointer select-none ${
      active
        ? isLight ? 'text-black/70 bg-black/[0.06]' : 'text-white/70 bg-white/[0.08]'
        : isLight ? 'text-black/25 hover:text-black/50' : 'text-white/25 hover:text-white/50'
    }`
  }

  function sortArrow(key: SortKey) {
    if (sortKey !== key) return ''
    return sortDir === 'desc' ? ' ↓' : ' ↑'
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className={`text-xl font-semibold tracking-tight ${textPrimary}`}>Dashboard</h1>
        <div className="flex items-center gap-3">
          {/* Scrape all button with progress bar — super admin only */}
          {isSuperAdmin && (
            <div className="flex flex-col items-end gap-1.5">
              <button
                onClick={scrapeAll}
                disabled={scraping}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-200 ${
                  scraping
                    ? isLight ? 'bg-blue-500/10 text-blue-600 border border-blue-500/15' : 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                    : scrapeResult
                      ? scrapeResult.errors > 0
                        ? isLight ? 'bg-amber-500/10 text-amber-600 border border-amber-500/15' : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                        : isLight ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/15' : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                      : isLight
                        ? 'bg-black/[0.04] text-black/50 border border-black/[0.08] hover:text-black/80 hover:bg-black/[0.06] hover:border-black/[0.12] hover:shadow-sm'
                        : 'bg-white/[0.04] text-white/50 border border-white/[0.08] hover:text-white/80 hover:bg-white/[0.06] hover:border-white/[0.12] hover:shadow-sm'
                }`}
              >
                {scraping ? (
                  <>
                    <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 2v4m0 12v4m-7.07-3.93l2.83-2.83m8.48-8.48l2.83-2.83M2 12h4m12 0h4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83" opacity="0.3" />
                      <path d="M12 2v4" />
                    </svg>
                    {scrapeProgress
                      ? `Scraping ${scrapeProgress.completed}/${scrapeProgress.total} — ${scrapeProgress.message}`
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
              </button>
              {/* Progress bar — visible during scraping */}
              {scraping && scrapeProgress && (
                <div className="flex items-center gap-2 w-full">
                  <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${isLight ? 'bg-black/[0.06]' : 'bg-white/[0.06]'}`}>
                    <div
                      className="h-full rounded-full bg-blue-500 transition-all duration-500 ease-out"
                      style={{ width: `${scrapeProgress.total > 0 ? Math.round((scrapeProgress.completed / scrapeProgress.total) * 100) : 0}%` }}
                    />
                  </div>
                  <span className={`text-[10px] tabular-nums ${isLight ? 'text-black/30' : 'text-white/30'}`}>
                    {scrapeProgress.total > 0 ? Math.round((scrapeProgress.completed / scrapeProgress.total) * 100) : 0}%
                  </span>
                </div>
              )}
            </div>
          )}
          {isSuperAdmin && <Link
            href="/admin/creators/new"
            className={`px-4 py-1.5 text-[12px] font-medium rounded-lg transition-all duration-200 hover:shadow-md ${
              isLight ? 'bg-black text-white hover:bg-black/90' : 'bg-white text-black hover:bg-white/90'
            }`}
          >
            Add creator
          </Link>}
        </div>
      </div>

      {/* Stats Cards — no revenue card */}
      <div className="grid grid-cols-3 gap-4">
        <Tooltip text="All IG followers combined (last scrape). Badge = 7-day change." isLight={isLight}>
          <div className={`${cardCls} rounded-xl p-4 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg cursor-default`}>
            <div className="flex items-center justify-between mb-1">
              <p className={`text-[11px] ${textTertiary}`}>Total Followers</p>
              <GrowthBadge value={followerGrowth7d} isLight={isLight} />
            </div>
            <p className={`text-xl font-semibold tracking-tight ${textPrimary}`}>{fmt(totalFollowers)}</p>
            <p className={`text-[10px] mt-0.5 ${textTertiary}`}>7d growth</p>
          </div>
        </Tooltip>
        <Tooltip text="Likes + comments from ~12 latest posts per account. Badge = 7-day change." isLight={isLight}>
          <div className={`${cardCls} rounded-xl p-4 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg cursor-default`}>
            <div className="flex items-center justify-between mb-1">
              <p className={`text-[11px] ${textTertiary}`}>Total Engagement</p>
              <GrowthBadge value={engagementGrowth7d} isLight={isLight} />
            </div>
            <p className={`text-xl font-semibold tracking-tight ${textPrimary}`}>{fmt(totalEngagement)}</p>
            <p className={`text-[10px] mt-0.5 ${textTertiary}`}>likes + comments</p>
          </div>
        </Tooltip>
        <Tooltip text="Active creators. Sub-number = how many have IG tracking linked." isLight={isLight}>
          <div className={`${cardCls} rounded-xl p-4 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg cursor-default`}>
            <p className={`text-[11px] ${textTertiary} mb-1`}>Active Creators</p>
            <p className={`text-xl font-semibold tracking-tight ${textPrimary}`}>{creators.filter(c => c.is_active).length}</p>
            <p className={`text-[10px] mt-0.5 ${textTertiary}`}>{creators.filter(c => c.accounts > 0).length} with social tracking</p>
          </div>
        </Tooltip>
      </div>

      {/* Filter bar + Sort controls */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="text"
            placeholder="Search creators..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={`rounded-lg px-3 py-1.5 text-[13px] outline-none w-48 transition-all duration-200 ${
              isLight
                ? 'bg-white border border-black/10 text-black/80 placeholder:text-black/25 focus:border-black/30 focus:shadow-sm'
                : 'bg-white/[0.04] border border-white/[0.08] text-white/80 placeholder-white/25 focus:border-white/20 focus:shadow-sm'
            }`}
          />
          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => setFilterTag('all')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all duration-200 ${
                filterTag === 'all'
                  ? isLight ? 'bg-black/[0.08] text-black/70' : 'bg-white/[0.12] text-white/80'
                  : isLight ? 'bg-black/[0.03] text-black/30 hover:text-black/50 hover:bg-black/[0.05]' : 'bg-white/[0.04] text-white/30 hover:text-white/50 hover:bg-white/[0.06]'
              }`}
            >
              All
            </button>
            {tags.map(tag => (
              <button
                key={tag.id}
                onClick={() => setFilterTag(filterTag === tag.id ? 'all' : tag.id)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all duration-200 border ${
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

        {/* Sort buttons */}
        <div className="flex items-center gap-1">
          <span className={`text-[10px] mr-1 ${textTertiary}`}>Sort:</span>
          <button onClick={() => toggleSort('name')} className={sortBtnCls('name')}>Name{sortArrow('name')}</button>
          <button onClick={() => toggleSort('followers')} className={sortBtnCls('followers')}>Followers{sortArrow('followers')}</button>
          <button onClick={() => toggleSort('views')} className={sortBtnCls('views')}>Views{sortArrow('views')}</button>
          <button onClick={() => toggleSort('engagement')} className={sortBtnCls('engagement')}>Engagement{sortArrow('engagement')}</button>
        </div>
      </div>

      {/* Creator list with social stats */}
      <div className="space-y-2">
        {filtered.map(c => {
          const creatorTags = tags.filter(t => c.tagIds.includes(t.id))
          return (
            <div
              key={c.id}
              className={`flex items-center justify-between p-4 rounded-xl transition-all duration-200 group ${
                isLight
                  ? 'bg-black/[0.02] border border-black/[0.06] hover:border-black/[0.12] hover:bg-black/[0.03] hover:shadow-sm'
                  : 'bg-white/[0.05] border border-white/[0.08] hover:border-white/[0.14] hover:bg-white/[0.07] hover:shadow-sm hover:shadow-white/[0.02]'
              }`}
            >
              {/* Left: Avatar + name */}
              <Link href={`/admin/creators/${c.id}/analysis`} className="flex items-center gap-3 min-w-0 flex-shrink-0" style={{ width: '220px' }}>
                {c.avatar_url ? (
                  <img src={c.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover ring-2 ring-transparent group-hover:ring-white/10 transition-all duration-200" />
                ) : (
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-medium transition-all duration-200 ${
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
                  <p className={`text-[11px] ${textTertiary}`}>
                    {c.accounts > 0
                      ? `${c.accounts} account${c.accounts > 1 ? 's' : ''} tracked`
                      : 'No social accounts'
                    }
                  </p>
                </div>
              </Link>

              {/* Middle: Action buttons — always visible, left of stats */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {hasPermission(c.id, 'view_social') && (
                  <Link
                    href={`/admin/creators/${c.id}/analysis`}
                    className={`px-2.5 py-1 text-[11px] rounded-lg transition-all duration-200 ${
                      isLight ? 'text-black/40 hover:text-black/70 hover:bg-black/[0.04]' : 'text-white/35 hover:text-white/70 hover:bg-white/[0.06]'
                    }`}
                  >
                    Social Media
                  </Link>
                )}
                {hasPermission(c.id, 'view_links') && (
                  <Link
                    href={`/admin/creators/${c.id}/edit`}
                    className={`px-2.5 py-1 text-[11px] rounded-lg transition-all duration-200 ${
                      isLight ? 'text-black/40 hover:text-black/70 hover:bg-black/[0.04]' : 'text-white/35 hover:text-white/70 hover:bg-white/[0.06]'
                    }`}
                  >
                    LinkMe
                  </Link>
                )}
                {hasPermission(c.id, 'view_conversions') && (
                  <Link
                    href={`/admin/conversions?creator=${c.id}`}
                    className={`px-2.5 py-1 text-[11px] rounded-lg transition-all duration-200 ${
                      isLight ? 'text-black/40 hover:text-black/70 hover:bg-black/[0.04]' : 'text-white/35 hover:text-white/70 hover:bg-white/[0.06]'
                    }`}
                  >
                    Conversions
                  </Link>
                )}
                {/* Delete — super admin only */}
                {isSuperAdmin && (
                  <button
                    onClick={() => deleteCreator(c.id, c.display_name)}
                    disabled={deleting === c.id}
                    aria-label={`Delete ${c.display_name}`}
                    title="Delete creator"
                    className={`px-2.5 py-1 text-[11px] rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                      isLight
                        ? 'text-red-500/70 hover:text-red-600 hover:bg-red-500/[0.08]'
                        : 'text-red-400/70 hover:text-red-400 hover:bg-red-500/[0.12]'
                    }`}
                  >
                    {deleting === c.id ? 'Deleting…' : 'Delete'}
                  </button>
                )}
              </div>

              {/* Right: Social stats columns with tooltips */}
              <div className="flex items-center gap-6">
                <Tooltip text={`Followers across ${c.accounts} IG account${c.accounts !== 1 ? 's' : ''}. ${c.followerGrowth > 0 ? 'Green = gained in 7d.' : c.followerGrowth < 0 ? 'Red = lost in 7d.' : ''}`} isLight={isLight}>
                  <div className="text-right cursor-default">
                    <div className="flex items-center gap-1.5 justify-end">
                      <p className={`text-[13px] tabular-nums font-medium ${textPrimary}`}>{fmt(c.followers)}</p>
                      {c.followerGrowth !== 0 && (
                        <span className={`text-[10px] tabular-nums ${c.followerGrowth > 0 ? 'text-emerald-500' : 'text-red-400'}`}>
                          {c.followerGrowth > 0 ? '+' : ''}{fmt(c.followerGrowth)}
                        </span>
                      )}
                    </div>
                    <p className={`text-[10px] ${textTertiary}`}>followers</p>
                  </div>
                </Tooltip>
                <Tooltip text="Video views from ~12 latest IG posts. Lifetime total, not daily." isLight={isLight}>
                  <div className="text-right hidden md:block cursor-default">
                    <p className={`text-[13px] tabular-nums ${textSecondary}`}>{fmt(c.totalViews)}</p>
                    <p className={`text-[10px] ${textTertiary}`}>views</p>
                  </div>
                </Tooltip>
                <Tooltip text="Likes + comments from ~12 latest IG posts. Lifetime total, not daily." isLight={isLight}>
                  <div className="text-right hidden lg:block cursor-default">
                    <p className={`text-[13px] tabular-nums ${textSecondary}`}>{fmt(c.engagement)}</p>
                    <p className={`text-[10px] ${textTertiary}`}>engagement</p>
                  </div>
                </Tooltip>
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <p className={`text-[13px] text-center py-8 ${textTertiary}`}>
            {search || filterTag !== 'all' ? 'No creators match your filter' : 'No creators yet'}
          </p>
        )}

        {/* Unmapped Infloww creators */}
        {unmappedCreators.length > 0 && !search && filterTag === 'all' && (
          <>
            <div className={`flex items-center gap-3 mt-6 mb-2`}>
              <div className={`flex-1 h-px ${isLight ? 'bg-black/[0.10]' : 'bg-white/[0.12]'}`} />
              <span className={`text-[11px] font-semibold uppercase tracking-widest ${isLight ? 'text-black/30' : 'text-white/30'}`}>
                Unmapped
              </span>
              <div className={`flex-1 h-px ${isLight ? 'bg-black/[0.10]' : 'bg-white/[0.12]'}`} />
            </div>
            <p className={`text-[11px] mb-2 ${textTertiary}`}>
              These Infloww creators aren't linked to a profile yet.
            </p>
            {unmappedCreators.map(uc => (
              <div
                key={uc.infloww_id}
                className={`flex items-center justify-between p-4 rounded-xl transition-all duration-200 ${
                  isLight
                    ? 'bg-amber-500/[0.04] border border-amber-500/[0.10] hover:border-amber-500/[0.18]'
                    : 'bg-amber-500/[0.04] border border-amber-500/[0.08] hover:border-amber-500/[0.15]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-medium ${
                    isLight ? 'bg-amber-500/10 text-amber-600' : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {uc.name.charAt(0)}
                  </div>
                  <div>
                    <p className={`text-[13px] font-medium ${textPrimary}`}>{uc.name}</p>
                    <p className={`text-[11px] ${textTertiary}`}>@{uc.userName}</p>
                  </div>
                </div>
                <span className={`text-[11px] px-2 py-0.5 rounded-full ${
                  isLight ? 'bg-amber-500/10 text-amber-600' : 'bg-amber-500/10 text-amber-400'
                }`}>
                  Not linked
                </span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
