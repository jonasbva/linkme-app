'use client'

import { useState, useEffect, useRef } from 'react'

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

function StatPill({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className={`text-lg font-bold ${highlight ? 'text-emerald-400' : 'text-white'}`}>{value}</span>
      <span className="text-[11px] text-white/40 uppercase tracking-wide">{label}</span>
    </div>
  )
}

function PostCard({ post }: { post: any }) {
  return (
    <div className="relative flex-shrink-0 w-[160px] rounded-xl overflow-hidden bg-white/[0.05] group">
      {post.displayUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.displayUrl}
          alt={post.caption?.slice(0, 40) || 'Post'}
          className="w-full h-[200px] object-cover"
          onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
      ) : (
        <div className="w-full h-[200px] bg-white/[0.05] flex items-center justify-center">
          <span className="text-white/20 text-xs">No image</span>
        </div>
      )}
      {/* Caption overlay */}
      {post.caption && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-2 pt-6 pb-2">
          <p className="text-white text-[10px] leading-tight line-clamp-2">{post.caption}</p>
        </div>
      )}
      {/* Stats bar */}
      <div className="flex items-center justify-between px-2 py-2 bg-black/60 text-[10px] text-white/70 gap-1">
        <span className="flex items-center gap-0.5">▶ {fmt(post.videoViewCount)}</span>
        <span className="flex items-center gap-0.5">♥ {fmt(post.likesCount)}</span>
        <span className="flex items-center gap-0.5">💬 {fmt(post.commentsCount)}</span>
      </div>
    </div>
  )
}

