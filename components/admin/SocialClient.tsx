'use client'

import { useState, useMemo } from 'react'
import { ExternalLink, Instagram, MessageSquare, Play, Heart } from 'lucide-react'
import { useTheme } from './ThemeProvider'
import { Card } from './ui'

// ── Types ───────────────────────────────────────────────────────────────────
interface Creator {
  id: string
  display_name: string
  slug: string
  avatar_url?: string
  of_handle?: string | null
}
interface SocialAccount { id: string; platform: string; username: string; is_active: boolean }
interface Post {
  id: string
  social_account_id: string
  post_short_code: string
  post_type?: string
  caption?: string
  display_url?: string
  post_timestamp?: string
  video_view_count: number
  likes_count: number
  comments_count: number
  first_seen_at: string
  is_trial: boolean
}
interface Snapshot {
  social_account_id: string
  scraped_at: string
  followers?: number
  post_count?: number
  total_views?: number
  total_likes?: number
}

interface Props {
  creator: Creator
  accounts: SocialAccount[]
  posts: Post[]
  snapshots: Snapshot[]
  windowDays: number
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function fmt(n: number | null | undefined): string {
  if (n == null) return '—'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'k'
  return n.toLocaleString()
}
function proxy(url?: string) {
  return url ? `/api/admin/proxy-image?url=${encodeURIComponent(url)}` : undefined
}
function median(values: number[]): number {
  if (values.length === 0) return 0
  const s = [...values].sort((a, b) => a - b)
  const mid = Math.floor(s.length / 2)
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2
}
function daysAgo(n: number): number {
  return Date.now() - n * 24 * 60 * 60 * 1000
}
// post_timestamp is NULL on anything scraped before the timestamp fix, so fall
// back to when we first saw the post.
function postDate(p: Post): number {
  const raw = p.post_timestamp || p.first_seen_at
  const t = raw ? new Date(raw).getTime() : NaN
  return isNaN(t) ? 0 : t
}
function postDateLabel(p: Post, opts: Intl.DateTimeFormatOptions): string {
  const t = postDate(p)
  return t ? new Date(t).toLocaleDateString('en-GB', opts) : ''
}
// Like-Quote — likes as a share of views. The core quality signal.
function likeQuote(p: Post): number | null {
  return p.video_view_count > 0 ? (p.likes_count / p.video_view_count) * 100 : null
}
function commentsPer1k(p: Post): number | null {
  return p.video_view_count > 0 ? (p.comments_count / p.video_view_count) * 1000 : null
}

const LIKE_QUOTE_TARGET = 1.5

type ShowFilter = 'all' | 'public' | 'trial'
type SortKey = 'newest' | 'top_24h' | 'top_views' | 'top_lq' | 'top_comments'
type PeriodFilter = 'all' | '24h' | '7d' | '30d'

// ═══════════════════════════════════════════════════════════════════════════
export default function SocialClient({ creator, accounts, posts: initialPosts, snapshots, windowDays }: Props) {
  const { resolved } = useTheme()
  const isLight = resolved === 'light'

  const [posts, setPosts] = useState(initialPosts)
  const [accountId, setAccountId] = useState<string>('all')
  const [show, setShow] = useState<ShowFilter>('all')
  const [sort, setSort] = useState<SortKey>('newest')
  const [lqMin, setLqMin] = useState<number | null>(null)
  const [cpmMin, setCpmMin] = useState<number | null>(null)
  const [period, setPeriod] = useState<PeriodFilter>('all')

  const text1 = isLight ? 'text-black/90' : 'text-white/90'
  const text2 = isLight ? 'text-black/50' : 'text-white/50'
  const text3 = isLight ? 'text-black/30' : 'text-white/30'

  // ── Scope to the selected account ──
  const scopedPosts = useMemo(
    () => (accountId === 'all' ? posts : posts.filter(p => p.social_account_id === accountId)),
    [posts, accountId],
  )

  // ── Followers: latest snapshot per account, summed ──
  const followers = useMemo(() => {
    const latest = new Map<string, Snapshot>()
    snapshots.forEach(s => {
      if (!latest.has(s.social_account_id)) latest.set(s.social_account_id, s)
    })
    const relevant = accountId === 'all'
      ? Array.from(latest.values())
      : [latest.get(accountId)].filter(Boolean) as Snapshot[]
    return relevant.reduce((sum, s) => sum + (s.followers || 0), 0)
  }, [snapshots, accountId])

  // ── Headline metrics ──
  const metrics = useMemo(() => {
    const views = scopedPosts.map(p => p.video_view_count)
    const avgViews = views.length ? Math.round(views.reduce((a, b) => a + b, 0) / views.length) : 0

    const last7 = scopedPosts.filter(p => postDate(p) > daysAgo(7))
    const prev7 = scopedPosts.filter(p => {
      const t = postDate(p)
      return t <= daysAgo(7) && t > daysAgo(14)
    })
    const avg = (arr: Post[]) => (arr.length ? arr.reduce((a, p) => a + p.video_view_count, 0) / arr.length : 0)
    const a7 = avg(last7)
    const p7 = avg(prev7)
    const trend7 = p7 > 0 ? ((a7 - p7) / p7) * 100 : null

    const uploadsToday = scopedPosts.filter(p => postDate(p) > daysAgo(1)).length
    const uploads7 = last7.length
    const uploads30 = scopedPosts.length

    const lq7 = median(last7.map(likeQuote).filter((v): v is number => v !== null))
    const lqPrev7 = median(prev7.map(likeQuote).filter((v): v is number => v !== null))

    return { avgViews, trend7, uploadsToday, uploads7, uploads30, lq7, lqPrev7, medianViews: median(views) }
  }, [scopedPosts])

  // ── Filtered + sorted grid ──
  const visiblePosts = useMemo(() => {
    let out = scopedPosts

    if (show === 'public') out = out.filter(p => !p.is_trial)
    if (show === 'trial') out = out.filter(p => p.is_trial)

    if (period !== 'all') {
      const days = period === '24h' ? 1 : period === '7d' ? 7 : 30
      out = out.filter(p => postDate(p) > daysAgo(days))
    }
    if (lqMin !== null) out = out.filter(p => (likeQuote(p) ?? 0) >= lqMin)
    if (cpmMin !== null) out = out.filter(p => (commentsPer1k(p) ?? 0) >= cpmMin)

    const sorted = [...out]
    switch (sort) {
      case 'top_views': sorted.sort((a, b) => b.video_view_count - a.video_view_count); break
      case 'top_lq': sorted.sort((a, b) => (likeQuote(b) ?? 0) - (likeQuote(a) ?? 0)); break
      case 'top_comments': sorted.sort((a, b) => b.comments_count - a.comments_count); break
      case 'top_24h':
        sorted.sort((a, b) => {
          const recent = (p: Post) => (postDate(p) > daysAgo(1) ? 1 : 0)
          return recent(b) - recent(a) || b.video_view_count - a.video_view_count
        })
        break
      default:
        sorted.sort((a, b) => postDate(b) - postDate(a))
    }
    return sorted
  }, [scopedPosts, show, period, lqMin, cpmMin, sort])

  const publicCount = scopedPosts.filter(p => !p.is_trial).length
  const trialCount = scopedPosts.filter(p => p.is_trial).length

  async function toggleTrial(post: Post) {
    const next = !post.is_trial
    setPosts(prev => prev.map(p => (p.id === post.id ? { ...p, is_trial: next } : p)))
    await fetch(`/api/admin/creators/${creator.id}/posts/${post.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_trial: next }),
    }).catch(() => {
      setPosts(prev => prev.map(p => (p.id === post.id ? { ...p, is_trial: !next } : p)))
    })
  }

  // Only a single selected account has a handle of its own; "All accounts" is
  // the creator, so it must not borrow the first account's @.
  const selectedAccount = accountId === 'all' ? null : accounts.find(a => a.id === accountId) || null

  if (accounts.length === 0) {
    return (
      <div>
        <h1 className={`text-2xl font-bold ${text1}`}>{creator.display_name}</h1>
        <Card className="py-16 text-center mt-6">
          <Instagram className={`h-6 w-6 mx-auto mb-3 ${text3}`} />
          <p className={`text-[13px] ${text2}`}>No social accounts connected</p>
          <p className={`text-[12px] mt-1 ${text3}`}>Add one on the Social Accounts page to start tracking posts.</p>
        </Card>
      </div>
    )
  }

  return (
    <div>
      {/* ── Header ── */}
      <div className="mb-6">
        <h1 className={`text-2xl font-bold ${text1}`}>
          {selectedAccount ? `@${selectedAccount.username}` : creator.display_name}
        </h1>
        <p className={`text-[13px] mt-1 ${text2}`}>
          {selectedAccount
            ? creator.display_name
            : `${accounts.length} ${accounts.length === 1 ? 'account' : 'accounts'}`}
          {followers > 0 && <> · {fmt(followers)} {followers === 1 ? 'follower' : 'followers'}</>}
          {creator.of_handle && <> · funnels to <span className="font-mono">@{creator.of_handle}</span></>}
        </p>
      </div>

      {/* ── Account switcher ── */}
      {accounts.length > 1 && (
        <div className="flex items-center gap-1.5 mb-5 flex-wrap">
          <Pill active={accountId === 'all'} onClick={() => setAccountId('all')} isLight={isLight}>
            All accounts
          </Pill>
          {accounts.map(a => (
            <Pill key={a.id} active={accountId === a.id} onClick={() => setAccountId(a.id)} isLight={isLight}>
              @{a.username}
            </Pill>
          ))}
        </div>
      )}

      {/* ── Metric cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        <Metric label="Avg views" value={fmt(metrics.avgViews)} isLight={isLight} />
        <Metric
          label="7-day trend"
          value={metrics.trend7 === null ? '—' : `${metrics.trend7 > 0 ? '+' : ''}${metrics.trend7.toFixed(0)}%`}
          tone={metrics.trend7 === null ? undefined : metrics.trend7 >= 0 ? 'good' : 'bad'}
          isLight={isLight}
        />
        <Metric
          label={`Uploads · today/7/${windowDays}`}
          value={`${metrics.uploadsToday} / ${metrics.uploads7} / ${metrics.uploads30}`}
          isLight={isLight}
        />
        <Metric label="Followers" value={fmt(followers)} isLight={isLight} />
        <Metric
          label="Like-Quote (median 7d)"
          value={`${metrics.lq7.toFixed(2)} %`}
          sub={`was ${metrics.lqPrev7.toFixed(2)} % · target ${LIKE_QUOTE_TARGET} %`}
          tone={metrics.lq7 >= LIKE_QUOTE_TARGET ? 'good' : 'bad'}
          isLight={isLight}
        />
      </div>

      {/* ── Views per post ── */}
      <ViewsPerPostChart posts={scopedPosts} medianViews={metrics.medianViews} windowDays={windowDays} isLight={isLight} />

      {selectedAccount && (
        <a
          href={`https://instagram.com/${selectedAccount.username}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-1.5 text-[13px] my-5 transition-colors ${
            isLight ? 'text-black/60 hover:text-black/90' : 'text-white/60 hover:text-white/90'
          }`}
        >
          Instagram profile <ExternalLink className="h-3.5 w-3.5" />
        </a>
      )}

      {/* ── Posts ── */}
      <h2 className={`text-lg font-bold mb-4 ${text1}`}>All posts ({windowDays} days)</h2>

      <div className="flex flex-col gap-2.5 mb-5">
        <FilterRow label="Show" isLight={isLight}>
          <Pill active={show === 'all'} onClick={() => setShow('all')} isLight={isLight}>All ({scopedPosts.length})</Pill>
          <Pill active={show === 'public'} onClick={() => setShow('public')} isLight={isLight}>Public ({publicCount})</Pill>
          <Pill active={show === 'trial'} onClick={() => setShow('trial')} isLight={isLight}>Trial ({trialCount})</Pill>
          <span className="w-3" />
          <span className={`text-[10px] uppercase tracking-wider font-semibold mr-1 ${text3}`}>Sort</span>
          {([
            ['newest', 'Newest'], ['top_24h', 'Top 24h'], ['top_views', 'Top views'],
            ['top_lq', 'Top Like-Quote'], ['top_comments', 'Top comments'],
          ] as [SortKey, string][]).map(([key, label]) => (
            <Pill key={key} active={sort === key} onClick={() => setSort(key)} isLight={isLight}>{label}</Pill>
          ))}
        </FilterRow>

        <FilterRow label="Like-Quote" isLight={isLight}>
          <Pill active={lqMin === null} onClick={() => setLqMin(null)} isLight={isLight}>all</Pill>
          {[1.0, 1.5, 3.0].map(v => (
            <Pill key={v} active={lqMin === v} onClick={() => setLqMin(v)} isLight={isLight}>≥ {v.toFixed(1)} %</Pill>
          ))}
          <span className="w-3" />
          <span className={`text-[10px] uppercase tracking-wider font-semibold mr-1 ${text3}`}>Comments/1k</span>
          <Pill active={cpmMin === null} onClick={() => setCpmMin(null)} isLight={isLight}>all</Pill>
          {[1.0, 3.0].map(v => (
            <Pill key={v} active={cpmMin === v} onClick={() => setCpmMin(v)} isLight={isLight}>≥ {v.toFixed(1)}</Pill>
          ))}
          <span className="w-3" />
          <span className={`text-[10px] uppercase tracking-wider font-semibold mr-1 ${text3}`}>Period</span>
          {([['all', 'All'], ['24h', '24h'], ['7d', '7 days'], ['30d', '30 days']] as [PeriodFilter, string][]).map(([key, label]) => (
            <Pill key={key} active={period === key} onClick={() => setPeriod(key)} isLight={isLight}>{label}</Pill>
          ))}
        </FilterRow>
      </div>

      {visiblePosts.length === 0 ? (
        <Card className="py-16 text-center">
          <p className={`text-[13px] ${text2}`}>No posts match these filters</p>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {visiblePosts.map(p => (
            <PostCard
              key={p.id}
              post={p}
              medianViews={metrics.medianViews}
              onToggleTrial={() => toggleTrial(p)}
              isLight={isLight}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ═══ Pieces ═════════════════════════════════════════════════════════════════
function Pill({ active, onClick, children, isLight }: {
  active: boolean; onClick: () => void; children: React.ReactNode; isLight: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1 rounded-lg text-[12px] font-medium whitespace-nowrap transition-all duration-150 ${
        active
          ? 'bg-pink-600 text-white shadow-sm shadow-pink-600/20'
          : isLight
            ? 'bg-black/[0.03] text-black/50 hover:text-black/80 hover:bg-black/[0.06]'
            : 'bg-white/[0.05] text-white/50 hover:text-white/85 hover:bg-white/[0.09]'
      }`}
    >
      {children}
    </button>
  )
}

