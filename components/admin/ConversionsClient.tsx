'use client'

import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Target, CalendarDays, Link2, Table2, Search, Check, Save } from 'lucide-react'
import { useTheme } from './ThemeProvider'
import { Card, Button } from './ui'
import DateRangePicker from './DateRangePicker'
import DatePicker from './DatePicker'
import { avatarSrc } from '@/lib/avatar'
import { savedRows } from '@/lib/conversion-save'

// ── Types ───────────────────────────────────────────────────────────────────
interface Creator {
  id: string
  slug: string
  display_name: string
  avatar_url?: string
  is_active: boolean
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
}
interface Expectation { id: string; creator_id: string; daily_sub_target: number }
interface CreatorDailyRow { id: string; creator_id: string; date: string; new_subs: number }
interface LinkDailyRow {
  id: string
  tracking_link_id: string
  date: string
  views: number
  profile_views: number
  link_clicks: number
}

interface Props {
  creators: Creator[]
  trackingLinks: TrackingLink[]
  expectations: Expectation[]
  creatorDaily: CreatorDailyRow[]
  linkDaily: LinkDailyRow[]
  /** Oldest date present in the initial payload; older rows load on demand. */
  loadedSince: string
}

type Tab = 'subs' | 'links' | 'table' | 'targets'

// ── Helpers ─────────────────────────────────────────────────────────────────
function todayISO(offsetDays = 0): string {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().split('T')[0]
}
function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toLocaleString()
}
function fmtDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}

function SaveFeedback({ saved, error }: { saved: boolean; error: string | null }) {
  if (error) return <p role="alert" className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">{error}</p>
  if (saved) return <p role="status" className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-500">Changes saved successfully.</p>
  return null
}

