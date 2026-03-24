'use client'

import { useState, useEffect, useRef } from 'react'
import { useTheme } from './ThemeProvider'

interface SocialAccount {
  id: string
  creator_id: string
  platform: 'instagram' | 'tiktok'
  username: string
  is_active: boolean
  created_at: string
}

interface SocialSnapshot {
  id: string
  social_account_id: string
  scraped_at: string
  followers: number | null
  following: number | null
  post_count: number | null
  total_views: number | null
  total_likes: number | null
  total_comments: number | null
  raw_data: any
}

interface AccountWithSnapshot extends SocialAccount {
  snapshot: SocialSnapshot | null
}

function fmt(n: number | null | undefined): string {
  if (n == null) return '—'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toLocaleString()
}

function proxy(url: string | undefined) {
  if (!url) return undefined
  return `/api/admin/proxy-image?url=${encodeURIComponent(url)}`
}

function StatPill({ label, value, highlight, isLight }: { label: string; value: string; highlight?: boolean; isLight: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className={`text-lg font-bold ${highlight ? 'text-emerald-500' : isLight ? 'text-black' : 'text-white'}`}>{value}</span>
      <span className={`text-[11px] uppercase tracking-wide ${isLight ? 'text-black/40' : 'text-white/40'}`}>{label}</span>
    </div>
  )
}

function PostCard({ post, isLight }: { post: any; isLight: boolean }) {
  const igUrl = post.shortCode
    ? `https://www.instagram.com/reel/${post.shortCode}/`
    : post.url || null

  const card = (
    <div className={`relative flex-shrink-0 w-[260px] rounded-xl overflow-hidden bg-black/10 group ${igUrl ? 'cursor-pointer' : ''}`}>
      {post.displayUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={proxy(post.displayUrl)}
          alt={post.caption?.slice(0, 40) || 'Post'}
          className="w-full h-[320px] object-cover"
          onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
      ) : (
        <div className="w-full h-[320px] bg-black/10 flex items-center justify-center">
          <span className="text-black/20 text-xs">No image</span>
        </div>
      )}
      {/* Caption overlay — text always white so it shows over the image */}
      {post.caption && (
        <div className="absolute bottom-8 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-3 pt-8 pb-2">
          <p style={{ color: 'white' }} className="text-[11px] leading-tight line-clamp-2">{post.caption}</p>
        </div>
      )}
      {/* Stats bar — responds to theme */}
      <div className={`flex items-center justify-between px-3 py-2 text-[11px] gap-1 ${
        isLight ? 'bg-black/[0.06] text-black/60' : 'bg-black/70 text-white'
      }`}>
        <span className="flex items-center gap-1">▶ {fmt(post.videoViewCount)}</span>
        <span className="flex items-center gap-1">♥ {fmt(post.likesCount)}</span>
        <span className="flex items-center gap-1">💬 {fmt(post.commentsCount)}</span>
      </div>
    </div>
  )

  if (igUrl) {
    return (
      <a href={igUrl} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
        {card}
      </a>
    )
  }
  return card
}

