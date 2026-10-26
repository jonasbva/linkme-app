'use client'

import { useState } from 'react'
import { useTheme } from './ThemeProvider'

// Adding an IG account is really two decisions: the handle, and which OF
// tracking link that handle will carry in its bio. The second one used to be
// nobody's job, which is how 80 accounts ended up with placeholder links and no
// way to attribute a single click. So the flow asks for both, and offers the
// creator's real Infloww links rather than a URL box to paste into.

interface InflowwLinkOption {
  id: string
  name: string
  code: string
  clickCount: number
  subCount: number
  createdTime: string | null
  taken_by: { id: string; label: string } | null
  suggested_username: string | null
  score_for_username: number | null
}

interface CreatorOption {
  id: string
  display_name: string
}

interface Props {
  creatorId: string
  /** When given, the flow asks which creator first — the account list is global. */
  creators?: CreatorOption[]
  onCreatorChange?: (id: string) => void
  platform: 'instagram' | 'tiktok'
  onPlatformChange: (p: 'instagram' | 'tiktok') => void
  onAdded: (message: string) => void
  onError: (message: string) => void
  isLight: boolean
}

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toLocaleString()
}

export default function AddAccountFlow({
  creatorId, creators, onCreatorChange, platform, onPlatformChange, onAdded, onError, isLight,
}: Props) {
  const [username, setUsername] = useState('')
  const [step, setStep] = useState<'handle' | 'link'>('handle')
  const [links, setLinks] = useState<InflowwLinkOption[]>([])
  const [chosen, setChosen] = useState<string | null>(null)
  const [skipLink, setSkipLink] = useState(false)
  const [loadingLinks, setLoadingLinks] = useState(false)
  const [linkError, setLinkError] = useState<string | null>(null)
  const [unmapped, setUnmapped] = useState(false)
  const [adding, setAdding] = useState(false)

  const input = isLight
    ? 'bg-black/[0.04] border border-black/[0.08] text-black placeholder-black/30 focus:outline-none focus:border-black/20'
    : 'bg-white/[0.06] border border-white/[0.08] text-white placeholder-white/30 focus:outline-none focus:border-white/20'
  const muted = isLight ? 'text-black/40' : 'text-white/40'
  const text = isLight ? 'text-black' : 'text-white'
  const panel = isLight
    ? 'rounded-xl border border-black/[0.08] bg-black/[0.02]'
    : 'rounded-xl border border-white/[0.08] bg-white/[0.03]'

  function reset() {
    setUsername(''); setStep('handle'); setLinks([]); setChosen(null)
    setSkipLink(false); setLinkError(null); setUnmapped(false)
  }

  // Step 1 → 2. Fetching here (not on add) means the suggestion is on screen
  // while the decision is being made.
  async function goToLinkStep() {
    const handle = username.replace('@', '').trim()
    if (!handle || !creatorId) return
    setStep('link')
    setLoadingLinks(true)
    setLinkError(null)
    setUnmapped(false)
    try {
      const res = await fetch(
        `/api/admin/creators/${creatorId}/infloww-links?username=${encodeURIComponent(handle)}`
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not load Infloww links')
      setUnmapped(Boolean(data.unmapped))
      const list: InflowwLinkOption[] = data.links || []
      setLinks(list)
      // Pre-select a confident, unclaimed match — but never silently: the row
      // is highlighted and labelled so it can be overruled.
      const best = list.find(l => !l.taken_by && (l.score_for_username || 0) >= 75)
      setChosen(best ? best.id : null)
      setSkipLink(!best && list.length === 0)
    } catch (e: any) {
      setLinkError(e.message)
      setSkipLink(true)
    }
    setLoadingLinks(false)
  }

  async function submit() {
    const handle = username.replace('@', '').trim()
    if (!handle || !creatorId) return
    const link = !skipLink && chosen ? links.find(l => l.id === chosen) : null
    setAdding(true)
    try {
      const res = await fetch('/api/admin/social-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creator_id: creatorId,
          platform,
          username: handle,
          tracking_link: link
            ? {
                infloww_link_id: link.id,
                infloww_link_name: link.name,
                infloww_code: link.code,
                label: link.name || `@${handle} bio`,
              }
            : null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to add account')
      if (data.warning) onError(data.warning)
      else onAdded(link ? `@${handle} added, linked to "${link.name}"` : `@${handle} added — no tracking link yet`)
      reset()
    } catch (e: any) {
      onError(e.message)
    }
    setAdding(false)
  }

  const handle = username.replace('@', '').trim()

  return (
    <div className={`${panel} p-4 space-y-3`}>
      {/* ── Step 1: whose account, and which handle ── */}
      <div className="flex gap-2 items-center flex-wrap">
        {creators && (
          <select
            value={creatorId}
            onChange={e => onCreatorChange?.(e.target.value)}
            disabled={step === 'link'}
            className={`px-3 py-2 rounded-lg text-[13px] disabled:opacity-50 ${input}`}
          >
            <option value="">Creator…</option>
            {creators.map(c => (
              <option key={c.id} value={c.id}>{c.display_name}</option>
            ))}
          </select>
        )}
        <select
          value={platform}
          onChange={e => onPlatformChange(e.target.value as 'instagram' | 'tiktok')}
          disabled={step === 'link'}
          className={`px-3 py-2 rounded-lg text-[13px] disabled:opacity-50 ${input}`}
        >
          <option value="instagram">Instagram</option>
          <option value="tiktok">TikTok</option>
        </select>
        <input
          value={username}
          onChange={e => setUsername(e.target.value.replace('@', ''))}
          onKeyDown={e => e.key === 'Enter' && step === 'handle' && goToLinkStep()}
          disabled={step === 'link'}
          placeholder="username (without @)"
          className={`flex-1 px-3 py-2 rounded-lg text-[13px] disabled:opacity-50 ${input}`}
        />
        {step === 'handle' ? (
          <button
            onClick={goToLinkStep}
            disabled={!handle || !creatorId}
            className="px-4 py-2 bg-black text-white text-[12px] font-medium rounded-lg hover:bg-black/80 transition-colors disabled:opacity-40 whitespace-nowrap"
          >
            Next →
          </button>
        ) : (
          <button
            onClick={reset}
            className={`px-3 py-2 text-[12px] font-medium rounded-lg transition-colors ${isLight ? 'text-black/50 hover:bg-black/[0.05]' : 'text-white/50 hover:bg-white/[0.06]'}`}
          >
            Cancel
          </button>
        )}
      </div>

      {/* ── Step 2: which OF link sits behind it ── */}
      {step === 'link' && (
        <>
          <div>
            <p className={`text-[13px] font-medium ${text}`}>
              Which OnlyFans tracking link is behind @{handle}?
            </p>
            <p className={`text-[11px] mt-0.5 ${muted}`}>
              Infloww counts the clicks and subs on this link — that is how @{handle} gets credit for what it brings in.
            </p>
          </div>

          {loadingLinks ? (
            <p className={`text-[12px] py-3 ${muted}`}>Loading links from Infloww…</p>
          ) : (
            <>
              {linkError && (
                <p className="text-[12px] text-amber-500">
                  {linkError} — you can still add the account and connect its link later.
                </p>
              )}
              {unmapped && (
                <p className="text-[12px] text-amber-500">
                  This creator has no Infloww account matched yet, so there are no links to choose from. Add the
                  account now and connect its link once the creator is mapped.
                </p>
              )}

              {links.length > 0 && (
                <div className="max-h-[260px] overflow-y-auto -mx-1 px-1 space-y-1">
                  {links.map(l => {
                    const taken = Boolean(l.taken_by)
                    const suggested = (l.score_for_username || 0) >= 75 && !taken
                    const active = chosen === l.id && !skipLink
                    return (
                      <button
                        key={l.id}
                        onClick={() => { if (!taken) { setChosen(l.id); setSkipLink(false) } }}
                        disabled={taken}
                        className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${
                          active
                            ? 'border-emerald-500/60 bg-emerald-500/10'
                            : taken
                              ? isLight ? 'border-black/[0.06] opacity-45 cursor-not-allowed' : 'border-white/[0.06] opacity-45 cursor-not-allowed'
                              : isLight ? 'border-black/[0.08] hover:bg-black/[0.03]' : 'border-white/[0.08] hover:bg-white/[0.05]'
                        }`}
                      >
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[12px] font-medium ${text}`}>{l.name || `Link ${l.code}`}</span>
                          {suggested && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500">
                              matches @{handle}
                            </span>
                          )}
                          {taken && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-500">
                              already used by {l.taken_by!.label}
                            </span>
                          )}
                        </div>
                        <div className={`text-[11px] mt-0.5 ${muted}`}>
                          {fmt(l.clickCount)} clicks · {fmt(l.subCount)} subs
                          {l.createdTime ? ` · made ${new Date(l.createdTime).toLocaleDateString()}` : ''}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}

              <button
                onClick={() => { setSkipLink(true); setChosen(null) }}
                className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${
                  skipLink
                    ? 'border-amber-500/50 bg-amber-500/10'
                    : isLight ? 'border-black/[0.08] hover:bg-black/[0.03]' : 'border-white/[0.08] hover:bg-white/[0.05]'
                }`}
              >
                <span className={`text-[12px] font-medium ${text}`}>No link yet</span>
                <span className={`block text-[11px] mt-0.5 ${muted}`}>
                  Add @{handle} now — it will show on the Overview until a link is connected.
                </span>
              </button>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={submit}
                  disabled={adding || (!chosen && !skipLink)}
                  className="px-4 py-2 bg-black text-white text-[12px] font-medium rounded-lg hover:bg-black/80 transition-colors disabled:opacity-40"
                >
                  {adding ? 'Adding…' : `Add @${handle}`}
                </button>
                {!chosen && !skipLink && (
                  <span className={`text-[11px] ${muted}`}>Pick a link, or choose “No link yet”.</span>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