// ═══════════════════════════════════════════════════════════════════════════
export default function ConversionsClient({
  creators,
  trackingLinks,
  expectations: initialExpectations,
  creatorDaily: initialCreatorDaily,
  linkDaily: initialLinkDaily,
  loadedSince,
}: Props) {
  const { resolved } = useTheme()
  const isLight = resolved === 'light'
  const searchParams = useSearchParams()
  const preselected = searchParams.get('creator')

  const [tab, setTab] = useState<Tab>('subs')
  const [expectations, setExpectations] = useState(initialExpectations)
  const [creatorDaily, setCreatorDaily] = useState(initialCreatorDaily)
  const [linkDaily, setLinkDaily] = useState(initialLinkDaily)
  const [earliestLoaded, setEarliestLoaded] = useState(loadedSince)
  const [loadingHistory, setLoadingHistory] = useState(false)

  // The first render only carries recent history. If a date range reaches
  // further back, pull the missing slice once and merge it in.
  async function ensureLoaded(from: string) {
    if (from >= earliestLoaded || loadingHistory) return
    setLoadingHistory(true)
    try {
      const to = new Date(new Date(earliestLoaded).getTime() - 86400000).toISOString().split('T')[0]
      const [subsRes, linksRes] = await Promise.all([
        fetch(`/api/admin/conversions?action=creator_daily&from=${from}&to=${to}`),
        fetch(`/api/admin/conversions?action=link_daily&from=${from}&to=${to}`),
      ])
      if (subsRes.ok) {
        const rows: CreatorDailyRow[] = await subsRes.json()
        setCreatorDaily(prev => {
          const seen = new Set(prev.map(r => r.creator_id + r.date))
          return [...prev, ...rows.filter(r => !seen.has(r.creator_id + r.date))]
        })
      }
      if (linksRes.ok) {
        const rows: LinkDailyRow[] = await linksRes.json()
        setLinkDaily(prev => {
          const seen = new Set(prev.map(r => r.tracking_link_id + r.date))
          return [...prev, ...rows.filter(r => !seen.has(r.tracking_link_id + r.date))]
        })
      }
      setEarliestLoaded(from)
    } finally {
      setLoadingHistory(false)
    }
  }

  useEffect(() => { if (preselected) setTab('table') }, [preselected])

  const text1 = isLight ? 'text-black/90' : 'text-white/90'
  const text2 = isLight ? 'text-black/50' : 'text-white/50'

  const tabs: { key: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'subs', label: 'Daily subs', icon: CalendarDays },
    { key: 'links', label: 'Link traffic', icon: Link2 },
    { key: 'table', label: 'Creator table', icon: Table2 },
    { key: 'targets', label: 'Targets', icon: Target },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className={`text-2xl font-bold ${text1}`}>Conversions</h1>
        <p className={`text-[13px] mt-1 ${text2}`}>
          Subscribers are counted per creator — the OF account every IG link funnels into.
          Views, profile views and link clicks are counted per link.
        </p>
      </div>

      {/* ── Tabs ── */}
      <div className="flex items-center gap-1 mb-6 flex-wrap">
        {tabs.map(t => {
          const Icon = t.icon
          const active = tab === t.key
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                active
                  ? 'bg-pink-600 text-white shadow-sm shadow-pink-600/20'
                  : isLight
                    ? 'text-black/40 hover:text-black/70 hover:bg-black/[0.03]'
                    : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
              }`}
            >
              <Icon className="h-[15px] w-[15px]" />
              {t.label}
            </button>
          )
        })}
      </div>

      {tab === 'subs' && (
        <DailySubsTab
          creators={creators}
          creatorDaily={creatorDaily}
          setCreatorDaily={setCreatorDaily}
          expectations={expectations}
          isLight={isLight}
        />
      )}
      {tab === 'links' && (
        <LinkTrafficTab
          creators={creators}
          trackingLinks={trackingLinks}
          linkDaily={linkDaily}
          setLinkDaily={setLinkDaily}
          isLight={isLight}
        />
      )}
      {tab === 'table' && (
        <CreatorTableTab
          creators={creators}
          trackingLinks={trackingLinks}
          creatorDaily={creatorDaily}
          linkDaily={linkDaily}
          expectations={expectations}
          preselected={preselected}
          onNeedHistory={ensureLoaded}
          loadingHistory={loadingHistory}
          isLight={isLight}
        />
      )}
      {tab === 'targets' && (
        <TargetsTab
          creators={creators}
          expectations={expectations}
          setExpectations={setExpectations}
          isLight={isLight}
        />
      )}
    </div>
  )
}

// ═══ Shared bits ════════════════════════════════════════════════════════════
function SearchBox({ value, onChange, placeholder, isLight }: {
  value: string; onChange: (v: string) => void; placeholder: string; isLight: boolean
}) {
  return (
    <div className="relative">
      <Search className={`pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 ${isLight ? 'text-black/30' : 'text-white/30'}`} />
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-56 rounded-lg pl-8 pr-2.5 py-1.5 text-[12.5px] outline-none transition-colors ${
          isLight
            ? 'bg-black/[0.03] text-black/80 placeholder:text-black/30 focus:bg-black/[0.05]'
            : 'bg-white/[0.05] text-white/85 placeholder:text-white/30 focus:bg-white/[0.08]'
        }`}
      />
    </div>
  )
}

function numberInputCls(isLight: boolean) {
  return `w-24 rounded-lg px-2.5 py-1.5 text-[13px] text-right tabular-nums outline-none transition-colors ${
    isLight
      ? 'bg-white border border-black/10 text-black/80 focus:border-pink-500/50'
      : 'bg-white/[0.05] border border-white/10 text-white/90 focus:border-pink-500/50'
  }`
}

// DatePicker carries its own Today / Yesterday presets, so no extra buttons.
function DateStepper({ date, onChange, isLight }: { date: string; onChange: (d: string) => void; isLight: boolean }) {
  return <DatePicker value={date} onChange={onChange} isLight={isLight} />
}