function AccountSection({
  account,
  onDelete,
  onScrape,
  scraping,
  isLight,
}: {
  account: AccountWithSnapshot
  onDelete: (id: string) => void
  onScrape: (id: string) => void
  scraping: boolean
  isLight: boolean
}) {
  const snap = account.snapshot
  const posts: any[] = snap?.raw_data?.latestPosts ?? []
  const profilePic = snap?.raw_data?.profilePicUrl
  const scrollRef = useRef<HTMLDivElement>(null)

  function scroll(dir: 'left' | 'right') {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === 'right' ? 280 : -280, behavior: 'smooth' })
    }
  }

  const card = isLight
    ? 'rounded-2xl border border-black/[0.08] bg-black/[0.02]'
    : 'rounded-2xl border border-white/[0.08] bg-white/[0.03]'
  const divider = isLight ? 'border-black/[0.06]' : 'border-white/[0.06]'
  const textMuted = isLight ? 'text-black/40' : 'text-white/40'
  const textMain = isLight ? 'text-black/80' : 'text-white/80'

  return (
    <div className={card}>
      {/* Account header */}
      <div className={`flex items-center gap-4 px-5 py-4 border-b ${divider}`}>
        <div className="w-10 h-10 rounded-full overflow-hidden bg-black/10 flex-shrink-0">
          {profilePic ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={proxy(profilePic)}
              alt={account.username}
              className="w-full h-full object-cover"
              onError={e => {
                const el = e.target as HTMLImageElement
                el.style.display = 'none'
                el.parentElement!.innerHTML = account.platform === 'instagram' ? '📸' : '🎵'
              }}
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center text-lg ${textMuted}`}>
              {account.platform === 'instagram' ? '📸' : '🎵'}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <a
              href={`https://www.instagram.com/${account.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-[14px] font-semibold transition-colors ${isLight ? 'text-black hover:text-black/60' : 'text-white hover:text-white/70'}`}
            >
              @{account.username}
            </a>
            <span className={`text-[10px] border px-1.5 py-0.5 rounded-full capitalize ${isLight ? 'text-black/30 border-black/[0.1]' : 'text-white/30 border-white/[0.08]'}`}>
              {account.platform}
            </span>
          </div>
          {snap?.scraped_at && (
            <p className={`text-[11px] mt-0.5 ${textMuted}`}>
              Last scraped {new Date(snap.scraped_at).toLocaleString()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onScrape(account.id)}
            disabled={scraping}
            className={`px-3 py-1.5 text-[11px] font-medium rounded-lg transition-colors disabled:opacity-40 flex items-center gap-1.5 ${isLight ? 'bg-black/[0.06] hover:bg-black/[0.10] text-black/70' : 'bg-white/[0.08] hover:bg-white/[0.12] text-white'}`}
          >
            {scraping ? (
              <>
                <span className="animate-spin inline-block w-3 h-3 border border-current border-t-transparent rounded-full" />
                Scraping…
              </>
            ) : (
              <>↻ Scrape</>
            )}
          </button>
          <button
            onClick={() => onDelete(account.id)}
            className="px-3 py-1.5 text-[11px] font-medium bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
          >
            Remove
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className={`grid grid-cols-3 md:grid-cols-6 gap-4 px-5 py-4 border-b ${divider}`}>
        <StatPill label="Followers" value={fmt(snap?.followers)} isLight={isLight} />
        <StatPill label="Following" value={fmt(snap?.following)} isLight={isLight} />
        <StatPill label="Posts" value={fmt(snap?.post_count)} isLight={isLight} />
        <StatPill label="Views" value={fmt(snap?.total_views)} highlight isLight={isLight} />
        <StatPill label="Likes" value={fmt(snap?.total_likes)} isLight={isLight} />
        <StatPill label="Comments" value={fmt(snap?.total_comments)} isLight={isLight} />
      </div>

      {/* Posts carousel */}
      {posts.length > 0 ? (
        <div className="px-5 py-4">
          <p className={`text-[11px] uppercase tracking-wide mb-3 ${textMuted}`}>Recent posts</p>
          {/* Wrapper with side padding so arrows sit inside the card boundary */}
          <div className="relative px-8">
            <button
              onClick={() => scroll('left')}
              className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition-colors shadow ${isLight ? 'bg-black/10 hover:bg-black/20 text-black/60' : 'bg-white/10 hover:bg-white/20 text-white/70'}`}
            >
              ‹
            </button>
            <div
              ref={scrollRef}
              className="flex gap-3 overflow-x-auto pb-1"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {posts.map((post: any) => (
                <PostCard key={post.id} post={post} isLight={isLight} />
              ))}
            </div>
            <button
              onClick={() => scroll('right')}
              className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition-colors shadow ${isLight ? 'bg-black/10 hover:bg-black/20 text-black/60' : 'bg-white/10 hover:bg-white/20 text-white/70'}`}
            >
              ›
            </button>
          </div>
        </div>
      ) : (
        <div className={`px-5 py-6 text-center text-[12px] ${textMuted}`}>
          {snap ? 'No post data available from last scrape' : 'No data yet — click Scrape to fetch stats'}
        </div>
      )}
    </div>
  )
}

export default function SocialTab({ creatorId }: { creatorId: string }) {
  const { resolved: themeMode } = useTheme()
  const isLight = themeMode === 'light'

  const [accounts, setAccounts] = useState<AccountWithSnapshot[]>([])
  const [loading, setLoading] = useState(true)
  const [scrapingAll, setScrapingAll] = useState(false)
  const [scrapingId, setScrapingId] = useState<string | null>(null)
  const [newUsername, setNewUsername] = useState('')
  const [newPlatform, setNewPlatform] = useState<'instagram' | 'tiktok'>('instagram')
  const [adding, setAdding] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  async function loadAccounts() {
    setLoading(true)
    try {
      const accountsRes = await fetch(`/api/admin/social-accounts?creator_id=${creatorId}`)
      const accountsData: SocialAccount[] = await accountsRes.json()
      const withSnapshots: AccountWithSnapshot[] = await Promise.all(
        accountsData.map(async (acc) => {
          const snapRes = await fetch(`/api/admin/scrape?social_account_id=${acc.id}&limit=1`)
          const snapData: SocialSnapshot[] = await snapRes.json()
          return { ...acc, snapshot: snapData[0] ?? null }
        })
      )
      setAccounts(withSnapshots)
    } catch (e) {
      showToast('Failed to load social accounts', 'error')
    }
    setLoading(false)
  }

  useEffect(() => {
    loadAccounts()
  }, [creatorId])

  async function addAccount() {
    if (!newUsername.trim()) return
    setAdding(true)
    try {
      const res = await fetch('/api/admin/social-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creator_id: creatorId, platform: newPlatform, username: newUsername.trim() }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to add account')
      }
      setNewUsername('')
      showToast(`@${newUsername.trim()} added`, 'success')
      await loadAccounts()
    } catch (e: any) {
      showToast(e.message, 'error')
    }
    setAdding(false)
  }

  async function deleteAccount(id: string) {
    if (!confirm('Remove this account?')) return
    try {
      await fetch(`/api/admin/social-accounts?id=${id}`, { method: 'DELETE' })
      showToast('Account removed', 'success')
      setAccounts(prev => prev.filter(a => a.id !== id))
    } catch {
      showToast('Failed to remove account', 'error')
    }
  }

  async function scrapeAccount(accountId: string) {
    setScrapingId(accountId)
    try {
      const res = await fetch('/api/admin/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ social_account_id: accountId }),
      })
      const data = await res.json()
      const result = data.results?.[0]
      if (result?.error) throw new Error(result.error)
      showToast('Scraped successfully', 'success')
      await loadAccounts()
    } catch (e: any) {
      showToast(e.message || 'Scrape failed', 'error')
    }
    setScrapingId(null)
  }

  async function scrapeAll() {
    setScrapingAll(true)
    try {
      const res = await fetch('/api/admin/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creator_id: creatorId }),
      })
      const data = await res.json()
      const errors = data.results?.filter((r: any) => r.error) ?? []
      if (errors.length > 0) {
        showToast(`${errors.length} account(s) failed to scrape`, 'error')
      } else {
        showToast('All accounts scraped', 'success')
      }
      await loadAccounts()
    } catch {
      showToast('Scrape failed', 'error')
    }
    setScrapingAll(false)
  }

  const totals = accounts.reduce(
    (acc, a) => ({
      followers: acc.followers + (a.snapshot?.followers ?? 0),
      views: acc.views + (a.snapshot?.total_views ?? 0),
      likes: acc.likes + (a.snapshot?.total_likes ?? 0),
      comments: acc.comments + (a.snapshot?.total_comments ?? 0),
    }),
    { followers: 0, views: 0, likes: 0, comments: 0 }
  )

  const textMuted = isLight ? 'text-black/40' : 'text-white/40'
  const inputClass = isLight
    ? 'bg-black/[0.04] border border-black/[0.08] text-black placeholder-black/30 focus:outline-none focus:border-black/20'
    : 'bg-white/[0.06] border border-white/[0.08] text-white placeholder-white/30 focus:outline-none focus:border-white/20'

  return (
    <div className="space-y-5">
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-8 right-8 z-50 px-4 py-3 rounded-xl text-[13px] font-medium shadow-xl border ${
          toast.type === 'success'
            ? 'bg-emerald-500/15 border-emerald-500/20 text-emerald-600'
            : 'bg-red-500/15 border-red-500/20 text-red-500'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Header actions */}
      <div className="flex items-center justify-between">
        <h2 className={`text-[15px] font-semibold ${isLight ? 'text-black' : 'text-white'}`}>Social Media Stats</h2>
        {accounts.length > 0 && (
          <button
            onClick={scrapeAll}
            disabled={scrapingAll}
            className="px-4 py-2 text-[12px] font-medium bg-white text-black rounded-lg hover:bg-white/90 transition-colors disabled:opacity-40 flex items-center gap-2 border border-black/10"
          >
            {scrapingAll ? (
              <>
                <span className="animate-spin inline-block w-3 h-3 border border-black/40 border-t-black rounded-full" />
                Scraping all…
              </>
            ) : (
              '↻ Scrape all'
            )}
          </button>
        )}
      </div>

      {/* Summary stats */}
      {accounts.some(a => a.snapshot) && (
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 rounded-2xl border px-6 py-5 ${isLight ? 'border-black/[0.08] bg-black/[0.02]' : 'border-white/[0.08] bg-white/[0.03]'}`}>
          <StatPill label="Total Followers" value={fmt(totals.followers)} highlight isLight={isLight} />
          <StatPill label="Total Views" value={fmt(totals.views)} highlight isLight={isLight} />
          <StatPill label="Total Likes" value={fmt(totals.likes)} isLight={isLight} />
          <StatPill label="Total Comments" value={fmt(totals.comments)} isLight={isLight} />
        </div>
      )}

      {/* Add account */}
      <div className="flex gap-2 items-center">
        <select
          value={newPlatform}
          onChange={e => setNewPlatform(e.target.value as 'instagram' | 'tiktok')}
          className={`px-3 py-2 rounded-lg text-[13px] ${inputClass}`}
        >
          <option value="instagram">Instagram</option>
          <option value="tiktok">TikTok</option>
        </select>
        <input
          value={newUsername}
          onChange={e => setNewUsername(e.target.value.replace('@', ''))}
          onKeyDown={e => e.key === 'Enter' && addAccount()}
          placeholder="username (without @)"
          className={`flex-1 px-3 py-2 rounded-lg text-[13px] ${inputClass}`}
        />
        <button
          onClick={addAccount}
          disabled={adding || !newUsername.trim()}
          className="px-4 py-2 bg-black text-white text-[12px] font-medium rounded-lg hover:bg-black/80 transition-colors disabled:opacity-40"
        >
          {adding ? 'Adding…' : '+ Add'}
        </button>
      </div>

      {/* Accounts list */}
      {loading ? (
        <div className={`text-center py-12 text-[13px] ${textMuted}`}>Loading…</div>
      ) : accounts.length === 0 ? (
        <div className={`text-center py-12 text-[13px] border rounded-2xl ${isLight ? 'text-black/30 border-black/[0.06]' : 'text-white/30 border-white/[0.06]'}`}>
          No social accounts added yet. Add one above to start tracking.
        </div>
      ) : (
        <div className="space-y-4">
          {accounts.map(account => (
            <AccountSection
              key={account.id}
              account={account}
              onDelete={deleteAccount}
              onScrape={scrapeAccount}
              scraping={scrapingId === account.id}
              isLight={isLight}
            />
          ))}
        </div>
      )}
    </div>
  )
}