function FilterRow({ label, children, isLight }: { label: string; children: React.ReactNode; isLight: boolean }) {
  const text3 = isLight ? 'text-black/30' : 'text-white/30'
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className={`text-[10px] uppercase tracking-wider font-semibold mr-1 ${text3}`}>{label}</span>
      {children}
    </div>
  )
}

function Metric({ label, value, sub, tone, isLight }: {
  label: string; value: string; sub?: string; tone?: 'good' | 'bad'; isLight: boolean
}) {
  const text1 = isLight ? 'text-black/90' : 'text-white/90'
  const text3 = isLight ? 'text-black/30' : 'text-white/30'
  const toneCls = tone === 'good' ? 'text-emerald-500' : tone === 'bad' ? 'text-rose-500' : text1
  return (
    <Card className="px-4 py-3.5">
      <p className={`text-[10px] uppercase tracking-wider font-semibold truncate ${text3}`} title={label}>{label}</p>
      <p className={`text-[20px] font-bold mt-1.5 tabular-nums whitespace-nowrap ${toneCls}`}>{value}</p>
      {sub && <p className={`text-[10.5px] mt-1 ${text3}`}>{sub}</p>}
    </Card>
  )
}

// Bar per post, newest last. Green = beats the median, red = far below it.
function ViewsPerPostChart({ posts, medianViews, windowDays, isLight }: {
  posts: Post[]; medianViews: number; windowDays: number; isLight: boolean
}) {
  const text1 = isLight ? 'text-black/90' : 'text-white/90'
  const text3 = isLight ? 'text-black/30' : 'text-white/30'

  const ordered = useMemo(
    () => [...posts].sort((a, b) => postDate(a) - postDate(b)),
    [posts],
  )
  const max = Math.max(1, ...ordered.map(p => p.video_view_count))

  if (ordered.length === 0) {
    return (
      <Card className="px-5 py-10 text-center">
        <p className={`text-[13px] ${isLight ? 'text-black/50' : 'text-white/50'}`}>No posts in the last {windowDays} days</p>
      </Card>
    )
  }

  return (
    <Card className="px-5 py-4">
      <p className={`text-[13px] font-semibold mb-4 ${text1}`}>Views per post ({windowDays} days)</p>
      <div className="flex items-end gap-[3px] h-48">
        {ordered.map(p => {
          const ratio = p.video_view_count / max
          const vsMedian = medianViews > 0 ? p.video_view_count / medianViews : 1
          const color = vsMedian >= 1.5 ? 'bg-emerald-500' : vsMedian >= 0.5 ? (isLight ? 'bg-black/20' : 'bg-white/25') : 'bg-rose-500'
          const date = postDateLabel(p, { day: '2-digit', month: '2-digit' })
          return (
            <div
              key={p.id}
              title={`${date} · ${fmt(p.video_view_count)} views`}
              className={`flex-1 min-w-[3px] rounded-t-sm transition-opacity hover:opacity-70 ${color}`}
              style={{ height: `${Math.max(2, ratio * 100)}%` }}
            />
          )
        })}
      </div>
      <div className={`flex justify-between mt-2 text-[10px] ${text3}`}>
        <span>{postDateLabel(ordered[0], { day: '2-digit', month: 'short' })}</span>
        <span>median {fmt(medianViews)}</span>
        <span>{postDateLabel(ordered[ordered.length - 1], { day: '2-digit', month: 'short' })}</span>
      </div>
    </Card>
  )
}

