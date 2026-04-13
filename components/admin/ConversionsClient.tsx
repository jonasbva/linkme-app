'use client'

import { useState, useMemo, useRef, useEffect, Dispatch, SetStateAction } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTheme } from './ThemeProvider'
import DateRangePicker from './DateRangePicker'

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
  const searchParams = useSearchParams()
  const preselectedCreator = searchParams.get('creator')
  const { resolved: themeMode } = useTheme()
  const isLight = themeMode === 'light'

  const [activeTab, setActiveTab] = useState<Tab>(preselectedCreator ? 'table' : 'expectations')
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
      <div className={`flex gap-1 p-1 rounded-lg border w-fit ${
        isLight ? 'bg-black/[0.02] border-black/[0.06]' : 'bg-white/[0.03] border-white/[0.06]'
      }`}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-1.5 rounded-md text-[13px] transition-colors ${
              activeTab === tab.key
                ? isLight ? 'bg-black/[0.08] text-black/90 font-medium' : 'bg-white/[0.08] text-white/90 font-medium'
                : isLight ? 'text-black/40 hover:text-black/60' : 'text-white/40 hover:text-white/60'
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
          isLight={isLight}
        />
      )}
      {activeTab === 'input' && (
        <DailyInputTab
          creators={creators}
          expectations={expectations}
          dailyData={dailyData}
          setDailyData={setDailyData}
          isLight={isLight}
        />
      )}
      {activeTab === 'table' && (
        <ConversionTableTab
          creators={creators}
          expectations={expectations}
          dailyData={dailyData}
          setDailyData={setDailyData}
          initialCreatorId={preselectedCreator || undefined}
          isLight={isLight}
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
  isLight,
}: {
  creators: Creator[]
  expectations: Expectation[]
  setExpectations: Dispatch<SetStateAction<Expectation[]>>
  dailyData: DailyRow[]
  isLight: boolean
}) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

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

  // Sort: creators with expectations first (by target desc), then others, filtered by search
  const sorted = useMemo(() => {
    let list = [...creators]
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(c => c.display_name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q))
    }
    return list.sort((a, b) => {
      const aTarget = expectationMap[a.id] || 0
      const bTarget = expectationMap[b.id] || 0
      if (aTarget && !bTarget) return -1
      if (!aTarget && bTarget) return 1
      return bTarget - aTarget
    })
  }, [creators, expectationMap, search])

  return (
    <div className="space-y-3">
      <input
        type="text"
        placeholder="Search creators..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className={`border rounded-lg px-3 py-1.5 text-[13px] outline-none w-48 ${
          isLight
            ? 'bg-black/[0.03] border-black/[0.1] text-black/80 placeholder-black/25 focus:border-black/20'
            : 'bg-white/[0.04] border-white/[0.08] text-white/80 placeholder-white/25 focus:border-white/20'
        }`}
      />
      <div className={`rounded-xl border overflow-hidden ${isLight ? 'border-black/[0.06]' : 'border-white/[0.06]'}`}>
      <table className="w-full">
        <thead>
          <tr className={`border-b ${isLight ? 'border-black/[0.06]' : 'border-white/[0.06]'}`}>
            <th className={`text-left text-[11px] font-medium px-4 py-3 uppercase tracking-wider ${isLight ? 'text-black/30' : 'text-white/30'}`}>Creator</th>
            <th className={`text-right text-[11px] font-medium px-4 py-3 uppercase tracking-wider ${isLight ? 'text-black/30' : 'text-white/30'}`}>Daily Sub Target</th>
            <th className={`text-right text-[11px] font-medium px-4 py-3 uppercase tracking-wider ${isLight ? 'text-black/30' : 'text-white/30'}`}>Days Red</th>
            <th className={`text-right text-[11px] font-medium px-4 py-3 uppercase tracking-wider w-24 ${isLight ? 'text-black/30' : 'text-white/30'}`}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(c => {
            const target = expectationMap[c.id] || 0
            const daysRed = daysRedMap[c.id] || 0
            const isEditing = editingId === c.id
            return (
              <tr key={c.id} className={`border-b transition-colors ${isLight ? 'border-black/[0.03] hover:bg-black/[0.02]' : 'border-white/[0.03] hover:bg-white/[0.02]'}`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {c.avatar_url ? (
                      <img src={c.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover" />
                    ) : (
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-medium ${isLight ? 'bg-black/[0.06] text-black/30' : 'bg-white/[0.06] text-white/30'}`}>
                        {c.display_name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className={`text-[13px] font-medium ${isLight ? 'text-black/80' : 'text-white/80'}`}>{c.display_name}</p>
                      <p className={`text-[11px] ${isLight ? 'text-black/25' : 'text-white/25'}`}>{c.slug}</p>
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
                      className={`w-20 border rounded px-2 py-1 text-[13px] text-right outline-none ${
                        isLight
                          ? 'bg-black/[0.03] border-black/[0.08] text-black/80 focus:border-black/20'
                          : 'bg-white/[0.06] border border-white/[0.1] text-white/80 focus:border-white/20'
                      }`}
                    />
                  ) : (
                    <span className={`text-[13px] tabular-nums ${target > 0 ? (isLight ? 'text-black/80' : 'text-white/80') : (isLight ? 'text-black/20' : 'text-white/20')}`}>
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
                    <span className={`text-[13px] ${isLight ? 'text-black/20' : 'text-white/20'}`}>—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {isEditing ? (
                    <div className="flex gap-1 justify-end">
                      <button
                        onClick={() => saveExpectation(c.id)}
                        disabled={saving}
                        className={`px-2 py-1 text-[11px] rounded ${isLight ? 'bg-black/[0.08] hover:bg-black/[0.12] text-black/70' : 'bg-white/[0.08] hover:bg-white/[0.12] text-white/70'}`}
                      >
                        {saving ? '...' : 'Save'}
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className={`px-2 py-1 text-[11px] ${isLight ? 'text-black/30 hover:text-black/50' : 'text-white/30 hover:text-white/50'}`}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setEditingId(c.id); setEditValue(String(target)) }}
                      className={`px-2 py-1 text-[11px] transition-colors ${isLight ? 'text-black/30 hover:text-black/60' : 'text-white/30 hover:text-white/60'}`}
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
  isLight,
}: {
  creators: Creator[]
  expectations: Expectation[]
  dailyData: DailyRow[]
  setDailyData: Dispatch<SetStateAction<DailyRow[]>>
  isLight: boolean
}) {
  const yesterday = useMemo(() => {
    const d = new Date(); d.setDate(d.getDate() - 1)
    return d.toISOString().split('T')[0]
  }, [])

  const [date, setDate] = useState(yesterday)
  const [inputs, setInputs] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [search, setSearch] = useState('')

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

  // Sort: creators with expectations first, filtered by search
  const sorted = useMemo(() => {
    let list = [...creators]
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(c => c.display_name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q))
    }
    return list.sort((a, b) => {
      const aTarget = expectationMap[a.id] || 0
      const bTarget = expectationMap[b.id] || 0
      if (aTarget && !bTarget) return -1
      if (!aTarget && bTarget) return 1
      return bTarget - aTarget
    })
  }, [creators, expectationMap, search])

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
      {/* Date selector + search */}
      <div className="flex items-center gap-4 flex-wrap">
        <input
          type="text"
          placeholder="Search creators..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className={`border rounded-lg px-3 py-1.5 text-[13px] outline-none w-48 ${
            isLight
              ? 'bg-black/[0.03] border-black/[0.1] text-black/80 placeholder-black/25 focus:border-black/20'
              : 'bg-white/[0.04] border-white/[0.08] text-white/80 placeholder-white/25 focus:border-white/20'
          }`}
        />
        <label className={`text-[12px] ${isLight ? 'text-black/40' : 'text-white/40'}`}>Date:</label>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className={`border rounded-lg px-3 py-1.5 text-[13px] outline-none ${
            isLight
              ? 'bg-black/[0.03] border-black/[0.1] text-black/80 focus:border-black/20'
              : 'bg-white/[0.04] border-white/[0.08] text-white/80 focus:border-white/20'
          }`}
        />
        <button
          onClick={saveAll}
          disabled={saving}
          className={`px-4 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
            saved
              ? 'bg-emerald-500/20 text-emerald-400'
              : isLight ? 'bg-black text-white hover:bg-black/90' : 'bg-white text-black hover:bg-white/90'
          }`}
        >
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save all'}
        </button>
      </div>

      {/* Creator input grid */}
      <div className={`rounded-xl border overflow-hidden ${isLight ? 'border-black/[0.06]' : 'border-white/[0.06]'}`}>
        <table className="w-full">
          <thead>
            <tr className={`border-b ${isLight ? 'border-black/[0.06]' : 'border-white/[0.06]'}`}>
              <th className={`text-left text-[11px] font-medium px-4 py-3 uppercase tracking-wider ${isLight ? 'text-black/30' : 'text-white/30'}`}>Creator</th>
              <th className={`text-right text-[11px] font-medium px-4 py-3 uppercase tracking-wider ${isLight ? 'text-black/30' : 'text-white/30'}`}>Target</th>
              <th className={`text-right text-[11px] font-medium px-4 py-3 uppercase tracking-wider w-32 ${isLight ? 'text-black/30' : 'text-white/30'}`}>New Subs</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(c => {
              const target = expectationMap[c.id] || 0
              const val = inputs[c.id] || ''
              const numVal = parseInt(val)
              const isBelowTarget = target > 0 && !isNaN(numVal) && numVal < target
              return (
                <tr key={c.id} className={`border-b transition-colors ${isLight ? 'border-black/[0.03] hover:bg-black/[0.02]' : 'border-white/[0.03] hover:bg-white/[0.02]'}`}>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      {c.avatar_url ? (
                        <img src={c.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover" />
                      ) : (
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-medium ${isLight ? 'bg-black/[0.06] text-black/30' : 'bg-white/[0.06] text-white/30'}`}>
                          {c.display_name.charAt(0)}
                        </div>
                      )}
                      <span className={`text-[13px] ${isLight ? 'text-black/80' : 'text-white/80'}`}>{c.display_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <span className={`text-[13px] tabular-nums ${target > 0 ? (isLight ? 'text-black/50' : 'text-white/50') : (isLight ? 'text-black/15' : 'text-white/15')}`}>
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
                      className={`w-full border rounded px-3 py-1.5 text-[13px] text-right outline-none transition-colors tabular-nums ${
                        isBelowTarget
                          ? 'border-red-500/30 text-red-400 focus:border-red-500/50'
                          : isLight ? 'bg-black/[0.03] border-black/[0.08] text-black/80 focus:border-black/20' : 'bg-white/[0.04] border-white/[0.08] text-white/80 focus:border-white/20'
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
  initialCreatorId,
  isLight,
}: {
  creators: Creator[]
  expectations: Expectation[]
  dailyData: DailyRow[]
  setDailyData: Dispatch<SetStateAction<DailyRow[]>>
  initialCreatorId?: string
  isLight: boolean
}) {
  const [selectedCreator, setSelectedCreator] = useState(
    (initialCreatorId && creators.some(c => c.id === initialCreatorId) ? initialCreatorId : creators[0]?.id) || ''
  )
  const [editingCell, setEditingCell] = useState<string | null>(null)
  const [editField, setEditField] = useState<string>('new_subs')
  const [editValue, setEditValue] = useState('')
  const [calculating, setCalculating] = useState(false)
  const [creatorSearch, setCreatorSearch] = useState('')
  const [showCreatorDropdown, setShowCreatorDropdown] = useState(false)
  const creatorDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (creatorDropdownRef.current && !creatorDropdownRef.current.contains(e.target as Node)) {
        setShowCreatorDropdown(false)
      }
    }
    if (showCreatorDropdown) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showCreatorDropdown])

  const filteredCreators = useMemo(() => {
    if (!creatorSearch.trim()) return creators
    const q = creatorSearch.toLowerCase()
    return creators.filter(c => c.display_name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q))
  }, [creators, creatorSearch])

  const selectedCreatorObj = creators.find(c => c.id === selectedCreator)

  // Date range state — default to last 30 days
  const [dateStart, setDateStart] = useState<Date>(() => {
    const d = new Date(); d.setDate(d.getDate() - 30); return d
  })
  const [dateEnd, setDateEnd] = useState<Date>(new Date())
  const [dateLabel, setDateLabel] = useState('Last 30 days')
  function handleDateApply(label: string, start: Date, end: Date) {
    setDateStart(start); setDateEnd(end); setDateLabel(label)
  }

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

  async function saveCell(creatorId: string, date: string, field: string, value: number) {
    const res = await fetch('/api/admin/conversions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_cell', creator_id: creatorId, date, field, value }),
    })
    if (res.ok) {
      const [updated] = await res.json()
      setDailyData((prev: DailyRow[]) => {
        const idx = prev.findIndex(d => d.creator_id === creatorId && d.date === date)
        if (idx >= 0) return prev.map(d => (d.creator_id === creatorId && d.date === date) ? updated : d)
        return [updated, ...prev]
      })
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
        {/* Creator selector with search */}
        <div className="relative" ref={creatorDropdownRef}>
          <button
            onClick={() => setShowCreatorDropdown(!showCreatorDropdown)}
            className={`flex items-center gap-2 border rounded-lg px-3 py-1.5 text-[13px] transition-colors min-w-[200px] ${
              isLight
                ? 'bg-black/[0.03] border-black/[0.1] text-black/80 hover:border-black/[0.2]'
                : 'bg-white/[0.04] border-white/[0.08] text-white/80 hover:border-white/[0.12]'
            }`}
          >
            {selectedCreatorObj ? (
              <>
                {selectedCreatorObj.avatar_url && (
                  <img src={selectedCreatorObj.avatar_url} alt="" className="w-5 h-5 rounded-full object-cover" />
                )}
                <span className="truncate">{selectedCreatorObj.display_name}</span>
                <span className={`text-[11px] ${isLight ? 'text-black/30' : 'text-white/30'}`}>({selectedCreatorObj.slug})</span>
              </>
            ) : (
              <span className={isLight ? 'text-black/40' : 'text-white/40'}>Select creator...</span>
            )}
            <svg className={`w-3 h-3 ml-auto flex-shrink-0 ${isLight ? 'text-black/30' : 'text-white/30'}`} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 5l3 3 3-3" /></svg>
          </button>
          {showCreatorDropdown && (
            <div className={`absolute top-full mt-1 left-0 z-50 border rounded-xl shadow-2xl w-[280px] overflow-hidden ${
              isLight ? 'bg-white border-black/[0.1]' : 'bg-[#111] border-white/[0.1]'
            }`}>
              <div className={`p-2 border-b ${isLight ? 'border-black/[0.06]' : 'border-white/[0.06]'}`}>
                <input
                  type="text"
                  placeholder="Search creators..."
                  value={creatorSearch}
                  onChange={e => setCreatorSearch(e.target.value)}
                  autoFocus
                  className={`w-full border rounded-lg px-2.5 py-1.5 text-[12px] outline-none ${
                    isLight
                      ? 'bg-black/[0.03] border-black/[0.08] text-black/80 placeholder-black/25 focus:border-black/20'
                      : 'bg-white/[0.04] border-white/[0.08] text-white/80 placeholder-white/25 focus:border-white/20'
                  }`}
                />
              </div>
              <div className="max-h-[240px] overflow-y-auto">
                {filteredCreators.map(c => (
                  <button
                    key={c.id}
                    onClick={() => { setSelectedCreator(c.id); setShowCreatorDropdown(false); setCreatorSearch('') }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-[12px] transition-colors ${
                      isLight
                        ? `hover:bg-black/[0.04] ${c.id === selectedCreator ? 'bg-black/[0.03] text-black/90' : 'text-black/60'}`
                        : `hover:bg-white/[0.06] ${c.id === selectedCreator ? 'bg-white/[0.04] text-white/90' : 'text-white/60'}`
                    }`}
                  >
                    {c.avatar_url ? (
                      <img src={c.avatar_url} alt="" className="w-5 h-5 rounded-full object-cover" />
                    ) : (
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] ${
                        isLight ? 'bg-black/[0.06] text-black/30' : 'bg-white/[0.06] text-white/30'
                      }`}>{c.display_name.charAt(0)}</div>
                    )}
                    <span className="truncate">{c.display_name}</span>
                    <span className={`text-[10px] ${isLight ? 'text-black/20' : 'text-white/20'}`}>{c.slug}</span>
                  </button>
                ))}
                {filteredCreators.length === 0 && (
                  <p className={`text-center py-4 text-[12px] ${isLight ? 'text-black/20' : 'text-white/20'}`}>No match</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Date range picker */}
        <DateRangePicker
          dateStart={dateStart}
          dateEnd={dateEnd}
          dateLabel={dateLabel}
          onApply={handleDateApply}
          isLight={isLight}
        />

        {/* Calculate button */}
        <button
          onClick={runCalculation}
          disabled={calculating}
          className={`px-3 py-1.5 rounded-lg text-[12px] transition-colors ${
            isLight
              ? 'bg-black/[0.04] text-black/50 hover:text-black/80 hover:bg-black/[0.08]'
              : 'bg-white/[0.06] text-white/50 hover:text-white/80 hover:bg-white/[0.1]'
          }`}
        >
          {calculating ? 'Calculating...' : 'Recalculate yesterday'}
        </button>

        {target > 0 && (
          <span className={`text-[12px] ${isLight ? 'text-black/30' : 'text-white/30'}`}>Target: <span className={`font-medium ${isLight ? 'text-black/60' : 'text-white/60'}`}>{target} subs/day</span></span>
        )}
      </div>

      {/* Data table */}
      <div className={`rounded-xl border overflow-x-auto ${isLight ? 'border-black/[0.06]' : 'border-white/[0.06]'}`}>
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className={`border-b ${isLight ? 'border-black/[0.06]' : 'border-white/[0.06]'}`}>
              <th className={`text-left text-[11px] font-medium px-4 py-3 uppercase tracking-wider ${isLight ? 'text-black/30' : 'text-white/30'}`}>Date</th>
              <th className={`text-right text-[11px] font-medium px-4 py-3 uppercase tracking-wider ${isLight ? 'text-black/30' : 'text-white/30'}`}>Views</th>
              <th className={`text-right text-[11px] font-medium px-4 py-3 uppercase tracking-wider ${isLight ? 'text-black/30' : 'text-white/30'}`}>Profile Views</th>
              <th className={`text-right text-[11px] font-medium px-3 py-3 uppercase tracking-wider text-[10px] ${isLight ? 'text-black/30' : 'text-white/30'}`}>Views→Profile</th>
              <th className={`text-right text-[11px] font-medium px-4 py-3 uppercase tracking-wider ${isLight ? 'text-black/30' : 'text-white/30'}`}>Link Clicks</th>
              <th className={`text-right text-[11px] font-medium px-3 py-3 uppercase tracking-wider text-[10px] ${isLight ? 'text-black/30' : 'text-white/30'}`}>Views→Clicks</th>
              <th className={`text-right text-[11px] font-medium px-3 py-3 uppercase tracking-wider text-[10px] ${isLight ? 'text-black/30' : 'text-white/30'}`}>Profile→Clicks</th>
              <th className={`text-right text-[11px] font-medium px-4 py-3 uppercase tracking-wider ${isLight ? 'text-black/30' : 'text-white/30'}`}>Subs</th>
              <th className={`text-right text-[11px] font-medium px-3 py-3 uppercase tracking-wider text-[10px] ${isLight ? 'text-black/30' : 'text-white/30'}`}>Clicks→Subs</th>
              <th className={`text-right text-[11px] font-medium px-3 py-3 uppercase tracking-wider text-[10px] ${isLight ? 'text-black/30' : 'text-white/30'}`}>Subs→Views</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={10} className={`text-center py-12 text-[13px] ${isLight ? 'text-black/20' : 'text-white/20'}`}>
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
                const rowKey = `${row.creator_id}-${row.date}`

                // Ratios
                const viewsToProfile = views > 0 ? pv / views : 0
                const viewsToClicks = views > 0 ? lc / views : 0
                const profileToClicks = pv > 0 ? lc / pv : 0
                const clicksToSubs = lc > 0 ? subs / lc : 0
                const subsToViews = views > 0 ? subs / views : 0

                // Editable cell helper
                const EditableCell = ({ field, value, highlight }: { field: string; value: number; highlight?: boolean }) => {
                  const cellKey = `${rowKey}-${field}`
                  const isEditingThis = editingCell === cellKey
                  if (isEditingThis) {
                    return (
                      <input
                        type="number"
                        min="0"
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') saveCell(row.creator_id, row.date, field, parseInt(editValue) || 0)
                          if (e.key === 'Escape') setEditingCell(null)
                        }}
                        onBlur={() => saveCell(row.creator_id, row.date, field, parseInt(editValue) || 0)}
                        autoFocus
                        className={`w-16 border rounded px-2 py-0.5 text-[13px] text-right outline-none tabular-nums ${
                          isLight
                            ? 'bg-black/[0.03] border-black/[0.08] text-black/80 focus:border-black/20'
                            : 'bg-white/[0.06] border-white/[0.15] text-white/80 focus:border-white/30'
                        }`}
                      />
                    )
                  }
                  return (
                    <button
                      onClick={() => { setEditingCell(cellKey); setEditField(field); setEditValue(String(value)) }}
                      className={`text-[13px] tabular-nums cursor-pointer transition-all duration-150 rounded px-1 -mx-1 ${
                        highlight
                          ? 'text-red-400 font-medium hover:bg-red-500/10'
                          : isLight
                            ? 'text-black/70 hover:text-black/90 hover:bg-black/[0.04]'
                            : 'text-white/70 hover:text-white/90 hover:bg-white/[0.04]'
                      }`}
                      title="Click to edit"
                    >
                      {value > 0 ? fmtNum(value) : '—'}
                    </button>
                  )
                }

                return (
                  <tr
                    key={rowKey}
                    className={`border-b transition-colors ${isLight ? 'border-black/[0.03]' : 'border-white/[0.03]'} ${
                      isBelowTarget ? 'bg-red-500/[0.06] hover:bg-red-500/[0.1]' : isLight ? 'hover:bg-black/[0.02]' : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    <td className={`px-4 py-2.5 text-[13px] ${isLight ? 'text-black/60' : 'text-white/60'}`}>{fmtDate(row.date)}</td>
                    <td className="px-4 py-2.5 text-right"><EditableCell field="views" value={views} /></td>
                    <td className="px-4 py-2.5 text-right"><EditableCell field="profile_views" value={pv} /></td>
                    <td className={`px-3 py-2.5 text-right text-[12px] tabular-nums ${isLight ? 'text-black/35' : 'text-white/35'}`}>{views > 0 ? fmtPct(viewsToProfile) : '—'}</td>
                    <td className="px-4 py-2.5 text-right"><EditableCell field="link_clicks" value={lc} /></td>
                    <td className={`px-3 py-2.5 text-right text-[12px] tabular-nums ${isLight ? 'text-black/35' : 'text-white/35'}`}>{views > 0 ? fmtPct(viewsToClicks) : '—'}</td>
                    <td className={`px-3 py-2.5 text-right text-[12px] tabular-nums ${isLight ? 'text-black/35' : 'text-white/35'}`}>{pv > 0 ? fmtPct(profileToClicks) : '—'}</td>
                    <td className="px-4 py-2.5 text-right"><EditableCell field="new_subs" value={subs} highlight={isBelowTarget} /></td>
                    <td className={`px-3 py-2.5 text-right text-[12px] tabular-nums ${isLight ? 'text-black/35' : 'text-white/35'}`}>{lc > 0 ? fmtPct(clicksToSubs) : '—'}</td>
                    <td className={`px-3 py-2.5 text-right text-[12px] tabular-nums ${isLight ? 'text-black/35' : 'text-white/35'}`}>{views > 0 ? fmtPct(subsToViews) : '—'}</td>
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
