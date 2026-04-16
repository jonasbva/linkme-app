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
  of_handle?: string | null
}

interface ConversionAccount {
  id: string
  creator_id: string
  handle: string
  display_label: string | null
  sheet_tab_name: string | null
  is_active: boolean
}

interface Expectation {
  id: string
  creator_id: string
  conversion_account_id: string | null
  daily_sub_target: number
}

interface DailyRow {
  id: string
  creator_id: string
  conversion_account_id: string | null
  date: string
  views: number
  profile_views: number
  link_clicks: number
  new_subs: number
}

interface Props {
  creators: Creator[]
  conversionAccounts: ConversionAccount[]
  expectations: Expectation[]
  dailyData: DailyRow[]
}

type Tab = 'expectations' | 'input' | 'table'

/** Shared: account display labels. */
function formatAccountName(account: ConversionAccount, creator: Creator | undefined): string {
  const name = creator?.display_name || account.handle
  if (!account.display_label) return name
  return `${name} — ${account.display_label}`
}

export default function ConversionsClient({
  creators,
  conversionAccounts,
  expectations: initialExpectations,
  dailyData: initialDaily,
}: Props) {
  const searchParams = useSearchParams()
  const preselectedCreator = searchParams.get('creator')
  const { resolved: themeMode } = useTheme()
  const isLight = themeMode === 'light'

  const [activeTab, setActiveTab] = useState<Tab>(preselectedCreator ? 'table' : 'expectations')
  const [expectations, setExpectations] = useState(initialExpectations)
  const [dailyData, setDailyData] = useState(initialDaily)

  const creatorById = useMemo(() => {
    const map: Record<string, Creator> = {}
    creators.forEach(c => { map[c.id] = c })
    return map
  }, [creators])

  const tabs: { key: Tab; label: string }[] = [
    { key: 'expectations', label: 'Expectations' },
    { key: 'input', label: 'Daily Input' },
    { key: 'table', label: 'Conversion Table' },
  ]

  return (
    <div className="space-y-6">
      <h1 className={`text-xl font-semibold tracking-tight ${isLight ? 'text-black/90' : 'text-white/90'}`}>
        Conversions
      </h1>

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
          creatorById={creatorById}
          conversionAccounts={conversionAccounts}
          expectations={expectations}
          setExpectations={setExpectations}
          dailyData={dailyData}
          isLight={isLight}
        />
      )}
      {activeTab === 'input' && (
        <DailyInputTab
          creatorById={creatorById}
          conversionAccounts={conversionAccounts}
          expectations={expectations}
          dailyData={dailyData}
          setDailyData={setDailyData}
          isLight={isLight}
        />
      )}
      {activeTab === 'table' && (
        <ConversionTableTab
          creators={creators}
          creatorById={creatorById}
          conversionAccounts={conversionAccounts}
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
  creatorById,
  conversionAccounts,
  expectations,
  setExpectations,
  dailyData,
  isLight,
}: {
  creatorById: Record<string, Creator>
  conversionAccounts: ConversionAccount[]
  expectations: Expectation[]
  setExpectations: Dispatch<SetStateAction<Expectation[]>>
  dailyData: DailyRow[]
  isLight: boolean
}) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  // Map conversion_account_id → target
  const targetByAccount = useMemo(() => {
    const map: Record<string, number> = {}
    expectations.forEach(e => {
      if (e.conversion_account_id) map[e.conversion_account_id] = e.daily_sub_target
    })
    return map
  }, [expectations])

  // Days-red-in-a-row per conversion_account_id.
  const daysRedMap = useMemo(() => {
    const map: Record<string, number> = {}
    conversionAccounts.forEach(ca => {
      const target = targetByAccount[ca.id] || 0
      if (target === 0) { map[ca.id] = 0; return }
      const dailyForAcc = dailyData
        .filter(d => d.conversion_account_id === ca.id)
        .sort((a, b) => b.date.localeCompare(a.date))
      let streak = 0
      for (const row of dailyForAcc) {
        if (row.new_subs < target) streak++
        else break
      }
      map[ca.id] = streak
    })
    return map
  }, [conversionAccounts, targetByAccount, dailyData])

  async function saveExpectation(accountId: string) {
    const val = parseInt(editValue)
    if (isNaN(val) || val < 0) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/conversions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set_expectation',
          conversion_account_id: accountId,
          daily_sub_target: val,
        }),
      })
      if (res.ok) {
        setExpectations(prev => {
          const existing = prev.find(e => e.conversion_account_id === accountId)
          if (existing) {
            return prev.map(e =>
              e.conversion_account_id === accountId ? { ...e, daily_sub_target: val } : e
            )
          }
          const acc = conversionAccounts.find(a => a.id === accountId)
          return [...prev, {
            id: 'new',
            creator_id: acc?.creator_id || '',
            conversion_account_id: accountId,
            daily_sub_target: val,
          }]
        })
      }
    } finally {
      setSaving(false)
      setEditingId(null)
    }
  }

  // Sort: accounts with targets first (desc), then others, filtered by search.
  const sorted = useMemo(() => {
    let list = [...conversionAccounts]
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(ca => {
        const c = creatorById[ca.creator_id]
        return (
          ca.handle.toLowerCase().includes(q) ||
          c?.display_name.toLowerCase().includes(q) ||
          c?.slug.toLowerCase().includes(q)
        )
      })
    }
    return list.sort((a, b) => {
      const aT = targetByAccount[a.id] || 0
      const bT = targetByAccount[b.id] || 0
      if (aT && !bT) return -1
      if (!aT && bT) return 1
      if (aT !== bT) return bT - aT
      // Tie-break: creator name, then main first.
      const aName = creatorById[a.creator_id]?.display_name || a.handle
      const bName = creatorById[b.creator_id]?.display_name || b.handle
      if (aName !== bName) return aName.localeCompare(bName)
      // Main (display_label null) before alts.
      if (!a.display_label && b.display_label) return -1
      if (a.display_label && !b.display_label) return 1
      return a.handle.localeCompare(b.handle)
    })
  }, [conversionAccounts, creatorById, targetByAccount, search])

  return (
    <div className="space-y-3">
      <input
        type="text"
        placeholder="Search creators or handles..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className={`border rounded-lg px-3 py-1.5 text-[13px] outline-none w-56 ${
          isLight
            ? 'bg-black/[0.03] border-black/[0.1] text-black/80 placeholder-black/25 focus:border-black/20'
            : 'bg-white/[0.04] border-white/[0.08] text-white/80 placeholder-white/25 focus:border-white/20'
        }`}
      />
      <div className={`rounded-xl border overflow-hidden ${isLight ? 'border-black/[0.06]' : 'border-white/[0.06]'}`}>
      <table className="w-full">
        <thead>
          <tr className={`border-b ${isLight ? 'border-black/[0.06]' : 'border-white/[0.06]'}`}>
            <th className={`text-left text-[11px] font-medium px-4 py-3 uppercase tracking-wider ${isLight ? 'text-black/30' : 'text-white/30'}`}>Conversion Account</th>
            <th className={`text-right text-[11px] font-medium px-4 py-3 uppercase tracking-wider ${isLight ? 'text-black/30' : 'text-white/30'}`}>Daily Sub Target</th>
            <th className={`text-right text-[11px] font-medium px-4 py-3 uppercase tracking-wider ${isLight ? 'text-black/30' : 'text-white/30'}`}>Days Red</th>
            <th className={`text-right text-[11px] font-medium px-4 py-3 uppercase tracking-wider w-24 ${isLight ? 'text-black/30' : 'text-white/30'}`}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(ca => {
            const creator = creatorById[ca.creator_id]
            const target = targetByAccount[ca.id] || 0
            const daysRed = daysRedMap[ca.id] || 0
            const isEditing = editingId === ca.id
            return (
              <tr key={ca.id} className={`border-b transition-colors ${isLight ? 'border-black/[0.03] hover:bg-black/[0.02]' : 'border-white/[0.03] hover:bg-white/[0.02]'}`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {creator?.avatar_url ? (
                      <img src={creator.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover" />
                    ) : (
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-medium ${isLight ? 'bg-black/[0.06] text-black/30' : 'bg-white/[0.06] text-white/30'}`}>
                        {(creator?.display_name || ca.handle).charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className={`text-[13px] font-medium flex items-center gap-2 ${isLight ? 'text-black/80' : 'text-white/80'}`}>
                        {creator?.display_name || '—'}
                        {ca.display_label && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isLight ? 'bg-black/[0.05] text-black/50' : 'bg-white/[0.06] text-white/50'}`}>
                            {ca.display_label}
                          </span>
                        )}
                      </p>
                      <p className={`text-[11px] font-mono ${isLight ? 'text-black/35' : 'text-white/35'}`}>@{ca.handle}</p>
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
                      onKeyDown={e => { if (e.key === 'Enter') saveExpectation(ca.id); if (e.key === 'Escape') setEditingId(null) }}
                      autoFocus
                      className={`w-20 border rounded px-2 py-1 text-[13px] text-right outline-none ${
                        isLight
                          ? 'bg-white border-black/[0.15] text-black/80 focus:border-black/30'
                          : 'bg-white/[0.06] border-white/[0.1] text-white/80 focus:border-white/20'
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
                        ? isLight ? 'text-emerald-600 bg-emerald-500/10' : 'text-emerald-400 bg-emerald-400/10'
                        : daysRed <= 3
                        ? isLight ? 'text-amber-600 bg-amber-500/10' : 'text-amber-400 bg-amber-400/10'
                        : isLight ? 'text-red-600 bg-red-500/10' : 'text-red-400 bg-red-400/10'
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
                        onClick={() => saveExpectation(ca.id)}
                        disabled={saving}
                        className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors ${
                          isLight
                            ? 'bg-black text-white hover:bg-black/90 disabled:opacity-50'
                            : 'bg-white text-black hover:bg-white/90 disabled:opacity-50'
                        }`}
                      >
                        {saving ? '...' : 'Save'}
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className={`px-2 py-1 text-[11px] transition-colors ${
                          isLight ? 'text-black/40 hover:text-black/70' : 'text-white/30 hover:text-white/50'
                        }`}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setEditingId(ca.id); setEditValue(String(target)) }}
                      className={`px-2 py-1 text-[11px] transition-colors ${
                        isLight ? 'text-black/40 hover:text-black/80 hover:bg-black/[0.04] rounded' : 'text-white/30 hover:text-white/60'
                      }`}
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
  creatorById,
  conversionAccounts,
  expectations,
  dailyData,
  setDailyData,
  isLight,
}: {
  creatorById: Record<string, Creator>
  conversionAccounts: ConversionAccount[]
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

  const targetByAccount = useMemo(() => {
    const map: Record<string, number> = {}
    expectations.forEach(e => {
      if (e.conversion_account_id) map[e.conversion_account_id] = e.daily_sub_target
    })
    return map
  }, [expectations])

  // Pre-fill with existing values for the selected date.
  useEffect(() => {
    const dateRows = dailyData.filter(d => d.date === date)
    const filled: Record<string, string> = {}
    dateRows.forEach(row => {
      if (row.conversion_account_id) filled[row.conversion_account_id] = String(row.new_subs)
    })
    setInputs(filled)
    setSaved(false)
  }, [date, dailyData])

  const sorted = useMemo(() => {
    let list = [...conversionAccounts]
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(ca => {
        const c = creatorById[ca.creator_id]
        return (
          ca.handle.toLowerCase().includes(q) ||
          c?.display_name.toLowerCase().includes(q) ||
          c?.slug.toLowerCase().includes(q)
        )
      })
    }
    return list.sort((a, b) => {
      const aT = targetByAccount[a.id] || 0
      const bT = targetByAccount[b.id] || 0
      if (aT && !bT) return -1
      if (!aT && bT) return 1
      if (aT !== bT) return bT - aT
      const aName = creatorById[a.creator_id]?.display_name || a.handle
      const bName = creatorById[b.creator_id]?.display_name || b.handle
      if (aName !== bName) return aName.localeCompare(bName)
      if (!a.display_label && b.display_label) return -1
      if (a.display_label && !b.display_label) return 1
      return a.handle.localeCompare(b.handle)
    })
  }, [conversionAccounts, creatorById, targetByAccount, search])

  async function saveAll() {
    setSaving(true)
    try {
      const entries = Object.entries(inputs)
        .filter(([, val]) => val !== '' && !isNaN(parseInt(val)))
        .map(([conversion_account_id, val]) => ({ conversion_account_id, new_subs: parseInt(val) }))

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
            const idx = updated.findIndex(d =>
              d.conversion_account_id === nr.conversion_account_id && d.date === nr.date
            )
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
          placeholder="Search creators or handles..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className={`border rounded-lg px-3 py-1.5 text-[13px] outline-none w-56 ${
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
              ? isLight
                ? 'bg-emerald-500/20 text-emerald-700'
                : 'bg-emerald-500/20 text-emerald-300'
              : isLight
                ? 'bg-black text-white hover:bg-black/90 disabled:opacity-50'
                : 'bg-white text-black hover:bg-white/90 disabled:opacity-50'
          }`}
        >
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save all'}
        </button>
      </div>

      {/* Accounts input grid */}
      <div className={`rounded-xl border overflow-hidden ${isLight ? 'border-black/[0.06]' : 'border-white/[0.06]'}`}>
        <table className="w-full">
          <thead>
            <tr className={`border-b ${isLight ? 'border-black/[0.06]' : 'border-white/[0.06]'}`}>
              <th className={`text-left text-[11px] font-medium px-4 py-3 uppercase tracking-wider ${isLight ? 'text-black/30' : 'text-white/30'}`}>Account</th>
              <th className={`text-right text-[11px] font-medium px-4 py-3 uppercase tracking-wider ${isLight ? 'text-black/30' : 'text-white/30'}`}>Target</th>
              <th className={`text-right text-[11px] font-medium px-4 py-3 uppercase tracking-wider w-32 ${isLight ? 'text-black/30' : 'text-white/30'}`}>New Subs</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(ca => {
              const creator = creatorById[ca.creator_id]
              const target = targetByAccount[ca.id] || 0
              const val = inputs[ca.id] || ''
              const numVal = parseInt(val)
              const isBelowTarget = target > 0 && !isNaN(numVal) && numVal < target
              return (
                <tr key={ca.id} className={`border-b transition-colors ${isLight ? 'border-black/[0.03] hover:bg-black/[0.02]' : 'border-white/[0.03] hover:bg-white/[0.02]'}`}>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      {creator?.avatar_url ? (
                        <img src={creator.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover" />
                      ) : (
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-medium ${isLight ? 'bg-black/[0.06] text-black/30' : 'bg-white/[0.06] text-white/30'}`}>
                          {(creator?.display_name || ca.handle).charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className={`text-[13px] flex items-center gap-2 ${isLight ? 'text-black/80' : 'text-white/80'}`}>
                          {creator?.display_name || '—'}
                          {ca.display_label && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isLight ? 'bg-black/[0.05] text-black/50' : 'bg-white/[0.06] text-white/50'}`}>
                              {ca.display_label}
                            </span>
                          )}
                        </p>
                        <p className={`text-[11px] font-mono ${isLight ? 'text-black/35' : 'text-white/35'}`}>@{ca.handle}</p>
                      </div>
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
                      onChange={e => setInputs(prev => ({ ...prev, [ca.id]: e.target.value }))}
                      className={`w-full border rounded px-3 py-1.5 text-[13px] text-right outline-none transition-colors tabular-nums ${
                        isBelowTarget
                          ? isLight
                            ? 'bg-red-500/[0.06] border-red-500/30 text-red-600 focus:border-red-500/50'
                            : 'bg-red-500/[0.04] border-red-500/30 text-red-400 focus:border-red-500/50'
                          : isLight
                            ? 'bg-black/[0.03] border-black/[0.08] text-black/80 focus:border-black/20'
                            : 'bg-white/[0.04] border-white/[0.08] text-white/80 focus:border-white/20'
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
  creatorById,
  conversionAccounts,
  expectations,
  dailyData,
  setDailyData,
  initialCreatorId,
  isLight,
}: {
  creators: Creator[]
  creatorById: Record<string, Creator>
  conversionAccounts: ConversionAccount[]
  expectations: Expectation[]
  dailyData: DailyRow[]
  setDailyData: Dispatch<SetStateAction<DailyRow[]>>
  initialCreatorId?: string
  isLight: boolean
}) {
  // Pick default: creator from URL → first main account for that creator, else first account.
  const firstAccountFor = (cid?: string) => {
    if (!cid) return conversionAccounts[0]?.id || ''
    const mains = conversionAccounts.filter(a => a.creator_id === cid && !a.display_label)
    if (mains.length) return mains[0].id
    const anyFor = conversionAccounts.find(a => a.creator_id === cid)
    return anyFor?.id || conversionAccounts[0]?.id || ''
  }

  const [selectedAccountId, setSelectedAccountId] = useState<string>(firstAccountFor(initialCreatorId))
  const [editingCell, setEditingCell] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [accountSearch, setAccountSearch] = useState('')
  const [showAccountDropdown, setShowAccountDropdown] = useState(false)
  const accountDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(e.target as Node)) {
        setShowAccountDropdown(false)
      }
    }
    if (showAccountDropdown) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showAccountDropdown])

  // Sort accounts: main first per creator, alphabetical by creator name.
  const sortedAccounts = useMemo(() => {
    return [...conversionAccounts].sort((a, b) => {
      const aName = creatorById[a.creator_id]?.display_name || a.handle
      const bName = creatorById[b.creator_id]?.display_name || b.handle
      if (aName !== bName) return aName.localeCompare(bName)
      if (!a.display_label && b.display_label) return -1
      if (a.display_label && !b.display_label) return 1
      return a.handle.localeCompare(b.handle)
    })
  }, [conversionAccounts, creatorById])

  const filteredAccounts = useMemo(() => {
    if (!accountSearch.trim()) return sortedAccounts
    const q = accountSearch.toLowerCase()
    return sortedAccounts.filter(a => {
      const c = creatorById[a.creator_id]
      return (
        a.handle.toLowerCase().includes(q) ||
        c?.display_name.toLowerCase().includes(q) ||
        c?.slug.toLowerCase().includes(q)
      )
    })
  }, [sortedAccounts, creatorById, accountSearch])

  const selectedAccount = conversionAccounts.find(a => a.id === selectedAccountId)
  const selectedCreator = selectedAccount ? creatorById[selectedAccount.creator_id] : undefined

  // Date range state
  const [dateStart, setDateStart] = useState<Date>(() => {
    const d = new Date(); d.setDate(d.getDate() - 30); return d
  })
  const [dateEnd, setDateEnd] = useState<Date>(new Date())
  const [dateLabel, setDateLabel] = useState('Last 30 days')
  function handleDateApply(label: string, start: Date, end: Date) {
    setDateStart(start); setDateEnd(end); setDateLabel(label)
  }

  const target = useMemo(() => {
    if (!selectedAccountId) return 0
    const exp = expectations.find(e => e.conversion_account_id === selectedAccountId)
    return exp?.daily_sub_target || 0
  }, [expectations, selectedAccountId])

  const filteredData = useMemo(() => {
    if (!selectedAccountId) return []
    // Use local date (YYYY-MM-DD) to avoid timezone drift from toISOString().
    const pad = (n: number) => String(n).padStart(2, '0')
    const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
    const startStr = fmt(dateStart)
    const endStr = fmt(dateEnd)
    return dailyData
      .filter(d => d.conversion_account_id === selectedAccountId && d.date >= startStr && d.date <= endStr)
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [dailyData, selectedAccountId, dateStart, dateEnd])

  async function saveCell(accountId: string, date: string, field: string, value: number) {
    const res = await fetch('/api/admin/conversions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'update_cell',
        conversion_account_id: accountId,
        date,
        field,
        value,
      }),
    })
    if (res.ok) {
      const [updated] = await res.json()
      setDailyData((prev: DailyRow[]) => {
        const idx = prev.findIndex(d => d.conversion_account_id === accountId && d.date === date)
        if (idx >= 0) return prev.map(d => (d.conversion_account_id === accountId && d.date === date) ? updated : d)
        return [updated, ...prev]
      })
    }
    setEditingCell(null)
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
        {/* Account selector with search */}
        <div className="relative" ref={accountDropdownRef}>
          <button
            onClick={() => setShowAccountDropdown(!showAccountDropdown)}
            className={`flex items-center gap-2 border rounded-lg px-3 py-1.5 text-[13px] transition-colors min-w-[240px] ${
              isLight
                ? 'bg-black/[0.03] border-black/[0.1] text-black/80 hover:border-black/[0.2]'
                : 'bg-white/[0.04] border-white/[0.08] text-white/80 hover:border-white/[0.12]'
            }`}
          >
            {selectedAccount ? (
              <>
                {selectedCreator?.avatar_url && (
                  <img src={selectedCreator.avatar_url} alt="" className="w-5 h-5 rounded-full object-cover" />
                )}
                <span className="truncate">{selectedCreator?.display_name || '—'}</span>
                {selectedAccount.display_label && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isLight ? 'bg-black/[0.05] text-black/50' : 'bg-white/[0.06] text-white/50'}`}>
                    {selectedAccount.display_label}
                  </span>
                )}
                <span className={`text-[11px] ${isLight ? 'text-black/30' : 'text-white/30'}`}>@{selectedAccount.handle}</span>
              </>
            ) : (
              <span className={isLight ? 'text-black/40' : 'text-white/40'}>Select account...</span>
            )}
            <svg className={`w-3 h-3 ml-auto flex-shrink-0 ${isLight ? 'text-black/30' : 'text-white/30'}`} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 5l3 3 3-3" /></svg>
          </button>
          {showAccountDropdown && (
            <div className={`absolute top-full mt-1 left-0 z-50 border rounded-xl shadow-2xl w-[320px] overflow-hidden ${
              isLight ? 'bg-white border-black/[0.1]' : 'bg-[#111] border-white/[0.1]'
            }`}>
              <div className={`p-2 border-b ${isLight ? 'border-black/[0.06]' : 'border-white/[0.06]'}`}>
                <input
                  type="text"
                  placeholder="Search accounts..."
                  value={accountSearch}
                  onChange={e => setAccountSearch(e.target.value)}
                  autoFocus
                  className={`w-full border rounded-lg px-2.5 py-1.5 text-[12px] outline-none ${
                    isLight
                      ? 'bg-black/[0.03] border-black/[0.08] text-black/80 placeholder-black/25 focus:border-black/20'
                      : 'bg-white/[0.04] border-white/[0.08] text-white/80 placeholder-white/25 focus:border-white/20'
                  }`}
                />
              </div>
              <div className="max-h-[260px] overflow-y-auto">
                {filteredAccounts.map(a => {
                  const c = creatorById[a.creator_id]
                  const active = a.id === selectedAccountId
                  return (
                    <button
                      key={a.id}
                      onClick={() => { setSelectedAccountId(a.id); setShowAccountDropdown(false); setAccountSearch('') }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-[12px] transition-colors ${
                        isLight
                          ? `hover:bg-black/[0.04] ${active ? 'bg-black/[0.05] text-black/90' : 'text-black/70'}`
                          : `hover:bg-white/[0.06] ${active ? 'bg-white/[0.05] text-white/90' : 'text-white/70'}`
                      }`}
                    >
                      {c?.avatar_url ? (
                        <img src={c.avatar_url} alt="" className="w-5 h-5 rounded-full object-cover" />
                      ) : (
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] ${
                          isLight ? 'bg-black/[0.06] text-black/30' : 'bg-white/[0.06] text-white/30'
                        }`}>{(c?.display_name || a.handle).charAt(0).toUpperCase()}</div>
                      )}
                      <span className="truncate">{c?.display_name || '—'}</span>
                      {a.display_label && (
                        <span className={`text-[10px] px-1 py-px rounded ${isLight ? 'bg-black/[0.05] text-black/40' : 'bg-white/[0.06] text-white/40'}`}>
                          {a.display_label}
                        </span>
                      )}
                      <span className={`text-[10px] font-mono ml-auto ${isLight ? 'text-black/30' : 'text-white/30'}`}>@{a.handle}</span>
                    </button>
                  )
                })}
                {filteredAccounts.length === 0 && (
                  <p className={`text-center py-4 text-[12px] ${isLight ? 'text-black/30' : 'text-white/20'}`}>No match</p>
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

        {target > 0 && (
          <span className={`text-[12px] ${isLight ? 'text-black/40' : 'text-white/30'}`}>Target: <span className={`font-medium ${isLight ? 'text-black/70' : 'text-white/60'}`}>{target} subs/day</span></span>
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
                <td colSpan={10} className={`text-center py-12 text-[13px] ${isLight ? 'text-black/30' : 'text-white/20'}`}>
                  No data for this period. Enter subs in the Daily Input tab.
                </td>
              </tr>
            ) : (
              filteredData.map(row => {
                const views = row.views
                const pv = row.profile_views
                const lc = row.link_clicks
                const subs = row.new_subs
                const isBelowTarget = target > 0 && subs < target
                const rowKey = `${row.conversion_account_id}-${row.date}`

                const viewsToProfile = views > 0 ? pv / views : 0
                const viewsToClicks = views > 0 ? lc / views : 0
                const profileToClicks = pv > 0 ? lc / pv : 0
                const clicksToSubs = lc > 0 ? subs / lc : 0
                const subsToViews = views > 0 ? subs / views : 0

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
                          if (e.key === 'Enter') saveCell(row.conversion_account_id!, row.date, field, parseInt(editValue) || 0)
                          if (e.key === 'Escape') setEditingCell(null)
                        }}
                        onBlur={() => saveCell(row.conversion_account_id!, row.date, field, parseInt(editValue) || 0)}
                        autoFocus
                        className={`w-16 border rounded px-2 py-0.5 text-[13px] text-right outline-none tabular-nums ${
                          isLight
                            ? 'bg-white border-black/[0.15] text-black/80 focus:border-black/30'
                            : 'bg-white/[0.06] border-white/[0.15] text-white/80 focus:border-white/30'
                        }`}
                      />
                    )
                  }
                  return (
                    <button
                      onClick={() => { setEditingCell(cellKey); setEditValue(String(value)) }}
                      className={`text-[13px] tabular-nums cursor-pointer transition-all duration-150 rounded px-1 -mx-1 ${
                        highlight
                          ? isLight
                            ? 'text-red-600 font-medium hover:bg-red-500/10'
                            : 'text-red-400 font-medium hover:bg-red-500/10'
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
                      isBelowTarget
                        ? isLight ? 'bg-red-500/[0.04] hover:bg-red-500/[0.08]' : 'bg-red-500/[0.06] hover:bg-red-500/[0.1]'
                        : isLight ? 'hover:bg-black/[0.02]' : 'hover:bg-white/[0.02]'
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