function PostCard({ post, medianViews, onToggleTrial, isLight }: {
  post: Post; medianViews: number; onToggleTrial: () => void; isLight: boolean
}) {
  const text1 = isLight ? 'text-black/90' : 'text-white/90'
  const text2 = isLight ? 'text-black/50' : 'text-white/50'
  const text3 = isLight ? 'text-black/30' : 'text-white/30'

  const lq = likeQuote(post)
  const vsMedian = medianViews > 0 ? ((post.video_view_count - medianViews) / medianViews) * 100 : null
  const isNew = new Date(post.first_seen_at).getTime() > daysAgo(2)
  const date = postDateLabel(post, { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <div className="flex flex-col">
      <a
        href={`https://instagram.com/p/${post.post_short_code}`}
        target="_blank"
        rel="noopener noreferrer"
        className={`relative block aspect-[9/16] rounded-xl overflow-hidden group ${isLight ? 'bg-black/[0.05]' : 'bg-white/[0.05]'}`}
      >
        {post.display_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={proxy(post.display_url)}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <Play className={`h-5 w-5 ${text3}`} />
          </div>
        )}
        {isNew && (
          <span className="absolute bottom-1.5 right-1.5 rounded px-1.5 py-0.5 text-[9px] font-bold bg-pink-600 text-white">
            NEW
          </span>
        )}
        {post.is_trial && (
          <span className="absolute top-1.5 left-1.5 rounded px-1.5 py-0.5 text-[9px] font-bold bg-black/70 text-white">
            TRIAL
          </span>
        )}
      </a>

      <div className="mt-1.5 px-0.5">
        <div className="flex items-baseline gap-1.5">
          <span className={`text-[14px] font-bold tabular-nums ${text1}`}>{fmt(post.video_view_count)}</span>
          {vsMedian !== null && (
            <span className={`text-[11px] font-medium tabular-nums ${vsMedian >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {vsMedian > 0 ? '+' : ''}{vsMedian.toFixed(0)}%
            </span>
          )}
        </div>
        <div className="flex items-center gap-2.5 mt-0.5">
          <span className={`inline-flex items-center gap-1 text-[11px] tabular-nums ${lq !== null && lq >= LIKE_QUOTE_TARGET ? 'text-emerald-500' : text2}`}>
            <Heart className="h-3 w-3" />{lq !== null ? lq.toFixed(1) + ' %' : '—'}
          </span>
          <span className={`inline-flex items-center gap-1 text-[11px] tabular-nums ${text2}`}>
            <MessageSquare className="h-3 w-3" />{fmt(post.comments_count)}
          </span>
        </div>
        <p className={`text-[10.5px] mt-1 ${text3}`}>{date}</p>
        {post.caption && (
          <p className={`text-[11px] mt-0.5 line-clamp-2 ${text2}`}>{post.caption}</p>
        )}
        <button
          onClick={onToggleTrial}
          className={`text-[10.5px] mt-1 transition-colors ${
            isLight ? 'text-black/35 hover:text-black/70' : 'text-white/35 hover:text-white/70'
          }`}
        >
          {post.is_trial ? 'unmark Trial' : 'mark as Trial'}
        </button>
      </div>
    </div>
  )
}
