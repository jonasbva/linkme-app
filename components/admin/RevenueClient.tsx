'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ─── Types ───────────────────────────────────────────────────────────
interface CreatorRevenue {
  infloww_id: string
  name: string
  userName: string
  supabase_creator_id: string | null
  avatar_url: string | null
  display_name: string

  totalRevenue: number
  totalGross: number
  subscriptionRevenue: number
  recurringSubRevenue: number
  newSubRevenue: number
  messageRevenue: number
  tipRevenue: number
  otherRevenue: number

  totalPurchases: number
  newSubs: number
  recurringSubs: number
  openChats: number
  sellingChats: number

  textingRatio: number
  avgFanSpend: number

  subAvg14d: number
  totalSubs14d: number

  linkClicks: number
  conversionRate: number

  expectation: {
    daily_revenue_target: number
    revenue_per_fan_baseline: number
    check_frequency: number
    free_subs: boolean
  } | null

  generatedRevenuePct: number | null
  emergency_since: string | null
  emergency_notes: string

  hourlyRevenue?: Record<number, number>
  hourlySubs?: Record<number, number>
}

interface RevenueData {
  creators: CreatorRevenue[]
  totals: {
    totalTurnover: number
    totalNewSubs: number
    totalPurchases: number
    subscriptionRevenue: number
    messageRevenue: number
    tipRevenue: number
  }
  hourlyChart: { hour: number; label: string; revenue: number; subs: number }[] | null
  period: { days: number; startDate: string; endDate: string }
}

interface ExpectationCreator {
  id: string
  display_name: string
  slug: string
  avatar_url: string | null
  expectation: {
    daily_revenue_target: number
    revenue_per_fan_baseline: number
    check_frequency: number
    free_subs: boolean
  } | null
}

interface InflowwConfig {
  id: string
  api_key: string
  api_key_masked?: string
  agency_oid: string
  refund_threshold_dollars: number
  api_key_updated_at: string
}

type SubTab = 'overview' | 'tracking' | 'expectations' | 'settings'
type SortDir = 'asc' | 'desc'

// ─── Helpers ─────────────────────────────────────────────────────────
const fmt = (n: number) =>
  '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

const fmtDec = (n: number) =>
  '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const pctColor = (pct: number | null) => {
  if (pct === null) return ''
  if (pct >= 10) return 'bg-green-900/40 text-green-300'
  if (pct >= 0) return 'bg-green-900/20 text-green-400'
  if (pct >= -20) return 'bg-red-900/20 text-red-300'
  return 'bg-red-900/40 text-red-400'
}

