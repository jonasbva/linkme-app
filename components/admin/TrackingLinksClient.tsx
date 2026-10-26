'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Link2, Plus, Trash2, Instagram, ExternalLink, Zap, RefreshCw } from 'lucide-react'
import { useTheme } from './ThemeProvider'
import { Button, Card } from './ui'

interface Creator {
  id: string
  display_name: string
  slug: string
  of_handle?: string | null
}

interface TrackingLink {
  id: string
  creator_id: string
  social_account_id?: string | null
  label: string
  url?: string | null
  sort_order: number
  is_active: boolean
  infloww_link_id?: string | null
  infloww_link_name?: string | null
}

interface InflowwLink {
  id: string
  name: string
  code: string
  clickCount: number
  subCount: number
  taken_by: { id: string; label: string } | null
  suggested_account_id: string | null
  suggested_username: string | null
}

interface SocialAccount {
  id: string
  platform: string
  username: string
  is_active: boolean
}

interface Props {
  creator: Creator
  links: TrackingLink[]
  socialAccounts: SocialAccount[]
}

export default function TrackingLinksClient({ creator, links: initialLinks, socialAccounts }: Props) {
  const router = useRouter()
  const { resolved } = useTheme()
  const isLight = resolved === 'light'

  const [links, setLinks] = useState<TrackingLink[]>(initialLinks)
  const [label, setLabel] = useState('')
  const [url, setUrl] = useState('')
  const [accountId, setAccountId] = useState('')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ── Connecting existing links to Infloww ──
  const [showInfloww, setShowInfloww] = useState(false)
  const [inflowwLinks, setInflowwLinks] = useState<InflowwLink[]>([])
  const [loadingInfloww, setLoadingInfloww] = useState(false)
  const [inflowwError, setInflowwError] = useState<string | null>(null)
  const [connectingId, setConnectingId] = useState<string | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [syncNote, setSyncNote] = useState<string | null>(null)

  const connectedCount = links.filter(l => l.infloww_link_id).length


  // Pull today's counters now instead of waiting for the nightly cron. A day's
  // clicks need yesterday's snapshot to subtract from, so the first run on a
  // link only lays the baseline.
  async function syncNow() {
    setSyncing(true)
    setSyncNote(null)
    try {
      const res = await fetch('/api/admin/infloww/sync-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creator_id: creator.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Sync failed')
      const parts: string[] = []
      if (data.newlyConnected > 0) {
        parts.push(`${data.newlyConnected} new link${data.newlyConnected === 1 ? '' : 's'} connected automatically`)
      }
      parts.push(`${data.snapshotsWritten} link${data.snapshotsWritten === 1 ? '' : 's'} refreshed`)
      if (data.dailyRowsWritten > 0) parts.push(`${data.dailyRowsWritten} day row${data.dailyRowsWritten === 1 ? '' : 's'} filled`)
      else if (data.snapshotsWritten > 0) parts.push('baseline set — daily numbers start tomorrow')
      if (data.errors?.length) parts.push(data.errors[0])
      setSyncNote(parts.join(' · '))
      router.refresh()
    } catch (e: any) {
      setSyncNote(e.message)
    }
    setSyncing(false)
  }

  async function loadInflowwLinks() {
    setLoadingInfloww(true)
    setInflowwError(null)
    try {
      const res = await fetch(`/api/admin/creators/${creator.id}/infloww-links`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not reach Infloww')
      if (data.unmapped) throw new Error(data.message || 'This creator is not matched to an Infloww account yet')
      setInflowwLinks(data.links || [])
    } catch (e: any) {
      setInflowwError(e.message)
      setInflowwLinks([])
    }
    setLoadingInfloww(false)
  }

  function openInfloww() {
    const next = !showInfloww
    setShowInfloww(next)
    if (next && inflowwLinks.length === 0) loadInflowwLinks()
  }

  // Attach an Infloww link to the account it looks like it belongs to. If that
  // account already has a tracking link, connect that one rather than leaving a
  // second, half-empty row beside it.
  async function connect(link: InflowwLink) {
    if (!link.suggested_account_id) return
    setConnectingId(link.id)
    setInflowwError(null)
    try {
      const existing = links.find(l => l.social_account_id === link.suggested_account_id)
      const payload = {
        infloww_link_id: link.id,
        infloww_link_name: link.name,
        infloww_code: link.code,
      }
      let saved: TrackingLink
      if (existing) {
        const res = await fetch(`/api/admin/creators/${creator.id}/tracking-links/${existing.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, label: link.name || existing.label }),
        })
        saved = await res.json()
        if (!res.ok) throw new Error((saved as any).error || 'Could not connect')
        setLinks(prev => prev.map(l => (l.id === saved.id ? saved : l)))
      } else {
        const res = await fetch(`/api/admin/creators/${creator.id}/tracking-links`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, label: link.name, social_account_id: link.suggested_account_id }),
        })
        saved = await res.json()
        if (!res.ok) throw new Error((saved as any).error || 'Could not connect')
        setLinks(prev => [...prev, saved])
      }
      setInflowwLinks(prev => prev.map(l =>
        l.id === link.id ? { ...l, taken_by: { id: saved.id, label: saved.label } } : l
      ))
      router.refresh()
    } catch (e: any) {
      setInflowwError(e.message)
    }
    setConnectingId(null)
  }

  const text1 = isLight ? 'text-black/90' : 'text-white/90'
  const text2 = isLight ? 'text-black/50' : 'text-white/50'
  const text3 = isLight ? 'text-black/30' : 'text-white/30'
  const border = isLight ? 'border-black/[0.06]' : 'border-white/[0.06]'
  const inputCls = isLight
    ? 'bg-white border border-black/10 text-black/80 placeholder:text-black/25 focus:border-black/30'
    : 'bg-white/[0.05] border border-white/10 text-white/90 placeholder:text-white/20 focus:border-white/30'

  async function addLink() {
    const trimmed = label.trim()
    if (!trimmed) {
      setError('Give the link a label')
      return
    }
    setAdding(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/creators/${creator.id}/tracking-links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: trimmed, url, social_account_id: accountId || null }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to add link')
      setLinks(prev => [...prev, data])
      setLabel(''); setUrl(''); setAccountId('')
      router.refresh()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setAdding(false)
    }
  }

  async function toggleActive(link: TrackingLink) {
    const next = !link.is_active
    setLinks(prev => prev.map(l => (l.id === link.id ? { ...l, is_active: next } : l)))
    await fetch(`/api/admin/creators/${creator.id}/tracking-links/${link.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: next }),
    })
    router.refresh()
  }

  async function removeLink(link: TrackingLink) {
    if (!confirm(`Delete "${link.label}"? Its daily traffic rows go with it.`)) return
    setLinks(prev => prev.filter(l => l.id !== link.id))
    await fetch(`/api/admin/creators/${creator.id}/tracking-links/${link.id}`, { method: 'DELETE' })
    router.refresh()
  }

  const accountById = Object.fromEntries(socialAccounts.map(a => [a.id, a]))

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className={`text-2xl font-bold ${text1}`}>Links</h1>
        <p className={`text-[13px] mt-1 ${text2}`}>
          The links in {creator.display_name}&apos;s IG bios. Each one gets its own daily row for views,
          profile views and link clicks on the Conversions page
          {creator.of_handle ? <> — all of them funnel into <span className="font-mono">@{creator.of_handle}</span>.</> : '.'}
        </p>
      </div>

      {/* ── Add a link ── */}
      <Card className="p-5 mb-6">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <input
            value={label}
            onChange={e => setLabel(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addLink() }}
            placeholder="Label — e.g. @haileysranchlife bio"
            className={`flex-1 rounded-lg px-3 py-2 text-[13px] outline-none transition-colors ${inputCls}`}
          />
          <input
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addLink() }}
            placeholder="URL (optional)"
            className={`flex-1 rounded-lg px-3 py-2 text-[13px] outline-none transition-colors ${inputCls}`}
          />
          <select
            value={accountId}
            onChange={e => setAccountId(e.target.value)}
            className={`rounded-lg px-3 py-2 text-[13px] outline-none ${inputCls}`}
          >
            <option value="">No IG account</option>
            {socialAccounts.map(a => (
              <option key={a.id} value={a.id}>@{a.username}</option>
            ))}
          </select>
          <Button variant="primary" onClick={addLink} loading={adding}>
            <Plus className="h-3.5 w-3.5" /> Add
          </Button>
        </div>
        {error && <p className="text-[12px] text-red-400 mt-2">{error}</p>}
      </Card>

      {/* ── Connect to Infloww ── */}
      <Card className="p-5 mb-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className={`text-[13px] font-medium ${text1}`}>Connect to Infloww</p>
            <p className={`text-[12px] mt-0.5 ${text2}`}>
              A link only reports clicks and subs once it is matched to its Infloww counterpart.
              {connectedCount > 0 && <> {connectedCount} of {links.length} connected.</>}
              {' '}Sync also binds any new exact matches on its own.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="subtle" onClick={syncNow} loading={syncing}>
              <RefreshCw className="h-3.5 w-3.5" /> Sync now
            </Button>
            {showInfloww && (
              <Button variant="ghost" onClick={loadInflowwLinks} loading={loadingInfloww}>
                Reload list
              </Button>
            )}
            <Button variant={showInfloww ? 'ghost' : 'primary'} onClick={openInfloww}>
              <Zap className="h-3.5 w-3.5" /> {showInfloww ? 'Hide' : 'Show Infloww links'}
            </Button>
          </div>
        </div>

        {syncNote && <p className={`text-[12px] mt-3 ${text2}`}>{syncNote}</p>}

        {showInfloww && (
          <div className="mt-4 space-y-2">
            {inflowwError && <p className="text-[12px] text-amber-500">{inflowwError}</p>}
            {loadingInfloww && <p className={`text-[12px] ${text2}`}>Loading links from Infloww…</p>}
            {!loadingInfloww && !inflowwError && inflowwLinks.length === 0 && (
              <p className={`text-[12px] ${text2}`}>No tracking links found for this creator in Infloww.</p>
            )}
            {inflowwLinks.map(l => (
              <div
                key={l.id}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border ${border} ${l.taken_by ? 'opacity-50' : ''}`}
              >
                <div className="min-w-0 flex-1">
                  <p className={`text-[12px] font-medium truncate ${text1}`}>{l.name || `Link ${l.code}`}</p>
                  <p className={`text-[11px] mt-0.5 ${text3}`}>
                    {l.clickCount.toLocaleString()} clicks · {l.subCount.toLocaleString()} subs
                    {l.suggested_username && <> · looks like @{l.suggested_username}</>}
                  </p>
                </div>
                {l.taken_by ? (
                  <span className="text-[11px] px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 whitespace-nowrap">
                    Connected
                  </span>
                ) : l.suggested_account_id ? (
                  <Button
                    variant="primary"
                    onClick={() => connect(l)}
                    loading={connectingId === l.id}
                  >
                    Connect to @{l.suggested_username}
                  </Button>
                ) : (
                  <span className={`text-[11px] px-2 py-1 whitespace-nowrap ${text3}`}>No matching account</span>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ── Existing links ── */}
      {links.length === 0 ? (
        <Card className="py-16 text-center">
          <Link2 className={`h-6 w-6 mx-auto mb-3 ${text3}`} />
          <p className={`text-[13px] ${text2}`}>No links yet</p>
          <p className={`text-[12px] mt-1 ${text3}`}>Add the link each IG account points at to start tracking it.</p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          {links.map((link, i) => {
            const account = link.social_account_id ? accountById[link.social_account_id] : null
            return (
              <div
                key={link.id}
                className={`flex items-center gap-3 px-5 py-3.5 ${i > 0 ? `border-t ${border}` : ''} ${
                  link.is_active ? '' : 'opacity-50'
                }`}
              >
                <Link2 className={`h-4 w-4 shrink-0 ${text3}`} />
                <div className="min-w-0 flex-1">
                  <p className={`text-[13px] font-medium truncate ${text1}`}>{link.label}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {account && (
                      <span className={`inline-flex items-center gap-1 text-[11px] ${text3}`}>
                        <Instagram className="h-3 w-3" />@{account.username}
                      </span>
                    )}
                    {link.infloww_link_id && (
                      <span className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
                        <Zap className="h-2.5 w-2.5" /> Infloww
                      </span>
                    )}
                    {link.url && (
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-1 text-[11px] truncate hover:underline ${text3}`}
                      >
                        <ExternalLink className="h-3 w-3 shrink-0" />
                        <span className="truncate">{link.url}</span>
                      </a>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => toggleActive(link)}
                  className={`text-[11px] px-2 py-1 rounded-lg transition-colors ${
                    isLight ? 'text-black/45 hover:bg-black/[0.05]' : 'text-white/45 hover:bg-white/[0.06]'
                  }`}
                >
                  {link.is_active ? 'Active' : 'Paused'}
                </button>
                <Button variant="danger" onClick={() => removeLink(link)} className="!px-2">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            )
          })}
        </Card>
      )}
    </div>
  )
}