function AccountSection({
  account,
  onDelete,
  onScrape,
  scraping,
}: {
  account: AccountWithSnapshot
  onDelete: (id: string) => void
  onScrape: (id: string) => void
  scraping: boolean
}) {
  const snap = account.snapshot
  const posts: any[] = snap?.raw_data?.latestPosts ?? []
  const profilePic = snap?.raw_data?.profilePicUrl
  const scrollRef = useRef<HTMLDivElement>(null)

  function scroll(dir: 'left' | 'right') {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === 'right' ? 180 : -180, behavior: 'smooth' })
    }
  }

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] overflow-hidden">
      {/* Account header */}
      <div className="flex items-center gap-4 px-5 py-4 border-b border-white/[0.06]">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10 flex-shrink-0">
          {profilePic ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profilePic} alt={account.username} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/30 text-lg">
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
              className="text-[14px] font-semibold text-white hover:text-white/70 transition-colors"
            >
              @{account.username}
            </a>
            <span className="text-[10px] text-white/30 border border-white/[0.08] px-1.5 py-0.5 rounded-full capitalize">
              {account.platform}
            </span>
          </div>
          {snap?.scraped_at && (
            <p className="text-[11px] text-white/30 mt-0.5">
              Last scraped {new Date(snap.scraped_at).toLocaleString()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onScrape(account.id)}
            disabled={scraping}
            className="px-3 py-1.5 text-[11px] font-medium bg-white/[0.08] hover:bg-white/[0.12] text-white rounded-lg transition-colors disabled:opacity-40 flex items-center gap-1.5"
          >
            {scraping ? (
              <>
                <span className="animate-spin inline-block w-3 h-3 border border-white/40 border-t-white rounded-full" />
                Scraping…
              </>
            ) : (
              <>↻ Scrape</>
            )}
          </button>
          <button
            onClick={() => onDelete(account.id)}
            className="px-3 py-1.5 text-[11px] font-medium bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
          >
            Remove
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-4 px-5 py-4 border-b border-white/[0.06]">
        <StatPill label="Followers" value={fmt(snap?.followers)} />
        <StatPill label="Following" value={fmt(snap?.following)} />
        <StatPill label="Posts" value={fmt(snap?.post_count)} />
        <StatPill label="Views" value={fmt(snap?.total_views)} highlight />
        <StatPill label="Likes" value={fmt(snap?.total_likes)} />
        <StatPill label="Comments" value={fmt(snap?.total_comments)} />
      </div>

      {/* Posts carousel */}
      {posts.length > 0 ? (
        <div className="px-5 py-4 relative">
          <p className="text-[11px] text-white/30 uppercase tracking-wide mb-3">Recent posts</p>
          <div className="relative">
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 w-7 h-7 bg-black/80 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-colors"
            >
              ‹
            </button>
            <div
              ref={scrollRef}
              className="flex gap-3 overflow-x-auto scrollbar-hide pb-1"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {posts.map((post: any) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 w-7 h-7 bg-black/80 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-colors"
            >
              ›
            </button>
          </div>
        </div>
      ) : (
        <div className="px-5 py-6 text-center text-white/30 text-[12px]">
          {snap ? 'No post data available from last scrape' : 'No data yet — click Scrape to fetch stats'}
        </div>
      )}
    </div>
  )
}

export default function SocialTab({ creatorId }: { creatorId: string }) {
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
      // Load accounts
      const accountsRes = await fetch(`/api/admin/social-accounts?creator_id=${creatorId}`)
      const accountsData: SocialAccount[] = await accountsRes.json()

      // Load latest snapshot for each account
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

  // Summary totals across all accounts
  const totals = accounts.reduce(
    (acc, a) => ({
      followers: acc.followers + (a.snapshot?.followers ?? 0),
      views: acc.views + (a.snapshot?.total_views ?? 0),
      likes: acc.likes + (a.snapshot?.total_likes ?? 0),
      comments: acc.comments + (a.snapshot?.total_comments ?? 0),
    }),
    { followers: 0, views: 0, likes: 0, comments: 0 }
  )

  return (
    <div className="space-y-5">
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-8 right-8 z-50 px-4 py-3 rounded-xl text-[13px] font-medium shadow-xl border ${
          toast.type === 'success'
            ? 'bg-emerald-500/15 border-emerald-500/20 text-emerald-400'
            : 'bg-red-500/15 border-red-500/20 text-red-400'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Header actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-semibold text-white">Social Media Stats</h2>
        {accounts.length > 0 && (
          <button
            onClick={scrapeAll}
            disabled={scrapingAll}
            className="px-4 py-2 text-[12px] font-medium bg-white text-black rounded-lg hover:bg-white/90 transition-colors disabled:opacity-40 flex items-center gap-2"
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-6 py-5">
          <StatPill label="Total Followers" value={fmt(totals.followers)} highlight />
          <StatPill label="Total Views" value={fmt(totals.views)} highlight />
          <StatPill label="Total Likes" value={fmt(totals.likes)} />
          <StatPill label="Total Comments" value={fmt(totals.comments)} />
        </div>
      )}

      {/* Add account */}
      <div className="flex gap-2 items-center">
        <select
          value={newPlatform}
          onChange={e => setNewPlatform(e.target.value as 'instagram' | 'tiktok')}
          className="px-3 py-2 bg-white/[0.06] border border-white/[0.08] rounded-lg text-[13px] text-white focus:outline-none"
        >
          <option value="instagram">Instagram</option>
          <option value="tiktok">TikTok</option>
        </select>
        <input
          value={newUsername}
          onChange={e => setNewUsername(e.target.value.replace('@', ''))}
          onKeyDown={e => e.key === 'Enter' && addAccount()}
          placeholder="username (without @)"
          className="flex-1 px-3 py-2 bg-white/[0.06] border border-white/[0.08] rounded-lg text-[13px] text-white placeholder-white/30 focus:outline-none focus:border-white/20"
        />
        <button
          onClick={addAccount}
          disabled={adding || !newUsername.trim()}
          className="px-4 py-2 bg-white text-black text-[12px] font-medium rounded-lg hover:bg-white/90 transition-colors disabled:opacity-40"
        >
          {adding ? 'Adding…' : '+ Add'}
        </button>
      </div>

      {/* Accounts list */}
      {loading ? (
        <div className="text-center py-12 text-white/30 text-[13px]">Loading…</div>
      ) : accounts.length === 0 ? (
        <div className="text-center py-12 text-white/30 text-[13px] border border-white/[0.06] rounded-2xl">
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
            />
          ))}
        </div>
      )}
    </div>
  )
}
