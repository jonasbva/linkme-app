'use client'

import { useState, useMemo, useRef, useEffect, Dispatch, SetStateAction } from 'react'

interface Creator {
  id: string
  slug: string
  display_name: string
  avatar_url?: string
  is_active: boolean
}

interface Expectation {
  id: string
  creator_id: string
  daily_sub_target: number
}

interface DailyRow {
  id: string
  creator_id: string
  date: string
  views: number
  profile_views: number
  link_clicks: number
  new_subs: number
}

interface Props {
  creators: Creator[]
  expectations: Expectation[]
  dailyData: DailyRow[]
}

type Tab = 'expectations' | 'input' | 'table'

export default function ConversionsClient({ creators, expectations: initialExpectations, dailyData: initialDaily }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('expectations')
  const [expectations, setExpectations] = useState(initialExpectations)
  const [dailyData, setDailyData] = useState(initialDaily)

  const tabs: { key: Tab; label: string }[] = [
    { key: 'expectations', label: 'Expectations' },
    { key: 'input', label: 'Daily Input' },
    { key: 'table', label: 'Conversion Table' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold tracking-tight">Conversions</h1>

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 rounded-lg bg-white/[0.03] border border-white/[0.06] w-fit">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-1.5 rounded-md text-[13px] transition-colors ${
              activeTab === tab.key
                ? 'bg-white/[0.08] text-white/90 font-medium'
                : 'text-white/40 hover:text-white/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'expectations' && (
        <ExpectationsTab
          creators={creators}
          expectations={expectations}
          setExpectations={setExpectations}
          dailyData={dailyData}
        />
      )}
      {activeTab === 'input' && (
        <DailyInputTab
          creators={creators}
          expectations={expectations}
          dailyData={dailyData}
          setDailyData={setDailyData}
        />
      )}
      {activeTab === 'table' && (
        <ConversionTableTab
          creators={creators}
          expectations={expectations}
          dailyData={dailyData}
          setDailyData={setDailyData}
        />
      )}
    </div>
  )
}

/* ============================================================
   EXPECTATIONS TAB
   ============================================================ */