// ═══ Tab 1 — Daily subs, one row per creator ════════════════════════════════
function DailySubsTab({ creators, creatorDaily, setCreatorDaily, expectations, isLight }: {
  creators: Creator[]
  creatorDaily: CreatorDailyRow[]
  setCreatorDaily: React.Dispatch<React.SetStateAction<CreatorDailyRow[]>>
  expectations: Expectation[]
  isLight: boolean
}) {
  const [date, setDate] = useState(todayISO(-1))
  const [search, setSearch] = useState('')
  const [inputs, setInputs] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const targetByCreator = useMemo(
    () => Object.fromEntries(expectations.map(e => [e.creator_id, e.daily_sub_target])),
    [expectations],
  )

  // Seed the inputs from whatever is already stored for this date.
  useEffect(() => {
    const existing: Record<string, string> = {}
    creatorDaily.filter(r => r.date === date).forEach(r => { existing[r.creator_id] = String(r.new_subs) })
    setInputs(existing)
  }, [date, creatorDaily])

  useEffect(() => { setSaved(false); setSaveError(null) }, [date])

  const visible = creators.filter(c =>
    !search.trim() || c.display_name.toLowerCase().includes(search.toLowerCase()),
  )

  const total = visible.reduce((sum, c) => sum + (parseInt(inputs[c.id] || '0', 10) || 0), 0)

  async function saveAll() {
    setSaving(true)
    setSaved(false)
    setSaveError(null)
    try {
      const entries = creators
        .filter(c => inputs[c.id] !== undefined && inputs[c.id] !== '')
        .map(c => ({ creator_id: c.id, new_subs: parseInt(inputs[c.id], 10) || 0 }))
      const res = await fetch('/api/admin/conversions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_daily_subs', date, entries }),
      })
      const rows = await savedRows<CreatorDailyRow>(res)
      setCreatorDaily(prev => {
        const without = prev.filter(r => !(r.date === date && rows.some(n => n.creator_id === r.creator_id)))
        return [...rows, ...without]
      })
      setSaved(true)
    } catch (error) {
      setSaveError(error instanceof TypeError ? 'Connection lost. Please check your internet and try again. Your inputs are still here.' : error instanceof Error ? error.message : 'Could not save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const text1 = isLight ? 'text-black/90' : 'text-white/90'
  const text3 = isLight ? 'text-black/30' : 'text-white/30'
  const border = isLight ? 'border-black/[0.06]' : 'border-white/[0.06]'

  return (
    <fieldset disabled={saving} className="min-w-0">
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <DateStepper date={date} onChange={setDate} isLight={isLight} />
        <div className="flex items-center gap-2">
          <SearchBox value={search} onChange={setSearch} placeholder="Search creators…" isLight={isLight} />
          <Button variant="primary" onClick={saveAll} loading={saving}>
            {saved ? <><Check className="h-3.5 w-3.5" /> Saved</> : <><Save className="h-3.5 w-3.5" /> Save all</>}
          </Button>
        </div>
      </div>

      <SaveFeedback saved={saved} error={saveError} />
      <Card className="overflow-hidden">
        <div className={`flex items-center px-5 py-2.5 border-b ${border}`}>
          <span className={`flex-1 text-[10px] uppercase tracking-wider font-semibold ${text3}`}>Creator</span>
          <span className={`w-24 text-right text-[10px] uppercase tracking-wider font-semibold ${text3}`}>Target</span>
          <span className={`w-28 text-right text-[10px] uppercase tracking-wider font-semibold ${text3}`}>New subs</span>
        </div>

        {visible.map((c, i) => {
          const target = targetByCreator[c.id] ?? 0
          const value = parseInt(inputs[c.id] || '0', 10) || 0
          const hit = target > 0 && value >= target
          return (
            <div key={c.id} className={`flex items-center px-5 py-2.5 ${i > 0 ? `border-t ${border}` : ''}`}>
              <div className="flex-1 flex items-center gap-2.5 min-w-0">
                {c.avatar_url
                  ? <img src={avatarSrc(c.avatar_url)} alt="" className="h-6 w-6 rounded-full object-cover shrink-0" />
                  : <span className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] shrink-0 ${isLight ? 'bg-black/[0.06] text-black/40' : 'bg-white/[0.08] text-white/50'}`}>{c.display_name.charAt(0)}</span>}
                <div className="min-w-0">
                  <p className={`text-[13px] truncate ${text1}`}>{c.display_name}</p>
                  {c.of_handle && <p className={`text-[10px] font-mono truncate ${text3}`}>@{c.of_handle}</p>}
                </div>
              </div>
              <span className={`w-24 text-right text-[12px] tabular-nums ${text3}`}>{target || '—'}</span>
              <div className="w-28 flex justify-end">
                <input
                  type="number"
                  min={0}
                  value={inputs[c.id] ?? ''}
                  disabled={saving}
                  onChange={e => { setSaved(false); setSaveError(null); setInputs(p => ({ ...p, [c.id]: e.target.value })) }}
                  placeholder="0"
                  className={`${numberInputCls(isLight)} ${hit ? 'border-emerald-500/40' : ''}`}
                />
              </div>
            </div>
          )
        })}

        <div className={`flex items-center px-5 py-2.5 border-t ${border} ${isLight ? 'bg-black/[0.02]' : 'bg-white/[0.02]'}`}>
          <span className={`flex-1 text-[12px] font-medium ${text1}`}>Total · {fmtDate(date)}</span>
          <span className="w-28 text-right text-[13px] font-semibold tabular-nums text-pink-500">{fmt(total)}</span>
        </div>
      </Card>
    </fieldset>
  )
}

// ═══ Tab 2 — Link traffic, one row per link ═════════════════════════════════
function LinkTrafficTab({ creators, trackingLinks, linkDaily, setLinkDaily, isLight }: {
  creators: Creator[]
  trackingLinks: TrackingLink[]
  linkDaily: LinkDailyRow[]
  setLinkDaily: React.Dispatch<React.SetStateAction<LinkDailyRow[]>>
  isLight: boolean
}) {
  const [date, setDate] = useState(todayISO(-1))
  const [search, setSearch] = useState('')
  const [inputs, setInputs] = useState<Record<string, { views: string; profile_views: string; link_clicks: string }>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const creatorById = useMemo(() => Object.fromEntries(creators.map(c => [c.id, c])), [creators])

  useEffect(() => {
    const existing: Record<string, { views: string; profile_views: string; link_clicks: string }> = {}
    linkDaily.filter(r => r.date === date).forEach(r => {
      existing[r.tracking_link_id] = {
        views: String(r.views),
        profile_views: String(r.profile_views),
        link_clicks: String(r.link_clicks),
      }
    })
    setInputs(existing)
  }, [date, linkDaily])

  useEffect(() => { setSaved(false); setSaveError(null) }, [date])

  const visible = trackingLinks.filter(l => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return l.label.toLowerCase().includes(q) || (creatorById[l.creator_id]?.display_name || '').toLowerCase().includes(q)
  })

  // Group the links under their creator so the OF account they feed is obvious.
  const grouped = useMemo(() => {
    const map = new Map<string, TrackingLink[]>()
    visible.forEach(l => {
      if (!map.has(l.creator_id)) map.set(l.creator_id, [])
      map.get(l.creator_id)!.push(l)
    })
    return Array.from(map.entries())
      .map(([creatorId, links]) => ({ creator: creatorById[creatorId], links }))
      .filter(g => g.creator)
      .sort((a, b) => a.creator.display_name.localeCompare(b.creator.display_name))
  }, [visible, creatorById])

  function setField(linkId: string, field: 'views' | 'profile_views' | 'link_clicks', value: string) {
    setSaved(false)
    setSaveError(null)
    setInputs(p => {
      const current = p[linkId] ?? { views: '', profile_views: '', link_clicks: '' }
      return { ...p, [linkId]: { ...current, [field]: value } }
    })
  }

  async function saveAll() {
    setSaving(true)
    setSaved(false)
    setSaveError(null)
    try {
      const entries = Object.entries(inputs)
        .filter(([, v]) => v.views !== '' || v.profile_views !== '' || v.link_clicks !== '')
        .map(([tracking_link_id, v]) => ({
          tracking_link_id,
          views: parseInt(v.views || '0', 10) || 0,
          profile_views: parseInt(v.profile_views || '0', 10) || 0,
          link_clicks: parseInt(v.link_clicks || '0', 10) || 0,
        }))
      const res = await fetch('/api/admin/conversions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_link_daily', date, entries }),
      })
      const rows = await savedRows<LinkDailyRow>(res)
      setLinkDaily(prev => {
        const without = prev.filter(r => !(r.date === date && rows.some(n => n.tracking_link_id === r.tracking_link_id)))
        return [...rows, ...without]
      })
      setSaved(true)
    } catch (error) {
      setSaveError(error instanceof TypeError ? 'Connection lost. Please check your internet and try again. Your inputs are still here.' : error instanceof Error ? error.message : 'Could not save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const text1 = isLight ? 'text-black/90' : 'text-white/90'
  const text2 = isLight ? 'text-black/50' : 'text-white/50'
  const text3 = isLight ? 'text-black/30' : 'text-white/30'
  const border = isLight ? 'border-black/[0.06]' : 'border-white/[0.06]'

  const totals = Object.values(inputs).reduce(
    (acc, v) => ({
      views: acc.views + (parseInt(v.views || '0', 10) || 0),
      profile_views: acc.profile_views + (parseInt(v.profile_views || '0', 10) || 0),
      link_clicks: acc.link_clicks + (parseInt(v.link_clicks || '0', 10) || 0),
    }),
    { views: 0, profile_views: 0, link_clicks: 0 },
  )

  if (trackingLinks.length === 0) {
    return (
      <Card className="py-16 text-center">
        <Link2 className={`h-6 w-6 mx-auto mb-3 ${text3}`} />
        <p className={`text-[13px] ${text2}`}>No links yet</p>
        <p className={`text-[12px] mt-1 ${text3}`}>Add links on a creator&apos;s Links tab and their daily rows appear here.</p>
      </Card>
    )
  }

  return (
    <fieldset disabled={saving} className="min-w-0">
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <DateStepper date={date} onChange={setDate} isLight={isLight} />
        <div className="flex items-center gap-2">
          <SearchBox value={search} onChange={setSearch} placeholder="Search links or creators…" isLight={isLight} />
          <Button variant="primary" onClick={saveAll} loading={saving}>
            {saved ? <><Check className="h-3.5 w-3.5" /> Saved</> : <><Save className="h-3.5 w-3.5" /> Save all</>}
          </Button>
        </div>
      </div>

      <SaveFeedback saved={saved} error={saveError} />
      <Card className="overflow-hidden">
        <div className={`flex items-center px-5 py-2.5 border-b ${border}`}>
          <span className={`flex-1 text-[10px] uppercase tracking-wider font-semibold ${text3}`}>Link</span>
          <span className={`w-28 text-right text-[10px] uppercase tracking-wider font-semibold ${text3}`}>Views</span>
          <span className={`w-28 text-right text-[10px] uppercase tracking-wider font-semibold ${text3}`}>Profile views</span>
          <span className={`w-28 text-right text-[10px] uppercase tracking-wider font-semibold ${text3}`}>Link clicks</span>
        </div>

        {grouped.map(({ creator, links }) => (
          <div key={creator.id}>
            <div className={`flex items-center gap-2 px-5 py-2 border-t ${border} ${isLight ? 'bg-black/[0.02]' : 'bg-white/[0.02]'}`}>
              {creator.avatar_url
                ? <img src={avatarSrc(creator.avatar_url)} alt="" className="h-5 w-5 rounded-full object-cover" />
                : <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[9px] ${isLight ? 'bg-black/[0.06] text-black/40' : 'bg-white/[0.08] text-white/50'}`}>{creator.display_name.charAt(0)}</span>}
              <span className={`text-[12px] font-medium ${text1}`}>{creator.display_name}</span>
              {creator.of_handle && <span className={`text-[10px] font-mono ${text3}`}>@{creator.of_handle}</span>}
            </div>
            {links.map(l => (
              <div key={l.id} className={`flex items-center px-5 py-2.5 border-t ${border}`}>
                <div className="flex-1 min-w-0 pl-7">
                  <p className={`text-[13px] truncate ${text1}`}>{l.label}</p>
                </div>
                {(['views', 'profile_views', 'link_clicks'] as const).map(field => (
                  <div key={field} className="w-28 flex justify-end">
                    <input
                      type="number"
                      min={0}
                      value={inputs[l.id]?.[field] ?? ''}
                      onChange={e => setField(l.id, field, e.target.value)}
                      placeholder="0"
                      className={numberInputCls(isLight)}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}

        <div className={`flex items-center px-5 py-2.5 border-t ${border} ${isLight ? 'bg-black/[0.02]' : 'bg-white/[0.02]'}`}>
          <span className={`flex-1 text-[12px] font-medium ${text1}`}>Total · {fmtDate(date)}</span>
          <span className="w-28 text-right text-[13px] font-semibold tabular-nums text-pink-500">{fmt(totals.views)}</span>
          <span className="w-28 text-right text-[13px] font-semibold tabular-nums text-pink-500">{fmt(totals.profile_views)}</span>
          <span className="w-28 text-right text-[13px] font-semibold tabular-nums text-pink-500">{fmt(totals.link_clicks)}</span>
        </div>
      </Card>
    </fieldset>
  )
}

// ═══ Tab 3 — Per-creator table: subs + funnel from its links ════════════════
function CreatorTableTab({ creators, trackingLinks, creatorDaily, linkDaily, expectations, preselected, onNeedHistory, loadingHistory, isLight }: {
  creators: Creator[]
  trackingLinks: TrackingLink[]
  creatorDaily: CreatorDailyRow[]
  linkDaily: LinkDailyRow[]
  expectations: Expectation[]
  preselected: string | null
  onNeedHistory: (from: string) => void
  loadingHistory: boolean
  isLight: boolean
}) {
  const [creatorId, setCreatorId] = useState<string>(preselected || creators[0]?.id || '')
  const [dateStart, setDateStart] = useState<Date>(() => {
    const d = new Date(); d.setDate(d.getDate() - 30); return d
  })
  const [dateEnd, setDateEnd] = useState<Date>(new Date())
  const [dateLabel, setDateLabel] = useState('Last 30 days')

  const creator = creators.find(c => c.id === creatorId)
  const target = expectations.find(e => e.creator_id === creatorId)?.daily_sub_target ?? 0

  const linkIds = useMemo(
    () => new Set(trackingLinks.filter(l => l.creator_id === creatorId).map(l => l.id)),
    [trackingLinks, creatorId],
  )

  const rows = useMemo(() => {
    const from = dateStart.toISOString().split('T')[0]
    const to = dateEnd.toISOString().split('T')[0]

    // Traffic for this creator's links, summed per day.
    const traffic: Record<string, { views: number; profile_views: number; link_clicks: number }> = {}
    linkDaily.forEach(r => {
      if (!linkIds.has(r.tracking_link_id)) return
      if (r.date < from || r.date > to) return
      if (!traffic[r.date]) traffic[r.date] = { views: 0, profile_views: 0, link_clicks: 0 }
      traffic[r.date].views += r.views
      traffic[r.date].profile_views += r.profile_views
      traffic[r.date].link_clicks += r.link_clicks
    })

    const subs: Record<string, number> = {}
    creatorDaily.forEach(r => {
      if (r.creator_id !== creatorId) return
      if (r.date < from || r.date > to) return
      subs[r.date] = r.new_subs
    })

    const dates = Array.from(new Set([...Object.keys(subs), ...Object.keys(traffic)])).sort((a, b) => b.localeCompare(a))
    return dates.map(date => {
      const t = traffic[date] || { views: 0, profile_views: 0, link_clicks: 0 }
      const s = subs[date] ?? 0
      return {
        date,
        ...t,
        new_subs: s,
        clickRate: t.profile_views > 0 ? (t.link_clicks / t.profile_views) * 100 : null,
        subRate: t.link_clicks > 0 ? (s / t.link_clicks) * 100 : null,
      }
    })
  }, [creatorDaily, linkDaily, linkIds, creatorId, dateStart, dateEnd])

  const totals = rows.reduce(
    (a, r) => ({
      views: a.views + r.views,
      profile_views: a.profile_views + r.profile_views,
      link_clicks: a.link_clicks + r.link_clicks,
      new_subs: a.new_subs + r.new_subs,
    }),
    { views: 0, profile_views: 0, link_clicks: 0, new_subs: 0 },
  )

  const text1 = isLight ? 'text-black/90' : 'text-white/90'
  const text2 = isLight ? 'text-black/50' : 'text-white/50'
  const text3 = isLight ? 'text-black/30' : 'text-white/30'
  const border = isLight ? 'border-black/[0.06]' : 'border-white/[0.06]'
  const selectCls = isLight
    ? 'bg-white border border-black/10 text-black/80'
    : 'bg-white/[0.05] border border-white/10 text-white/90'

  return (
    <>
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <select
          value={creatorId}
          onChange={e => setCreatorId(e.target.value)}
          className={`rounded-lg px-3 py-1.5 text-[13px] outline-none ${selectCls}`}
        >
          {creators.map(c => <option key={c.id} value={c.id}>{c.display_name}</option>)}
        </select>
        <DateRangePicker
          dateStart={dateStart}
          dateEnd={dateEnd}
          dateLabel={dateLabel}
          isLight={isLight}
          onApply={(label, start, end) => {
            setDateLabel(label); setDateStart(start); setDateEnd(end)
            onNeedHistory(start.toISOString().split('T')[0])
          }}
        />
      </div>

      {/* Totals strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
        {[
          { label: 'Views', value: fmt(totals.views) },
          { label: 'Profile views', value: fmt(totals.profile_views) },
          { label: 'Link clicks', value: fmt(totals.link_clicks) },
          { label: 'New subs', value: fmt(totals.new_subs) },
          { label: 'Daily target', value: target ? String(target) : '—' },
        ].map(s => (
          <Card key={s.label} className="px-4 py-3">
            <p className={`text-[10px] uppercase tracking-wider font-semibold ${text3}`}>{s.label}</p>
            <p className={`text-[18px] font-bold mt-1 tabular-nums ${text1}`}>{s.value}</p>
          </Card>
        ))}
      </div>

      {linkIds.size === 0 && (
        <Card className={`px-4 py-3 mb-4 ${isLight ? 'bg-amber-50 border-amber-200' : 'bg-yellow-900/15 border-yellow-700/30'}`}>
          <p className={`text-[12px] ${isLight ? 'text-amber-700' : 'text-yellow-300'}`}>
            {creator?.display_name} has no links yet, so only subscribers show here. Add them on the Links tab.
          </p>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className={`flex items-center px-5 py-2.5 border-b ${border}`}>
          <span className={`w-24 text-[10px] uppercase tracking-wider font-semibold ${text3}`}>Date</span>
          <span className={`flex-1 text-right text-[10px] uppercase tracking-wider font-semibold ${text3}`}>Views</span>
          <span className={`flex-1 text-right text-[10px] uppercase tracking-wider font-semibold ${text3}`}>Profile views</span>
          <span className={`flex-1 text-right text-[10px] uppercase tracking-wider font-semibold ${text3}`}>Link clicks</span>
          <span className={`flex-1 text-right text-[10px] uppercase tracking-wider font-semibold ${text3}`}>CTR</span>
          <span className={`flex-1 text-right text-[10px] uppercase tracking-wider font-semibold ${text3}`}>New subs</span>
          <span className={`flex-1 text-right text-[10px] uppercase tracking-wider font-semibold ${text3}`}>Sub rate</span>
        </div>

        {rows.length === 0 ? (
          <p className={`text-[13px] text-center py-14 ${text2}`}>No data in this range</p>
        ) : (
          rows.map((r, i) => {
            const hit = target > 0 && r.new_subs >= target
            return (
              <div key={r.date} className={`flex items-center px-5 py-2 ${i > 0 ? `border-t ${border}` : ''}`}>
                <span className={`w-24 text-[12px] ${text2}`}>{fmtDate(r.date)}</span>
                <span className={`flex-1 text-right text-[12.5px] tabular-nums ${text1}`}>{r.views ? fmt(r.views) : <span className={text3}>—</span>}</span>
                <span className={`flex-1 text-right text-[12.5px] tabular-nums ${text1}`}>{r.profile_views ? fmt(r.profile_views) : <span className={text3}>—</span>}</span>
                <span className={`flex-1 text-right text-[12.5px] tabular-nums ${text1}`}>{r.link_clicks ? fmt(r.link_clicks) : <span className={text3}>—</span>}</span>
                <span className={`flex-1 text-right text-[12.5px] tabular-nums ${text2}`}>{r.clickRate !== null ? r.clickRate.toFixed(1) + '%' : <span className={text3}>—</span>}</span>
                <span className={`flex-1 text-right text-[12.5px] font-medium tabular-nums ${hit ? 'text-emerald-500' : text1}`}>{r.new_subs || <span className={text3}>—</span>}</span>
                <span className={`flex-1 text-right text-[12.5px] tabular-nums ${text2}`}>{r.subRate !== null ? r.subRate.toFixed(1) + '%' : <span className={text3}>—</span>}</span>
              </div>
            )
          })
        )}
      </Card>
    </>
  )
}

// ═══ Tab 4 — Daily sub target per creator ═══════════════════════════════════
function TargetsTab({ creators, expectations, setExpectations, isLight }: {
  creators: Creator[]
  expectations: Expectation[]
  setExpectations: React.Dispatch<React.SetStateAction<Expectation[]>>
  isLight: boolean
}) {
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<string | null>(null)
  const [value, setValue] = useState('')
  const [savingId, setSavingId] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const byCreator = useMemo(
    () => Object.fromEntries(expectations.map(e => [e.creator_id, e])),
    [expectations],
  )

  async function save(creatorId: string) {
    setSavingId(creatorId)
    setSaved(false)
    setSaveError(null)
    try {
      const res = await fetch('/api/admin/conversions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_expectation', creator_id: creatorId, daily_sub_target: parseInt(value, 10) || 0 }),
      })
      const [row] = await savedRows<Expectation>(res)
      setExpectations(prev => {
        const without = prev.filter(e => e.creator_id !== creatorId)
        return row ? [...without, row] : without
      })
      setEditing(null)
      setSaved(true)
    } catch (error) {
      setSaveError(error instanceof TypeError ? 'Connection lost. Please check your internet and try again.' : error instanceof Error ? error.message : 'Could not save. Please try again.')
    } finally {
      setSavingId(null)
    }
  }

  const visible = creators.filter(c => !search.trim() || c.display_name.toLowerCase().includes(search.toLowerCase()))

  const text1 = isLight ? 'text-black/90' : 'text-white/90'
  const text3 = isLight ? 'text-black/30' : 'text-white/30'
  const border = isLight ? 'border-black/[0.06]' : 'border-white/[0.06]'

  return (
    <>
      <div className="flex justify-end mb-4">
        <SearchBox value={search} onChange={setSearch} placeholder="Search creators…" isLight={isLight} />
      </div>
      <SaveFeedback saved={saved} error={saveError} />
      <Card className="overflow-hidden">
        <div className={`flex items-center px-5 py-2.5 border-b ${border}`}>
          <span className={`flex-1 text-[10px] uppercase tracking-wider font-semibold ${text3}`}>Creator</span>
          <span className={`w-40 text-right text-[10px] uppercase tracking-wider font-semibold ${text3}`}>Daily sub target</span>
        </div>
        {visible.map((c, i) => {
          const current = byCreator[c.id]?.daily_sub_target ?? 0
          const isEditing = editing === c.id
          return (
            <div key={c.id} className={`flex items-center px-5 py-2.5 ${i > 0 ? `border-t ${border}` : ''}`}>
              <div className="flex-1 flex items-center gap-2.5 min-w-0">
                {c.avatar_url
                  ? <img src={avatarSrc(c.avatar_url)} alt="" className="h-6 w-6 rounded-full object-cover shrink-0" />
                  : <span className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] shrink-0 ${isLight ? 'bg-black/[0.06] text-black/40' : 'bg-white/[0.08] text-white/50'}`}>{c.display_name.charAt(0)}</span>}
                <p className={`text-[13px] truncate ${text1}`}>{c.display_name}</p>
              </div>
              <div className="w-40 flex justify-end items-center gap-2">
                {isEditing ? (
                  <>
                    <input
                      autoFocus
                      type="number"
                      min={0}
                      value={value}
                      onChange={e => setValue(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') save(c.id); if (e.key === 'Escape') setEditing(null) }}
                      className={numberInputCls(isLight)}
                    />
                    <Button variant="primary" onClick={() => save(c.id)} loading={savingId === c.id}>Save</Button>
                  </>
                ) : (
                  <button
                    onClick={() => { setEditing(c.id); setValue(String(current)) }}
                    className={`text-[13px] tabular-nums px-3 py-1 rounded-lg transition-colors ${
                      isLight ? 'text-black/70 hover:bg-black/[0.05]' : 'text-white/80 hover:bg-white/[0.06]'
                    }`}
                  >
                    {current || <span className={text3}>Set target</span>}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </Card>
    </>
  )
}