// ─── Mini SVG Line Chart ─────────────────────────────────────────────
function Sparkline({ data, color = '#22d3ee', width = 120, height = 40 }: {
  data: number[]
  color?: string
  width?: number
  height?: number
}) {
  if (!data.length) return null
  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const range = max - min || 1
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width
      const y = height - ((v - min) / range) * (height - 4) - 2
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ─── Donut Chart ─────────────────────────────────────────────────────
function DonutChart({ segments }: {
  segments: { label: string; value: number; color: string }[]
}) {
  const total = segments.reduce((s, seg) => s + seg.value, 0)
  if (total === 0) return <div className="text-gray-500 text-sm">No data</div>

  const size = 160
  const strokeWidth = 28
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  let offset = 0

  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size} className="transform -rotate-90">
        {segments.map((seg, i) => {
          const pct = seg.value / total
          const dashArray = `${pct * circumference} ${circumference}`
          const el = (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={dashArray}
              strokeDashoffset={-offset}
              strokeLinecap="round"
            />
          )
          offset += pct * circumference
          return el
        })}
      </svg>
      <div className="flex flex-col gap-2">
        {segments.map((seg, i) => (
          <div
            key={i}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{ backgroundColor: seg.color + '20', borderLeft: `3px solid ${seg.color}` }}
          >
            <div>
              <div className="text-white font-semibold text-sm">{fmt(seg.value)}</div>
              <div className="text-gray-400 text-xs">{seg.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Line Chart (for hourly data) ────────────────────────────────────
function LineChart({ data, dataKey, label, formatY }: {
  data: { label: string; [key: string]: unknown }[]
  dataKey: string
  label: string
  formatY?: (v: number) => string
}) {
  if (!data.length) return <div className="text-gray-500 text-sm">No data</div>

  const values = data.map((d) => (d[dataKey] as number) || 0)
  const max = Math.max(...values, 1)
  const w = 500
  const h = 140
  const padX = 50
  const padY = 20
  const chartW = w - padX
  const chartH = h - padY * 2

  const points = values
    .map((v, i) => {
      const x = padX + (i / (values.length - 1)) * chartW
      const y = padY + chartH - (v / max) * chartH
      return `${x},${y}`
    })
    .join(' ')

  // Y-axis labels
  const ySteps = 4
  const yLabels = Array.from({ length: ySteps + 1 }, (_, i) => {
    const val = (max / ySteps) * i
    return formatY ? formatY(val) : String(Math.round(val))
  })

  // X-axis labels (show every 3 hours)
  const xLabels = data.filter((_, i) => i % 3 === 0)

  return (
    <div>
      <div className="text-gray-400 text-xs mb-2">{label}</div>
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
        {/* Grid lines */}
        {yLabels.map((lbl, i) => {
          const y = padY + chartH - (i / ySteps) * chartH
          return (
            <g key={i}>
              <line x1={padX} y1={y} x2={w} y2={y} stroke="#374151" strokeWidth="1" strokeDasharray="4" />
              <text x={padX - 8} y={y + 4} fill="#9ca3af" fontSize="10" textAnchor="end">
                {lbl}
              </text>
            </g>
          )
        })}
        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* X labels */}
        {xLabels.map((d, i) => {
          const idx = data.indexOf(d)
          const x = padX + (idx / (data.length - 1)) * chartW
          return (
            <text key={i} x={x} y={h - 2} fill="#9ca3af" fontSize="10" textAnchor="middle">
              {d.label as string}
            </text>
          )
        })}
      </svg>
    </div>
  )
}

// ─── Sort Header ─────────────────────────────────────────────────────
function SortHeader({ label, field, sortField, sortDir, onSort, tooltip }: {
  label: string
  field: string
  sortField: string
  sortDir: SortDir
  onSort: (field: string) => void
  tooltip?: string
}) {
  const active = sortField === field
  return (
    <th
      className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white select-none whitespace-nowrap"
      onClick={() => onSort(field)}
      title={tooltip}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {tooltip && <span className="text-gray-600 text-[10px]">&#9432;</span>}
        <span className="text-[10px]">
          {active ? (sortDir === 'asc' ? '▲' : '▼') : '⇅'}
        </span>
      </span>
    </th>
  )
}

// ═════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════
export default function RevenueClient() {
  const [activeTab, setActiveTab] = useState<SubTab>('overview')
  const [days, setDays] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<RevenueData | null>(null)

  // Expectations state
  const [expCreators, setExpCreators] = useState<ExpectationCreator[]>([])
  const [expLoading, setExpLoading] = useState(false)
  const [expSaving, setExpSaving] = useState<string | null>(null)

  // Settings state
  const [config, setConfig] = useState<InflowwConfig | null>(null)
  const [configLoading, setConfigLoading] = useState(false)
  const [configForm, setConfigForm] = useState({
    api_key: '',
    agency_oid: '',
    refund_threshold_dollars: 20,
  })
  const [configSaving, setConfigSaving] = useState(false)
  const [configMsg, setConfigMsg] = useState('')

  // Sorting for detailed comparison table
  const [sortField, setSortField] = useState('totalRevenue')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  // Sorting for tracking table
  const [trackSortField, setTrackSortField] = useState('generatedRevenuePct')
  const [trackSortDir, setTrackSortDir] = useState<SortDir>('asc')

  // ─── Data Fetching ───────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/revenue/data?days=${days}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to fetch data')
      setData(json)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [days])

  const fetchExpectations = useCallback(async () => {
    setExpLoading(true)
    try {
      const res = await fetch('/api/admin/revenue/expectations')
      const json = await res.json()
      if (res.ok) setExpCreators(json.creators || [])
    } catch { /* ignore */ }
    finally { setExpLoading(false) }
  }, [])

  const fetchConfig = useCallback(async () => {
    setConfigLoading(true)
    try {
      const res = await fetch('/api/admin/revenue/config')
      const json = await res.json()
      if (res.ok && json.config) {
        setConfig(json.config)
        setConfigForm({
          api_key: '',
          agency_oid: json.config.agency_oid || '',
          refund_threshold_dollars: json.config.refund_threshold_dollars || 20,
        })
      }
    } catch { /* ignore */ }
    finally { setConfigLoading(false) }
  }, [])

  useEffect(() => {
    if (activeTab === 'overview' || activeTab === 'tracking') fetchData()
  }, [activeTab, fetchData])

  useEffect(() => {
    if (activeTab === 'expectations') fetchExpectations()
  }, [activeTab, fetchExpectations])

  useEffect(() => {
    if (activeTab === 'settings') fetchConfig()
  }, [activeTab, fetchConfig])

  // ─── Sort handler ────────────────────────────────────────────────
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  const handleTrackSort = (field: string) => {
    if (trackSortField === field) {
      setTrackSortDir(trackSortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setTrackSortField(field)
      setTrackSortDir('asc')
    }
  }

  const sortedCreators = useMemo(() => {
    if (!data?.creators) return []
    return [...data.creators].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortField] as number || 0
      const bVal = (b as Record<string, unknown>)[sortField] as number || 0
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal
    })
  }, [data, sortField, sortDir])

  // ─── Expectations save handler ───────────────────────────────────
  const saveExpectation = async (
    creatorId: string,
    field: string,
    value: number | boolean
  ) => {
    setExpSaving(creatorId)
    const creator = expCreators.find((c) => c.id === creatorId)
    const existing = creator?.expectation || {
      daily_revenue_target: 0,
      revenue_per_fan_baseline: 0,
      check_frequency: 1,
      free_subs: false,
    }

    try {
      const res = await fetch('/api/admin/revenue/expectations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creator_id: creatorId,
          ...existing,
          [field]: value,
        }),
      })
      if (res.ok) {
        // Update local state
        setExpCreators((prev) =>
          prev.map((c) =>
            c.id === creatorId
              ? { ...c, expectation: { ...existing, [field]: value } }
              : c
          )
        )
      }
    } catch { /* ignore */ }
    finally { setExpSaving(null) }
  }

  // ─── Emergency save handler ──────────────────────────────────────
  const saveEmergency = async (
    creatorId: string,
    emergencySince: string | null,
    notes: string
  ) => {
    try {
      await fetch('/api/admin/revenue/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creator_id: creatorId,
          emergency_since: emergencySince,
          notes,
        }),
      })
    } catch { /* ignore */ }
  }

  // ─── Config save handler ─────────────────────────────────────────
  const saveConfig = async () => {
    setConfigSaving(true)
    setConfigMsg('')
    try {
      const payload: Record<string, unknown> = {
        agency_oid: configForm.agency_oid,
        refund_threshold_dollars: configForm.refund_threshold_dollars,
      }
      if (configForm.api_key) payload.api_key = configForm.api_key

      const res = await fetch('/api/admin/revenue/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (res.ok) {
        setConfig(json.config)
        setConfigForm((prev) => ({ ...prev, api_key: '' }))
        setConfigMsg('Settings saved successfully!')
      } else {
        setConfigMsg(`Error: ${json.error}`)
      }
    } catch {
      setConfigMsg('Failed to save settings')
    } finally {
      setConfigSaving(false)
    }
  }

  // ─── Export handler ──────────────────────────────────────────────
  const exportCSV = () => {
    if (!data?.creators) return
    const headers = [
      'Creator', 'Total Revenue', 'New Subs', 'New Subs Revenue', 'Rec Subs Revenue',
      'Tips Revenue', 'Message Revenue', 'Texting Ratio', 'Open Chats', 'Selling Chats',
      'Avg Fan Spend', 'Link Clicks', 'Conversion Rate',
    ]
    const rows = sortedCreators.map((c) => [
      c.display_name, c.totalRevenue, c.newSubs, c.newSubRevenue, c.recurringSubRevenue,
      c.tipRevenue, c.messageRevenue, c.textingRatio, c.openChats, c.sellingChats,
      c.avgFanSpend, c.linkClicks, c.conversionRate,
    ])

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `revenue_report_${days}d_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ─── Tracking tab helpers ────────────────────────────────────────
  const getTrackingCreators = (freq: number) => {
    if (!data?.creators) return []
    return [...data.creators]
      .filter((c) => c.expectation?.check_frequency === freq)
      .sort((a, b) => {
        const aVal = (a as Record<string, unknown>)[trackSortField] as number || 0
        const bVal = (b as Record<string, unknown>)[trackSortField] as number || 0
        return trackSortDir === 'asc' ? aVal - bVal : bVal - aVal
      })
  }

  // ═══════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════
  const tabStyle = (tab: SubTab) =>
    `px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
      activeTab === tab
        ? 'bg-gray-800 text-white border-b-2 border-cyan-400'
        : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
    }`

  return (
    <div className="min-h-screen bg-[#0f1729] text-white">
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Revenue</h1>
          {(activeTab === 'overview' || activeTab === 'tracking') && (
            <div className="flex items-center gap-3">
              <select
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:border-cyan-400 outline-none"
              >
                <option value={1}>Today</option>
                <option value={3}>Last 3 Days</option>
                <option value={7}>Last 7 Days</option>
                <option value={14}>Last 14 Days</option>
                <option value={30}>Last 30 Days</option>
              </select>
              <button
                onClick={fetchData}
                disabled={loading}
                className="p-2 rounded-lg bg-gray-800 border border-gray-700 hover:border-cyan-400 transition-colors disabled:opacity-50"
                title="Refresh"
              >
                <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Sub-tabs */}
        <div className="flex gap-1 border-b border-gray-800 mb-6">
          <button className={tabStyle('overview')} onClick={() => setActiveTab('overview')}>
            Overview
          </button>
          <button className={tabStyle('tracking')} onClick={() => setActiveTab('tracking')}>
            Revenue Tracking
          </button>
          <button className={tabStyle('expectations')} onClick={() => setActiveTab('expectations')}>
            Expectations
          </button>
          <button className={tabStyle('settings')} onClick={() => setActiveTab('settings')}>
            Settings
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (activeTab === 'overview' || activeTab === 'tracking') && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-cyan-400"></div>
            <span className="ml-4 text-gray-400">Fetching data from Infloww...</span>
          </div>
        )}

        {/* ─── OVERVIEW TAB ──────────────────────────────────────── */}
        {activeTab === 'overview' && !loading && data && (
          <div>
            {/* Summary Cards + Donut */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
              {/* Left: Stats cards */}
              <div className="grid grid-cols-2 gap-4 lg:col-span-1">
                {/* Total Turnover */}
                <div className="bg-gray-800/60 rounded-xl p-4 col-span-2">
                  {data.hourlyChart && (
                    <Sparkline
                      data={data.hourlyChart.map((h) => h.revenue)}
                      color="#22d3ee"
                      width={200}
                      height={40}
                    />
                  )}
                  <div className="mt-3">
                    <div className="text-3xl font-bold">{fmt(data.totals.totalTurnover)}</div>
                    <div className="text-gray-400 text-sm">Total Turnover</div>
                  </div>
                </div>
                {/* Total New Subs */}
                <div className="bg-gray-800/60 rounded-xl p-4">
                  <div className="text-2xl font-bold">{data.totals.totalNewSubs}</div>
                  <div className="text-gray-400 text-sm">Total New Subs</div>
                </div>
                {/* Total Purchases */}
                <div className="bg-gray-800/60 rounded-xl p-4">
                  <div className="text-2xl font-bold">{data.totals.totalPurchases}</div>
                  <div className="text-gray-400 text-sm">Total Purchases</div>
                </div>
              </div>

              {/* Right: Revenue breakdown donut */}
              <div className="bg-gray-800/60 rounded-xl p-6 lg:col-span-2 flex items-center justify-center">
                <DonutChart
                  segments={[
                    { label: 'Subscriptions', value: data.totals.subscriptionRevenue, color: '#f43f5e' },
                    { label: 'Messages', value: data.totals.messageRevenue, color: '#a855f7' },
                    { label: 'Tips', value: data.totals.tipRevenue, color: '#14b8a6' },
                  ]}
                />
              </div>
            </div>

            {/* Charts Row */}
            {data.hourlyChart && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
                <div className="bg-gray-800/60 rounded-xl p-5">
                  <div className="text-lg font-semibold mb-1">{data.totals.totalNewSubs}</div>
                  <div className="text-gray-400 text-sm mb-4">Subscriptions</div>
                  <LineChart
                    data={data.hourlyChart}
                    dataKey="subs"
                    label=""
                  />
                </div>
                <div className="bg-gray-800/60 rounded-xl p-5">
                  <div className="text-lg font-semibold mb-1">{fmt(data.totals.totalTurnover)}</div>
                  <div className="text-gray-400 text-sm mb-4">Revenue</div>
                  <LineChart
                    data={data.hourlyChart}
                    dataKey="revenue"
                    label=""
                    formatY={(v) => `$${Math.round(v).toLocaleString()}`}
                  />
                </div>
              </div>
            )}

            {/* Detailed Comparison Table */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Detailed Comparison</h2>
              <button
                onClick={exportCSV}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export
              </button>
            </div>

            <div className="bg-gray-800/60 rounded-xl overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <SortHeader label="Creator" field="display_name" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                    <SortHeader label="Total Revenue" field="totalRevenue" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                    <SortHeader label="New Subs" field="newSubs" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                    <SortHeader label="New Subs Revenue" field="newSubRevenue" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                    <SortHeader label="Rec. Subs Revenue" field="recurringSubRevenue" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                    <SortHeader label="Tips Revenue" field="tipRevenue" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                    <SortHeader label="Message Revenue" field="messageRevenue" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                    <SortHeader label="Texting Ratio" field="textingRatio" sortField={sortField} sortDir={sortDir} onSort={handleSort} tooltip="Message Revenue / Total Revenue" />
                    <SortHeader label="Open Chats" field="openChats" sortField={sortField} sortDir={sortDir} onSort={handleSort} tooltip="Unique fans with message transactions" />
                    <SortHeader label="Selling Chats" field="sellingChats" sortField={sortField} sortDir={sortDir} onSort={handleSort} tooltip="Fans who purchased via chat" />
                    <SortHeader label="Avg Fan Spend" field="avgFanSpend" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                    <SortHeader label="Link Clicks" field="linkClicks" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                    <SortHeader label="Conversion Rate" field="conversionRate" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                  </tr>
                </thead>
                <tbody>
                  {sortedCreators.map((c) => (
                    <tr key={c.infloww_id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          {c.avatar_url ? (
                            <img src={c.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-xs">
                              {c.display_name.charAt(0)}
                            </div>
                          )}
                          <span className="font-medium">{c.display_name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 font-semibold">{fmt(c.totalRevenue)}</td>
                      <td className="px-3 py-3">{c.newSubs}</td>
                      <td className="px-3 py-3">{fmt(c.newSubRevenue)}</td>
                      <td className="px-3 py-3">{fmt(c.recurringSubRevenue)}</td>
                      <td className="px-3 py-3">{fmt(c.tipRevenue)}</td>
                      <td className="px-3 py-3">{fmt(c.messageRevenue)}</td>
                      <td className="px-3 py-3">{c.textingRatio.toFixed(2)}</td>
                      <td className="px-3 py-3">{c.openChats}</td>
                      <td className="px-3 py-3">{c.sellingChats}</td>
                      <td className="px-3 py-3">{fmtDec(c.avgFanSpend)}</td>
                      <td className="px-3 py-3">{c.linkClicks}</td>
                      <td className="px-3 py-3">{c.conversionRate.toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {sortedCreators.length === 0 && (
                <div className="text-center text-gray-500 py-10">
                  No creator data available. Make sure your Infloww API key is configured in Settings.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── TRACKING TAB ──────────────────────────────────────── */}
        {activeTab === 'tracking' && !loading && data && (
          <div>
            {[1, 3, 7].map((freq) => {
              const creators = getTrackingCreators(freq)
              if (creators.length === 0) return null

              return (
                <div key={freq} className="mb-10">
                  <div className="flex items-center gap-3 mb-4">
                    <h2 className="text-lg font-bold text-cyan-400">
                      Daily Report ({freq} Day{freq > 1 ? 's' : ''})
                    </h2>
                    <span className="text-gray-500 text-sm">{creators.length} creators</span>
                  </div>

                  <div className="bg-gray-800/60 rounded-xl overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase">OnlyFans Name</th>
                          <SortHeader label="Expectation Revenue" field="expectation.daily_revenue_target" sortField={trackSortField} sortDir={trackSortDir} onSort={handleTrackSort} />
                          <SortHeader label="Revenue" field="totalRevenue" sortField={trackSortField} sortDir={trackSortDir} onSort={handleTrackSort} />
                          <SortHeader label="Generated Revenue (%)" field="generatedRevenuePct" sortField={trackSortField} sortDir={trackSortDir} onSort={handleTrackSort} />
                          <SortHeader label={`14d Sub Avg`} field="subAvg14d" sortField={trackSortField} sortDir={trackSortDir} onSort={handleTrackSort} />
                          <SortHeader label={`${freq}d Subs`} field="newSubs" sortField={trackSortField} sortDir={trackSortDir} onSort={handleTrackSort} />
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase">Subs Avg (%)</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase">Emergency Since</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {creators.map((c) => {
                          const expected = c.expectation
                            ? c.expectation.daily_revenue_target * freq
                            : null
                          const subsAvgPct =
                            c.subAvg14d > 0
                              ? Math.round(((c.newSubs / (c.subAvg14d * freq)) - 1) * 1000) / 10
                              : null

                          return (
                            <tr key={c.infloww_id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                              <td className="px-3 py-3">
                                <div className="flex items-center gap-2">
                                  {c.avatar_url ? (
                                    <img src={c.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover" />
                                  ) : (
                                    <div className="w-7 h-7 rounded-full bg-gray-600 flex items-center justify-center text-xs">
                                      {c.display_name.charAt(0)}
                                    </div>
                                  )}
                                  <span className="font-medium">{c.display_name}</span>
                                </div>
                              </td>
                              <td className="px-3 py-3">{expected !== null ? fmt(expected) : '—'}</td>
                              <td className="px-3 py-3 font-semibold">{fmt(c.totalRevenue)}</td>
                              <td className="px-3 py-3">
                                {c.generatedRevenuePct !== null ? (
                                  <span
                                    className={`px-2 py-1 rounded text-xs font-medium ${pctColor(c.generatedRevenuePct)}`}
                                  >
                                    {c.generatedRevenuePct > 0 ? '+' : ''}
                                    {c.generatedRevenuePct.toFixed(1)}%
                                  </span>
                                ) : (
                                  '—'
                                )}
                              </td>
                              <td className="px-3 py-3">{c.subAvg14d}</td>
                              <td className="px-3 py-3">{c.newSubs}</td>
                              <td className="px-3 py-3">
                                {subsAvgPct !== null ? (
                                  <span
                                    className={`px-2 py-1 rounded text-xs font-medium ${pctColor(subsAvgPct)}`}
                                  >
                                    {subsAvgPct > 0 ? '+' : ''}
                                    {subsAvgPct.toFixed(1)}%
                                  </span>
                                ) : (
                                  '—'
                                )}
                              </td>
                              <td className="px-3 py-3">
                                <EmergencyDropdown
                                  creatorId={c.supabase_creator_id}
                                  currentDate={c.emergency_since}
                                  onSave={(date) =>
                                    c.supabase_creator_id &&
                                    saveEmergency(c.supabase_creator_id, date, c.emergency_notes)
                                  }
                                />
                              </td>
                              <td className="px-3 py-3">
                                <NotesInput
                                  creatorId={c.supabase_creator_id}
                                  currentNotes={c.emergency_notes}
                                  emergencySince={c.emergency_since}
                                  onSave={(notes) =>
                                    c.supabase_creator_id &&
                                    saveEmergency(c.supabase_creator_id, c.emergency_since, notes)
                                  }
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
            })}

            {/* Show creators without expectations */}
            {data.creators.filter((c) => !c.expectation).length > 0 && (
              <div className="mt-6 bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4">
                <p className="text-yellow-300 text-sm font-medium mb-1">
                  Creators without expectations set:
                </p>
                <p className="text-yellow-200/70 text-sm">
                  {data.creators
                    .filter((c) => !c.expectation)
                    .map((c) => c.display_name)
                    .join(', ')}
                </p>
                <p className="text-yellow-200/50 text-xs mt-2">
                  Go to the Expectations tab to set daily revenue targets and check frequencies for these creators.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ─── EXPECTATIONS TAB ──────────────────────────────────── */}
        {activeTab === 'expectations' && (
          <div>
            <p className="text-gray-400 text-sm mb-6">
              Set daily revenue targets and check frequencies for each creator. The tracking tab uses these values to calculate performance.
            </p>

            {expLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-cyan-400"></div>
              </div>
            ) : (
              <div className="bg-gray-800/60 rounded-xl overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Creator</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Daily Revenue Target ($)</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Revenue / Fan (14d Baseline $)</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Check Frequency</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Free Subs?</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expCreators.map((c) => {
                      const exp = c.expectation || {
                        daily_revenue_target: 0,
                        revenue_per_fan_baseline: 0,
                        check_frequency: 1,
                        free_subs: false,
                      }
                      const saving = expSaving === c.id

                      return (
                        <tr key={c.id} className={`border-b border-gray-700/50 ${saving ? 'opacity-60' : ''}`}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {c.avatar_url ? (
                                <img src={c.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-xs">
                                  {c.display_name.charAt(0)}
                                </div>
                              )}
                              <span className="font-medium">{c.display_name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              defaultValue={exp.daily_revenue_target}
                              onBlur={(e) =>
                                saveExpectation(c.id, 'daily_revenue_target', Number(e.target.value))
                              }
                              className="w-28 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white text-sm focus:border-cyan-400 outline-none"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              defaultValue={exp.revenue_per_fan_baseline}
                              onBlur={(e) =>
                                saveExpectation(c.id, 'revenue_per_fan_baseline', Number(e.target.value))
                              }
                              className="w-28 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white text-sm focus:border-cyan-400 outline-none"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <select
                              defaultValue={exp.check_frequency}
                              onChange={(e) =>
                                saveExpectation(c.id, 'check_frequency', Number(e.target.value))
                              }
                              className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white text-sm focus:border-cyan-400 outline-none"
                            >
                              <option value={1}>Every Day</option>
                              <option value={3}>Every 3 Days</option>
                              <option value={7}>Every 7 Days</option>
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              defaultChecked={exp.free_subs}
                              onChange={(e) =>
                                saveExpectation(c.id, 'free_subs', e.target.checked)
                              }
                              className="w-4 h-4 rounded bg-gray-900 border-gray-700 text-cyan-400 focus:ring-cyan-400"
                            />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                {expCreators.length === 0 && (
                  <div className="text-center text-gray-500 py-10">
                    No active creators found.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ─── SETTINGS TAB ──────────────────────────────────────── */}
        {activeTab === 'settings' && (
          <div className="max-w-xl">
            <h2 className="text-lg font-bold mb-1">Infloww API Configuration</h2>
            <p className="text-gray-400 text-sm mb-6">
              The API key expires every 30 days. Update it here when you generate a new one.
            </p>

            {configLoading ? (
              <div className="flex items-center justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-cyan-400"></div>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Current key status */}
                {config?.api_key_masked && (
                  <div className="bg-gray-800/60 rounded-lg p-4">
                    <div className="text-xs text-gray-500 mb-1">Current API Key</div>
                    <div className="text-sm font-mono text-gray-300">{config.api_key_masked}</div>
                    {config.api_key_updated_at && (
                      <div className="text-xs text-gray-500 mt-1">
                        Last updated: {new Date(config.api_key_updated_at).toLocaleDateString()}
                        {(() => {
                          const daysSince = Math.floor(
                            (Date.now() - new Date(config.api_key_updated_at).getTime()) / 86400000
                          )
                          if (daysSince >= 25) {
                            return (
                              <span className="text-red-400 ml-2 font-medium">
                                ({daysSince} days ago — expires soon!)
                              </span>
                            )
                          }
                          if (daysSince >= 20) {
                            return (
                              <span className="text-yellow-400 ml-2">
                                ({daysSince} days ago)
                              </span>
                            )
                          }
                          return <span className="text-gray-500 ml-2">({daysSince} days ago)</span>
                        })()}
                      </div>
                    )}
                  </div>
                )}

                {/* New API Key */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    New API Key
                  </label>
                  <input
                    type="password"
                    value={configForm.api_key}
                    onChange={(e) => setConfigForm((p) => ({ ...p, api_key: e.target.value }))}
                    placeholder="Paste new API key (leave blank to keep current)"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-cyan-400 outline-none placeholder:text-gray-600"
                  />
                </div>

                {/* Agency OID */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Agency OID
                  </label>
                  <input
                    type="text"
                    value={configForm.agency_oid}
                    onChange={(e) => setConfigForm((p) => ({ ...p, agency_oid: e.target.value }))}
                    placeholder="Your agency OID from Infloww"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-cyan-400 outline-none placeholder:text-gray-600"
                  />
                </div>

                {/* Refund Threshold */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Refund Alert Threshold ($)
                  </label>
                  <input
                    type="number"
                    value={configForm.refund_threshold_dollars}
                    onChange={(e) =>
                      setConfigForm((p) => ({
                        ...p,
                        refund_threshold_dollars: Number(e.target.value),
                      }))
                    }
                    className="w-32 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-cyan-400 outline-none"
                  />
                  <p className="text-gray-500 text-xs mt-1">
                    Minimum refund amount to trigger alerts (used by chargeback tool)
                  </p>
                </div>

                {/* Save */}
                <button
                  onClick={saveConfig}
                  disabled={configSaving}
                  className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {configSaving ? 'Saving...' : 'Save Settings'}
                </button>

                {configMsg && (
                  <p
                    className={`text-sm ${
                      configMsg.startsWith('Error') ? 'text-red-400' : 'text-green-400'
                    }`}
                  >
                    {configMsg}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────

function EmergencyDropdown({
  creatorId,
  currentDate,
  onSave,
}: {
  creatorId: string | null
  currentDate: string | null
  onSave: (date: string | null) => void
}) {
  const [value, setValue] = useState(currentDate || '')

  if (!creatorId) return <span className="text-gray-600">—</span>

  return (
    <div className="flex items-center gap-1">
      <input
        type="date"
        value={value}
        onChange={(e) => {
          setValue(e.target.value)
          onSave(e.target.value || null)
        }}
        className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white text-xs focus:border-cyan-400 outline-none w-32"
      />
      {value && (
        <button
          onClick={() => {
            setValue('')
            onSave(null)
          }}
          className="text-gray-500 hover:text-red-400 text-xs"
          title="Clear emergency"
        >
          ✕
        </button>
      )}
    </div>
  )
}

function NotesInput({
  creatorId,
  currentNotes,
  emergencySince,
  onSave,
}: {
  creatorId: string | null
  currentNotes: string
  emergencySince: string | null
  onSave: (notes: string) => void
}) {
  const [value, setValue] = useState(currentNotes)

  if (!creatorId) return <span className="text-gray-600">—</span>

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => onSave(value)}
      placeholder="Add notes..."
      className="w-40 bg-transparent border-b border-gray-700 text-white text-xs focus:border-cyan-400 outline-none py-1 placeholder:text-gray-600"
    />
  )
}