function ExpectationsTab({
  creators,
  expectations,
  setExpectations,
  dailyData,
}: {
  creators: Creator[]
  expectations: Expectation[]
  setExpectations: Dispatch<SetStateAction<Expectation[]>>
  dailyData: DailyRow[]
}) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [saving, setSaving] = useState(false)

  const expectationMap = useMemo(() => {
    const map: Record<string, number> = {}
    expectations.forEach(e => { map[e.creator_id] = e.daily_sub_target })
    return map
  }, [expectations])

  // Calculate days red in a row for each creator
  const daysRedMap = useMemo(() => {
    const map: Record<string, number> = {}
    creators.forEach(c => {
      const target = expectationMap[c.id] || 0
      if (target === 0) { map[c.id] = 0; return }
      const creatorDaily = dailyData
        .filter(d => d.creator_id === c.id)
        .sort((a, b) => b.date.localeCompare(a.date))
      let streak = 0
      for (const row of creatorDaily) {
        if (row.new_subs < target) streak++
        else break
      }
      map[c.id] = streak
    })
    return map
  }, [creators, expectationMap, dailyData])

  async function saveExpectation(creatorId: string) {
    const val = parseInt(editValue)
    if (isNaN(val) || val < 0) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/conversions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_expectation', creator_id: creatorId, daily_sub_target: val }),
      })
      if (res.ok) {
        setExpectations(prev => {
          const existing = prev.find(e => e.creator_id === creatorId)
          if (existing) return prev.map(e => e.creator_id === creatorId ? { ...e, daily_sub_target: val } : e)
          return [...prev, { id: 'new', creator_id: creatorId, daily_sub_target: val }]
        })
      }
    } finally {
      setSaving(false)
      setEditingId(null)
    }
  }

  // Sort: creators with expectations first (by target desc), then others
  const sorted = useMemo(() => {
    return [...creators].sort((a, b) => {
      const aTarget = expectationMap[a.id] || 0
      const bTarget = expectationMap[b.id] || 0
      if (aTarget && !bTarget) return -1
      if (!aTarget && bTarget) return 1
      return bTarget - aTarget
    })
  }, [creators, expectationMap])

  return (
    <div className="rounded-xl border border-white/[0.06] overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/[0.06]">
            <th className="text-left text-[11px] text-white/30 font-medium px-4 py-3 uppercase tracking-wider">Creator</th>
            <th className="text-right text-[11px] text-white/30 font-medium px-4 py-3 uppercase tracking-wider">Daily Sub Target</th>
            <th className="text-right text-[11px] text-white/30 font-medium px-4 py-3 uppercase tracking-wider">Days Red</th>
            <th className="text-right text-[11px] text-white/30 font-medium px-4 py-3 uppercase tracking-wider w-24">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(c => {
            const target = expectationMap[c.id] || 0
            const daysRed = daysRedMap[c.id] || 0
            const isEditing = editingId === c.id
            return (
              <tr key={c.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {c.avatar_url ? (
                      <img src={c.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center text-[11px] font-medium text-white/30">
                        {c.display_name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="text-[13px] text-white/80 font-medium">{c.display_name}</p>
                      <p className="text-[11px] text-white/25">{c.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  {isEditing ? (
                    <input
                      type="number"
                      min="0"
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') saveExpectation(c.id); if (e.key === 'Escape') setEditingId(null) }}
                      autoFocus
                      className="w-20 bg-white/[0.06] border border-white/[0.1] rounded px-2 py-1 text-[13px] text-white/80 text-right outline-none focus:border-white/20"
                    />
                  ) : (
                    <span className={`text-[13px] tabular-nums ${target > 0 ? 'text-white/80' : 'text-white/20'}`}>
                      {target > 0 ? target : '—'}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {target > 0 ? (
                    <span className={`text-[13px] tabular-nums font-medium px-2 py-0.5 rounded ${
                      daysRed === 0
                        ? 'text-emerald-400 bg-emerald-400/10'
                        : daysRed <= 3
                        ? 'text-amber-400 bg-amber-400/10'
                        : 'text-red-400 bg-red-400/10'
                    }`}>
                      {daysRed}
                    </span>
                  ) : (
                    <span className="text-[13px] text-white/20">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {isEditing ? (
                    <div className="flex gap-1 justify-end">
                      <button
                        onClick={() => saveExpectation(c.id)}
                        disabled={saving}
                        className="px-2 py-1 text-[11px] bg-white/[0.08] rounded hover:bg-white/[0.12] text-white/70"
                      >
                        {saving ? '...' : 'Save'}
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-2 py-1 text-[11px] text-white/30 hover:text-white/50"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setEditingId(c.id); setEditValue(String(target)) }}
                      className="px-2 py-1 text-[11px] text-white/30 hover:text-white/60 transition-colors"
                    >
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

/* ============================================================
   DAILY INPUT TAB
   ============================================================ */

function DailyInputTab({
  creators,
  expectations,
  dailyData,
  setDailyData,
}: {
  creators: Creator[]
  expectations: Expectation[]
  dailyData: DailyRow[]
  setDailyData: Dispatch<SetStateAction<DailyRow[]>>
}) {
  const yesterday = useMemo(() => {
    const d = new Date(); d.setDate(d.getDate() - 1)
    return d.toISOString().split('T')[0]
  }, [])

  const [date, setDate] = useState(yesterday)
  const [inputs, setInputs] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const expectationMap = useMemo(() => {
    const map: Record<string, number> = {}
    expectations.forEach(e => { map[e.creator_id] = e.daily_sub_target })
    return map
  }, [expectations])

  // Pre-fill inputs with existing data for the selected date
  useEffect(() => {
    const dateRows = dailyData.filter(d => d.date === date)
    const filled: Record<string, string> = {}
    dateRows.forEach(row => { filled[row.creator_id] = String(row.new_subs) })
    setInputs(filled)
    setSaved(false)
  }, [date, dailyData])

  // Sort: creators with expectations first
  const sorted = useMemo(() => {
    return [...creators].sort((a, b) => {
      const aTarget = expectationMap[a.id] || 0
      const bTarget = expectationMap[b.id] || 0
      if (aTarget && !bTarget) return -1
      if (!aTarget && bTarget) return 1
      return bTarget - aTarget
    })
  }, [creators, expectationMap])

  async function saveAll() {
    setSaving(true)
    try {
      const entries = Object.entries(inputs)
        .filter(([, val]) => val !== '' && !isNaN(parseInt(val)))
        .map(([creator_id, val]) => ({ creator_id, new_subs: parseInt(val) }))

      if (entries.length === 0) return

      const res = await fetch('/api/admin/conversions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_daily_subs', date, entries }),
      })

      if (res.ok) {
        const newRows = await res.json()
        setDailyData(prev => {
          const updated = [...prev]
          newRows.forEach((nr: DailyRow) => {
            const idx = updated.findIndex(d => d.creator_id === nr.creator_id && d.date === nr.date)
            if (idx >= 0) updated[idx] = nr
            else updated.push(nr)
          })
          return updated
        })
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Date selector */}
      <div className="flex items-center gap-4">
        <label className="text-[12px] text-white/40">Date:</label>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-1.5 text-[13px] text-white/80 outline-none focus:border-white/20"
        />
        <button
          onClick={saveAll}
          disabled={saving}
          className={`px-4 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
            saved
              ? 'bg-emerald-500/20 text-emerald-400'
              : 'bg-white text-black hover:bg-white/90'
          }`}
        >
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save all'}
        </button>
      </div>

      {/* Creator input grid */}
      <div className="rounded-xl border border-white/[0.06] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="text-left text-[11px] text-white/30 font-medium px-4 py-3 uppercase tracking-wider">Creator</th>
              <th className="text-right text-[11px] text-white/30 font-medium px-4 py-3 uppercase tracking-wider">Target</th>
              <th className="text-right text-[11px] text-white/30 font-medium px-4 py-3 uppercase tracking-wider w-32">New Subs</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(c => {
              const target = expectationMap[c.id] || 0
              const val = inputs[c.id] || ''
              const numVal = parseInt(val)
              const isBelowTarget = target > 0 && !isNaN(numVal) && numVal < target
              return (
                <tr key={c.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      {c.avatar_url ? (
                        <img src={c.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center text-[11px] font-medium text-white/30">
                          {c.display_name.charAt(0)}
                        </div>
                      )}
                      <span className="text-[13px] text-white/80">{c.display_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <span className={`text-[13px] tabular-nums ${target > 0 ? 'text-white/50' : 'text-white/15'}`}>
                      {target > 0 ? target : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={val}
                      onChange={e => setInputs(prev => ({ ...prev, [c.id]: e.target.value }))}
                      className={`w-full bg-white/[0.04] border rounded px-3 py-1.5 text-[13px] text-right outline-none transition-colors tabular-nums ${
                        isBelowTarget
                          ? 'border-red-500/30 text-red-400 focus:border-red-500/50'
                          : 'border-white/[0.08] text-white/80 focus:border-white/20'
                      }`}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ============================================================
   CONVERSION TABLE TAB
   ============================================================ */

function ConversionTableTab({
  creators,
  expectations,
  dailyData,
  setDailyData,
}: {
  creators: Creator[]
  expectations: Expectation[]
  dailyData: DailyRow[]
  setDailyData: Dispatch<SetStateAction<DailyRow[]>>
}) {
  const [selectedCreator, setSelectedCreator] = useState(creators[0]?.id || '')
  const [editingCell, setEditingCell] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [calculating, setCalculating] = useState(false)

  // Date range state — default to last 30 days
  const [dateStart, setDateStart] = useState<Date>(() => {
    const d = new Date(); d.setDate(d.getDate() - 30); return d
  })
  const [dateEnd, setDateEnd] = useState<Date>(new Date())
  const [dateLabel, setDateLabel] = useState('Last 30 days')
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const datePickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target as Node)) {
        setShowDatePicker(false)
      }
    }
    if (showDatePicker) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showDatePicker])

  function applyPreset(label: string, start: Date, end: Date) {
    setDateStart(start); setDateEnd(end); setDateLabel(label); setShowDatePicker(false)
  }

  function applyCustomRange() {
    if (!customStart || !customEnd) return
    const s = new Date(customStart + 'T00:00:00')
    const e = new Date(customEnd + 'T23:59:59')
    if (isNaN(s.getTime()) || isNaN(e.getTime()) || s > e) return
    setDateStart(s); setDateEnd(e)
    setDateLabel(`${s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${e.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`)
    setShowDatePicker(false)
  }

  function selectMonth(offset: number) {
    const now = new Date()
    const d = new Date(now.getFullYear(), now.getMonth() - offset, 1)
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59)
    const label = d.toLocaleDateString('en-US', { month: 'long', year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined })
    applyPreset(label, d, end)
  }

  const monthOptions = useMemo(() => {
    const now = new Date()
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      return {
        offset: i,
        label: d.toLocaleDateString('en-US', { month: 'short' }),
        fullLabel: d.toLocaleDateString('en-US', { month: 'long', year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined }),
      }
    })
  }, [])

  const target = useMemo(() => {
    return expectations.find(e => e.creator_id === selectedCreator)?.daily_sub_target || 0
  }, [expectations, selectedCreator])

  // Filter and sort daily data for selected creator and date range
  const filteredData = useMemo(() => {
    const startStr = dateStart.toISOString().split('T')[0]
    const endStr = dateEnd.toISOString().split('T')[0]
    return dailyData
      .filter(d => d.creator_id === selectedCreator && d.date >= startStr && d.date <= endStr)
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [dailyData, selectedCreator, dateStart, dateEnd])

  async function saveSubs(creatorId: string, date: string, newSubs: number) {
    const res = await fetch('/api/admin/conversions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_subs', creator_id: creatorId, date, new_subs: newSubs }),
    })
    if (res.ok) {
      const [updated] = await res.json()
      setDailyData((prev: DailyRow[]) => prev.map(d => (d.creator_id === creatorId && d.date === date) ? updated : d))
    }
    setEditingCell(null)
  }

  async function runCalculation() {
    setCalculating(true)
    try {
      // Calculate for yesterday
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const dateStr = yesterday.toISOString().split('T')[0]

      const res = await fetch('/api/admin/conversions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'calculate_daily', date: dateStr }),
      })
      if (res.ok) {
        // Refetch daily data
        const fetchRes = await fetch(`/api/admin/conversions?action=daily&from=${dateStart.toISOString().split('T')[0]}&to=${dateEnd.toISOString().split('T')[0]}`)
        if (fetchRes.ok) {
          const newData = await fetchRes.json()
          setDailyData(newData)
        }
      }
    } finally {
      setCalculating(false)
    }
  }

  function fmtNum(n: number): string {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
    return n.toLocaleString()
  }

  function fmtPct(n: number): string {
    if (!isFinite(n) || isNaN(n)) return '—'
    return (n * 100).toFixed(2) + '%'
  }

  function fmtDate(dateStr: string): string {
    const d = new Date(dateStr + 'T12:00:00')
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="space-y-4">
      {/* Controls row */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* Creator selector */}
        <select
          value={selectedCreator}
          onChange={e => setSelectedCreator(e.target.value)}
          className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-1.5 text-[13px] text-white/80 outline-none focus:border-white/20"
        >
          {creators.map(c => (
            <option key={c.id} value={c.id} className="bg-[#111] text-white">
              {c.display_name} ({c.slug})
            </option>
          ))}
        </select>

        {/* Date range picker */}
        <div className="relative" ref={datePickerRef}>
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-1.5 text-[13px] text-white/60 hover:text-white/80 hover:border-white/[0.12] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {dateLabel}
          </button>

          {showDatePicker && (
            <div className="absolute top-full mt-2 left-0 z-50 bg-[#111] border border-white/[0.1] rounded-xl p-4 shadow-2xl min-w-[300px]">
              {/* Presets */}
              <div className="grid grid-cols-2 gap-1.5 mb-3">
                {[
                  { label: 'Today', start: new Date(new Date().setHours(0,0,0,0)), end: new Date() },
                  { label: 'Yesterday', start: (() => { const d = new Date(); d.setDate(d.getDate()-1); d.setHours(0,0,0,0); return d })(), end: (() => { const d = new Date(); d.setDate(d.getDate()-1); d.setHours(23,59,59); return d })() },
                  { label: 'Last 7 days', start: (() => { const d = new Date(); d.setDate(d.getDate()-7); return d })(), end: new Date() },
                  { label: 'Last 30 days', start: (() => { const d = new Date(); d.setDate(d.getDate()-30); return d })(), end: new Date() },
                ].map(p => (
                  <button
                    key={p.label}
                    onClick={() => applyPreset(p.label, p.start, p.end)}
                    className="px-3 py-1.5 text-[12px] text-white/50 hover:text-white/80 hover:bg-white/[0.06] rounded-md transition-colors text-left"
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Month grid */}
              <div className="border-t border-white/[0.06] pt-3 mb-3">
                <p className="text-[11px] text-white/25 mb-2">Months</p>
                <div className="grid grid-cols-4 gap-1">
                  {monthOptions.map(m => (
                    <button
                      key={m.offset}
                      onClick={() => selectMonth(m.offset)}
                      className="px-2 py-1.5 text-[11px] text-white/40 hover:text-white/80 hover:bg-white/[0.06] rounded transition-colors"
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom range */}
              <div className="border-t border-white/[0.06] pt-3">
                <p className="text-[11px] text-white/25 mb-2">Custom range</p>
                <div className="flex gap-2 items-center">
                  <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)}
                    className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded px-2 py-1 text-[11px] text-white/60 outline-none" />
                  <span className="text-white/20 text-[11px]">to</span>
                  <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)}
                    className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded px-2 py-1 text-[11px] text-white/60 outline-none" />
                  <button onClick={applyCustomRange}
                    className="px-2 py-1 text-[11px] bg-white/[0.08] rounded hover:bg-white/[0.12] text-white/60">
                    Apply
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Calculate button */}
        <button
          onClick={runCalculation}
          disabled={calculating}
          className="px-3 py-1.5 rounded-lg text-[12px] bg-white/[0.06] text-white/50 hover:text-white/80 hover:bg-white/[0.1] transition-colors"
        >
          {calculating ? 'Calculating...' : 'Recalculate yesterday'}
        </button>

        {target > 0 && (
          <span className="text-[12px] text-white/30">Target: <span className="text-white/60 font-medium">{target} subs/day</span></span>
        )}
      </div>

      {/* Data table */}
      <div className="rounded-xl border border-white/[0.06] overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="text-left text-[11px] text-white/30 font-medium px-4 py-3 uppercase tracking-wider">Date</th>
              <th className="text-right text-[11px] text-white/30 font-medium px-4 py-3 uppercase tracking-wider">Views</th>
              <th className="text-right text-[11px] text-white/30 font-medium px-4 py-3 uppercase tracking-wider">Profile Views</th>
              <th className="text-right text-[11px] text-white/30 font-medium px-3 py-3 uppercase tracking-wider text-[10px]">Views→Profile</th>
              <th className="text-right text-[11px] text-white/30 font-medium px-4 py-3 uppercase tracking-wider">Link Clicks</th>
              <th className="text-right text-[11px] text-white/30 font-medium px-3 py-3 uppercase tracking-wider text-[10px]">Views→Clicks</th>
              <th className="text-right text-[11px] text-white/30 font-medium px-3 py-3 uppercase tracking-wider text-[10px]">Profile→Clicks</th>
              <th className="text-right text-[11px] text-white/30 font-medium px-4 py-3 uppercase tracking-wider">Subs</th>
              <th className="text-right text-[11px] text-white/30 font-medium px-3 py-3 uppercase tracking-wider text-[10px]">Clicks→Subs</th>
              <th className="text-right text-[11px] text-white/30 font-medium px-3 py-3 uppercase tracking-wider text-[10px]">Subs→Views</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-12 text-white/20 text-[13px]">
                  No data for this period. Use "Recalculate yesterday" or enter subs in the Daily Input tab.
                </td>
              </tr>
            ) : (
              filteredData.map(row => {
                const views = row.views
                const pv = row.profile_views
                const lc = row.link_clicks
                const subs = row.new_subs
                const isBelowTarget = target > 0 && subs < target
                const cellKey = `${row.creator_id}-${row.date}`
                const isEditing = editingCell === cellKey

                // Ratios
                const viewsToProfile = views > 0 ? pv / views : 0
                const viewsToClicks = views > 0 ? lc / views : 0
                const profileToClicks = pv > 0 ? lc / pv : 0
                const clicksToSubs = lc > 0 ? subs / lc : 0
                const subsToViews = views > 0 ? subs / views : 0

                return (
                  <tr
                    key={cellKey}
                    className={`border-b border-white/[0.03] transition-colors ${
                      isBelowTarget ? 'bg-red-500/[0.06] hover:bg-red-500/[0.1]' : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    <td className="px-4 py-2.5 text-[13px] text-white/60">{fmtDate(row.date)}</td>
                    <td className="px-4 py-2.5 text-right text-[13px] text-white/70 tabular-nums">{views > 0 ? fmtNum(views) : '—'}</td>
                    <td className="px-4 py-2.5 text-right text-[13px] text-white/70 tabular-nums">{pv > 0 ? fmtNum(pv) : '—'}</td>
                    <td className="px-3 py-2.5 text-right text-[12px] text-white/35 tabular-nums">{views > 0 ? fmtPct(viewsToProfile) : '—'}</td>
                    <td className="px-4 py-2.5 text-right text-[13px] text-white/70 tabular-nums">{lc > 0 ? fmtNum(lc) : '—'}</td>
                    <td className="px-3 py-2.5 text-right text-[12px] text-white/35 tabular-nums">{views > 0 ? fmtPct(viewsToClicks) : '—'}</td>
                    <td className="px-3 py-2.5 text-right text-[12px] text-white/35 tabular-nums">{pv > 0 ? fmtPct(profileToClicks) : '—'}</td>
                    <td className="px-4 py-2.5 text-right">
                      {isEditing ? (
                        <input
                          type="number"
                          min="0"
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') saveSubs(row.creator_id, row.date, parseInt(editValue) || 0)
                            if (e.key === 'Escape') setEditingCell(null)
                          }}
                          onBlur={() => saveSubs(row.creator_id, row.date, parseInt(editValue) || 0)}
                          autoFocus
                          className="w-16 bg-white/[0.06] border border-white/[0.15] rounded px-2 py-0.5 text-[13px] text-right outline-none focus:border-white/30 tabular-nums"
                        />
                      ) : (
                        <button
                          onClick={() => { setEditingCell(cellKey); setEditValue(String(subs)) }}
                          className={`text-[13px] tabular-nums font-medium cursor-pointer hover:underline ${
                            isBelowTarget ? 'text-red-400' : 'text-white/80'
                          }`}
                        >
                          {subs}
                        </button>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-right text-[12px] text-white/35 tabular-nums">{lc > 0 ? fmtPct(clicksToSubs) : '—'}</td>
                    <td className="px-3 py-2.5 text-right text-[12px] text-white/35 tabular-nums">{views > 0 ? fmtPct(subsToViews) : '—'}</td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
