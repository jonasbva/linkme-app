'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useTheme } from './ThemeProvider'
import DatePicker from './DateRangePicker'

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
  fetching_enabled: boolean
  api_key_updated_at: string
}

interface Toast {
  id: number
  type: 'success' | 'error' | 'info'
  message: string
}

type SubTab = 'overview' | 'tracking' | 'expectations' | 'settings'
type SortDir = 'asc' | 'desc'

// ─── Helpers ─────────────────────────────────────────────────────────
// A range is "live" if its end is within 2 minutes of "now" — must match
// the cache route's LIVE_WINDOW_MS so the key family we ask for matches
// the one the backend computes.
const LIVE_WINDOW_MS = 2 * 60 * 1000

const fmt = (n: number) =>
  '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

const fmtDec = (n: number) =>
  '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const pctColor = (pct: number | null, isLight: boolean) => {
  if (pct === null) return ''
  if (pct >= 10) return isLight ? 'bg-green-100 text-green-800' : 'bg-green-900/40 text-green-300'
  if (pct >= 0) return isLight ? 'bg-green-50 text-green-700' : 'bg-green-900/20 text-green-400'
  if (pct >= -20) return isLight ? 'bg-red-50 text-red-600' : 'bg-red-900/20 text-red-300'
  return isLight ? 'bg-red-100 text-red-800' : 'bg-red-900/40 text-red-400'
}

// ─── Normalize creator data (fill missing fields from cache) ────────
function normalizeCreator(c: Partial<CreatorRevenue>): CreatorRevenue {
  return {
    infloww_id: c.infloww_id || '',
    name: c.name || '',
    userName: c.userName || '',
    supabase_creator_id: c.supabase_creator_id ?? null,
    avatar_url: c.avatar_url ?? null,
    display_name: c.display_name || c.name || 'Unknown',
    totalRevenue: c.totalRevenue || 0,
    totalGross: c.totalGross || 0,
    subscriptionRevenue: c.subscriptionRevenue || 0,
    recurringSubRevenue: c.recurringSubRevenue || 0,
    newSubRevenue: c.newSubRevenue || 0,
    messageRevenue: c.messageRevenue || 0,
    tipRevenue: c.tipRevenue || 0,
    otherRevenue: c.otherRevenue || 0,
    totalPurchases: c.totalPurchases || 0,
    newSubs: c.newSubs || 0,
    recurringSubs: c.recurringSubs || 0,
    openChats: c.openChats || 0,
    sellingChats: c.sellingChats || 0,
    textingRatio: c.textingRatio || 0,
    avgFanSpend: c.avgFanSpend || 0,
    subAvg14d: c.subAvg14d || 0,
    totalSubs14d: c.totalSubs14d || 0,
    linkClicks: c.linkClicks || 0,
    conversionRate: c.conversionRate || 0,
    expectation: c.expectation ?? null,
    generatedRevenuePct: c.generatedRevenuePct ?? null,
    emergency_since: c.emergency_since ?? null,
    emergency_notes: c.emergency_notes || '',
    hourlyRevenue: c.hourlyRevenue,
    hourlySubs: c.hourlySubs,
  }
}

// ─── Toast Notification Component ───────────────────────────────────
function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl backdrop-blur-xl shadow-lg transition-all animate-[slideIn_0.3s_ease-out] ${
            t.type === 'error'
              ? 'bg-red-500/90 text-white'
              : t.type === 'success'
              ? 'bg-emerald-500/90 text-white'
              : 'bg-white/10 backdrop-blur-xl text-white/90 border border-white/10'
          }`}
        >
          {t.type === 'error' && (
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          )}
          {t.type === 'success' && (
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
          <span className="text-[13px] font-medium">{t.message}</span>
          <button onClick={() => onDismiss(t.id)} className="ml-2 opacity-60 hover:opacity-100">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}

// ─── Mini SVG Sparkline ──────────────────────────────────────────────
function Sparkline({ data, color = '#3b82f6', width = 120, height = 40 }: {
  data: number[]; color?: string; width?: number; height?: number
}) {
  if (!data.length) return null
  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const range = max - min || 1
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * (height - 4) - 2}`)
    .join(' ')
  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ─── Donut Chart ─────────────────────────────────────────────────────
function DonutChart({ segments, isLight }: {
  segments: { label: string; value: number; color: string }[]
  isLight: boolean
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)
  const total = segments.reduce((s, seg) => s + seg.value, 0)
  if (total === 0) return <div className={`text-sm ${isLight ? 'text-black/40' : 'text-white/40'}`}>No data</div>
  const size = 180
  const strokeWidth = 28
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  let offset = 0

  return (
    <div className="flex items-center gap-6">
      <div className="relative">
        <svg width={size} height={size} className="transform -rotate-90">
          {segments.filter(s => s.value > 0).map((seg, i) => {
            const pct = seg.value / total
            const dashArray = `${pct * circumference} ${circumference}`
            const isHovered = hoveredIdx === i
            const el = (
              <circle key={i} cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={seg.color}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={dashArray} strokeDashoffset={-offset}
                className="transition-all duration-150 cursor-pointer"
                style={{ opacity: hoveredIdx !== null && !isHovered ? 0.4 : 1 }}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)} />
            )
            offset += pct * circumference
            return el
          })}
        </svg>
        {/* Center label on hover */}
        {hoveredIdx !== null && segments[hoveredIdx] && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className={`text-lg font-bold ${isLight ? 'text-black/90' : 'text-white'}`}>
              {(segments[hoveredIdx].value / total * 100).toFixed(1)}%
            </div>
            <div className={`text-[11px] ${isLight ? 'text-black/40' : 'text-white/50'}`}>
              {segments[hoveredIdx].label}
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2">
        {segments.map((seg, i) => (
          <div key={i}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition-opacity duration-150"
            style={{
              backgroundColor: seg.color + '15',
              borderLeft: `3px solid ${seg.color}`,
              opacity: hoveredIdx !== null && hoveredIdx !== i ? 0.4 : 1,
            }}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}>
            <div>
              <div className={`font-semibold text-sm ${isLight ? 'text-black/80' : 'text-white'}`}>{fmt(seg.value)}</div>
              <div className={`text-xs ${isLight ? 'text-black/40' : 'text-white/50'}`}>{seg.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Line Chart ──────────────────────────────────────────────────────
function LineChart({ data, dataKey, label, isLight, formatY, color = '#3b82f6' }: {
  data: { label: string; [key: string]: unknown }[]
  dataKey: string; label: string; isLight: boolean; color?: string
  formatY?: (v: number) => string
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  if (!data.length) return null
  const values = data.map((d) => (d[dataKey] as number) || 0)
  const max = Math.max(...values, 1)
  const w = 500; const h = 160; const padX = 50; const padY = 20
  const chartW = w - padX; const chartH = h - padY * 2 - 20
  const pointCoords = values.map((v, i) => ({
    x: padX + (i / (values.length - 1)) * chartW,
    y: padY + chartH - (v / max) * chartH,
    value: v,
  }))
  const points = pointCoords.map(p => `${p.x},${p.y}`).join(' ')
  const gridColor = isLight ? '#e5e7eb' : '#1f2937'
  const labelColor = isLight ? '#6b7280' : '#6b7280'
  const ySteps = 4
  const yLabels = Array.from({ length: ySteps + 1 }, (_, i) => {
    const val = (max / ySteps) * i
    return formatY ? formatY(val) : String(Math.round(val))
  })

  const firstX = padX
  const lastX = padX + chartW
  const bottomY = padY + chartH
  const fillPoints = `${firstX},${bottomY} ${points} ${lastX},${bottomY}`

  return (
    <div>
      {label && <div className={`text-xs mb-2 ${isLight ? 'text-black/40' : 'text-white/40'}`}>{label}</div>}
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
        <defs>
          <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.15" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {yLabels.map((lbl, i) => {
          const y = padY + chartH - (i / ySteps) * chartH
          return (
            <g key={i}>
              <line x1={padX} y1={y} x2={w} y2={y} stroke={gridColor} strokeWidth="1" strokeDasharray="4" />
              <text x={padX - 8} y={y + 4} fill={labelColor} fontSize="10" textAnchor="end">{lbl}</text>
            </g>
          )
        })}
        <polygon points={fillPoints} fill={`url(#grad-${dataKey})`} />
        <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Hover targets — invisible wider hit areas */}
        {pointCoords.map((p, i) => (
          <g key={`hover-${i}`}>
            <rect
              x={p.x - (chartW / data.length) / 2} y={padY} width={chartW / data.length} height={chartH}
              fill="transparent"
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="cursor-crosshair"
            />
          </g>
        ))}
        {/* Hover indicator */}
        {hoveredIdx !== null && pointCoords[hoveredIdx] && (
          <g>
            <line x1={pointCoords[hoveredIdx].x} y1={padY} x2={pointCoords[hoveredIdx].x} y2={bottomY}
              stroke={color} strokeWidth="1" strokeDasharray="3" opacity="0.4" />
            <circle cx={pointCoords[hoveredIdx].x} cy={pointCoords[hoveredIdx].y} r="4"
              fill={color} stroke={isLight ? '#fff' : '#111'} strokeWidth="2" />
            {/* Tooltip */}
            <rect x={pointCoords[hoveredIdx].x - 35} y={pointCoords[hoveredIdx].y - 28} width="70" height="20"
              rx="4"
              fill={isLight ? '#ffffff' : '#111111'}
              stroke={isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.08)'}
              strokeWidth="1" />
            <text x={pointCoords[hoveredIdx].x} y={pointCoords[hoveredIdx].y - 14}
              fill={isLight ? '#111111' : '#ffffff'} fontSize="11" fontWeight="600" textAnchor="middle">
              {formatY ? formatY(pointCoords[hoveredIdx].value) : String(Math.round(pointCoords[hoveredIdx].value))}
            </text>
          </g>
        )}
        {/* X-axis labels */}
        {data.filter((_, i) => i % 3 === 0).map((d) => {
          const idx = data.indexOf(d)
          const x = padX + (idx / (data.length - 1)) * chartW
          return <text key={idx} x={x} y={h - 2} fill={labelColor} fontSize="10" textAnchor="middle">{d.label as string}</text>
        })}
      </svg>
    </div>
  )
}

// ─── Sortable Table Header ───────────────────────────────────────────
function SortHeader({ label, field, sortField, sortDir, onSort, isLight, tooltip }: {
  label: string; field: string; sortField: string; sortDir: SortDir
  onSort: (f: string) => void; isLight: boolean; tooltip?: string
}) {
  const active = sortField === field
  return (
    <th className={`px-3 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer select-none whitespace-nowrap
      ${isLight ? 'text-black/40 hover:text-black/70' : 'text-white/40 hover:text-white/70'}`}
      onClick={() => onSort(field)} title={tooltip}>
      <span className="inline-flex items-center gap-1">
        {label}
        <span className="text-[10px]">{active ? (sortDir === 'asc' ? '▲' : '▼') : '⇅'}</span>
      </span>
    </th>
  )
}

// ─── Date Picker (matches Link Analysis design) ─────────────────────
// ─── Progress Bar ────────────────────────────────────────────────────
function InlineProgress({ message, current, total, isLight }: {
  message: string; current: number; total: number; isLight: boolean
}) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0
  return (
    <div className="flex items-center gap-2">
      <div className={`w-24 h-1.5 rounded-full overflow-hidden ${isLight ? 'bg-black/[0.06]' : 'bg-white/[0.06]'}`}>
        <div
          className="h-full rounded-full bg-blue-500 transition-all duration-300 ease-out"
          style={{ width: total > 0 ? `${pct}%` : '100%', animation: total === 0 ? 'pulse 1.5s ease-in-out infinite' : undefined }}
        />
      </div>
      <span className={`text-xs whitespace-nowrap ${isLight ? 'text-black/40' : 'text-white/40'}`}>
        {total > 0 ? `${pct}%` : message || 'Fetching…'}
      </span>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════
export default function RevenueClient() {
  const { resolved } = useTheme()
  const isLight = resolved === 'light'

  const [activeTab, setActiveTab] = useState<SubTab>('overview')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<RevenueData | null>(null)

  // Date picker state — minute-precise range. "Today" defaults to
  // today 00:00 local → now minus 1 minute (floored to the minute).
  const [dateStart, setDateStart] = useState<Date>(() => { const d = new Date(); d.setHours(0,0,0,0); return d })
  const [dateEnd, setDateEnd] = useState<Date>(() => {
    const d = new Date(Date.now() - 60 * 1000); d.setSeconds(0, 0); return d
  })
  const [dateLabel, setDateLabel] = useState('Today')

  // A range is "live" if its end is within 2 minutes of now — used to
  // decide whether to poll for auto-refresh and which cache-key family
  // to talk to. Kept as a ref so polling can read it without re-subscribing.
  const isLive = useMemo(
    () => Math.abs(Date.now() - dateEnd.getTime()) <= LIVE_WINDOW_MS,
    [dateEnd]
  )
  const liveRef = useRef(isLive)
  useEffect(() => { liveRef.current = isLive }, [isLive])
  const rangeRef = useRef({ fromMs: dateStart.getTime(), toMs: dateEnd.getTime() })
  useEffect(() => {
    rangeRef.current = { fromMs: dateStart.getTime(), toMs: dateEnd.getTime() }
  }, [dateStart, dateEnd])

  // Progress state (SSE)
  const [progressMsg, setProgressMsg] = useState('')
  const [progressCurrent, setProgressCurrent] = useState(0)
  const [progressTotal, setProgressTotal] = useState(0)

  // Toast notifications
  const [toasts, setToasts] = useState<Toast[]>([])
  const toastIdRef = useRef(0)

  const addToast = useCallback((type: Toast['type'], message: string) => {
    const id = ++toastIdRef.current
    setToasts(prev => [...prev, { id, type, message }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000)
  }, [])

  const dismissToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  // Expectations
  const [expCreators, setExpCreators] = useState<ExpectationCreator[]>([])
  const [expLoading, setExpLoading] = useState(false)
  const [expSaving, setExpSaving] = useState<string | null>(null)

  // Settings
  const [config, setConfig] = useState<InflowwConfig | null>(null)
  const [configLoading, setConfigLoading] = useState(false)
  const [configForm, setConfigForm] = useState({ api_key: '', agency_oid: '', refund_threshold_dollars: 20, fetching_enabled: true })
  const [configSaving, setConfigSaving] = useState(false)

  // Sorting
  const [sortField, setSortField] = useState('totalRevenue')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [trackSortField, setTrackSortField] = useState('generatedRevenuePct')
  const [trackSortDir, setTrackSortDir] = useState<SortDir>('asc')

  // ─── Theme-aware classes ─────────────────────────────────────────
  const card = isLight ? 'bg-black/[0.03] border border-black/[0.06]' : 'bg-white/[0.04] border border-white/[0.06]'
  const text1 = isLight ? 'text-black/90' : 'text-white/90'
  const text2 = isLight ? 'text-black/50' : 'text-white/50'
  const text3 = isLight ? 'text-black/30' : 'text-white/30'
  const inputCls = isLight
    ? 'bg-white border border-black/10 text-black/80 placeholder:text-black/25 focus:border-black/30'
    : 'bg-white/[0.05] border border-white/10 text-white/90 placeholder:text-white/20 focus:border-white/30'
  const selectCls = isLight
    ? 'bg-white border border-black/10 text-black/80'
    : 'bg-white/[0.05] border border-white/10 text-white/90'
  const tableBorder = isLight ? 'border-black/[0.06]' : 'border-white/[0.06]'
  const tableRowHover = isLight ? 'hover:bg-black/[0.02]' : 'hover:bg-white/[0.03]'

  // ─── Refresh: trigger cache rebuild then load fresh cache ────────
  const refreshCache = useCallback(async () => {
    setLoading(true)
    setProgressMsg('Refreshing cache...')
    setProgressCurrent(0)
    setProgressTotal(0)

    const fromMs = dateStart.getTime()
    const toMs = dateEnd.getTime()
    const qs = `?from=${fromMs}&to=${toMs}`

    try {
      // Trigger a rebuild of the cache entry for this exact range.
      const res = await fetch(`/api/admin/revenue/cache${qs}`, { method: 'POST' })
      if (!res.ok) {
        const json = await res.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(json.error || `HTTP ${res.status}`)
      }

      // Read the freshly updated cache.
      const cacheRes = await fetch(`/api/admin/revenue/cache${qs}`)
      const cached = await cacheRes.json()
      if (cached?.totals && cached?.creators) {
        setData({ ...cached, creators: (cached.creators || []).map(normalizeCreator) } as RevenueData)
        addToast('success', `Data refreshed — ${cached.creators?.length || 0} creators`)
      } else {
        addToast('error', 'Cache refreshed but no data returned')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      addToast('error', msg)
    } finally {
      setLoading(false)
      setProgressMsg('')
    }
  }, [addToast, dateStart, dateEnd])

  // ─── Auto-refresh (live ranges only, every 30 min) ─────────────
  // Only poll when the selected range's end is within 2 min of "now".
  // Historical ranges are immutable, so polling them would be wasted calls.
  useEffect(() => {
    if (!isLive) return
    const THIRTY_MINUTES = 30 * 60 * 1000
    const interval = setInterval(() => {
      // Guard: the range might have changed to historical mid-interval.
      if (!liveRef.current) return

      // Roll the end forward to "now minus 1 min" so the cache key
      // reflects the new live bucket.
      const newEnd = new Date(Date.now() - 60 * 1000); newEnd.setSeconds(0, 0)
      const fromMs = rangeRef.current.fromMs
      const toMs = newEnd.getTime()
      const qs = `?from=${fromMs}&to=${toMs}`

      fetch(`/api/admin/revenue/cache${qs}`, { method: 'POST' })
        .then(res => { if (!res.ok) throw new Error('refresh failed'); return res })
        .then(() => fetch(`/api/admin/revenue/cache${qs}`))
        .then(r => r.json())
        .then(cached => {
          if (cached?.totals && cached?.creators) {
            setData({ ...cached, creators: (cached.creators || []).map(normalizeCreator) } as RevenueData)
            setDateEnd(newEnd)
            addToast('info', 'Revenue data auto-refreshed')
          }
        })
        .catch(() => {
          // Silent failure — user can click refresh manually
        })
    }, THIRTY_MINUTES)

    return () => clearInterval(interval)
  }, [isLive, addToast])

  const fetchExpectations = useCallback(async () => {
    setExpLoading(true)
    try {
      const res = await fetch('/api/admin/revenue/expectations')
      const json = await res.json()
      if (res.ok) setExpCreators(json.creators || [])
      else addToast('error', json.error || 'Failed to load expectations')
    } catch { addToast('error', 'Failed to load expectations') }
    finally { setExpLoading(false) }
  }, [addToast])

  const fetchConfig = useCallback(async () => {
    setConfigLoading(true)
    try {
      const res = await fetch('/api/admin/revenue/config')
      const json = await res.json()
      if (res.ok && json.config) {
        setConfig(json.config)
        setConfigForm({ api_key: '', agency_oid: json.config.agency_oid || '', refund_threshold_dollars: json.config.refund_threshold_dollars || 20, fetching_enabled: json.config.fetching_enabled !== false })
      }
    } catch { addToast('error', 'Failed to load config') }
    finally { setConfigLoading(false) }
  }, [addToast])

  // Load from cache on mount (silent, no loading indicator). Instant display from Supabase cache.
  const cacheLoadedRef = useRef(false)
  useEffect(() => {
    if ((activeTab === 'overview' || activeTab === 'tracking') && !cacheLoadedRef.current && !data) {
      cacheLoadedRef.current = true
      const fromMs = dateStart.getTime()
      const toMs = dateEnd.getTime()
      fetch(`/api/admin/revenue/cache?from=${fromMs}&to=${toMs}`)
        .then(r => r.json())
        .then(cached => {
          if (cached?.totals && cached?.creators) {
            setData({ ...cached, creators: (cached.creators || []).map(normalizeCreator) } as RevenueData)
            const ago = cached.fetchedAt ? new Date(cached.fetchedAt) : null
            const mins = ago ? Math.round((Date.now() - ago.getTime()) / 60000) : null
            const isLiveNow = Math.abs(Date.now() - toMs) <= LIVE_WINDOW_MS
            addToast(
              'info',
              mins !== null
                ? `Cached data (${mins}m ago).${isLiveNow ? ' Auto-refreshes every 30 min.' : ''}`
                : 'Showing cached data.'
            )
          }
          // No cache? Show empty state — user can click refresh
        })
        .catch(() => {
          // Cache fetch failed silently — user can click refresh
        })
    }
  }, [activeTab, data, addToast, dateStart, dateEnd])
  useEffect(() => { if (activeTab === 'expectations') fetchExpectations() }, [activeTab, fetchExpectations])
  useEffect(() => { if (activeTab === 'settings') fetchConfig() }, [activeTab, fetchConfig])

  // ─── Load cached data for the selected [start, end] range ──────
  const loadCacheForDate = useCallback(async (start: Date, end: Date) => {
    const fromMs = start.getTime()
    const toMs = end.getTime()
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/revenue/cache?from=${fromMs}&to=${toMs}`)
      const cached = await res.json()
      if (cached?.totals && cached?.creators) {
        setData({ ...cached, creators: (cached.creators || []).map(normalizeCreator) } as RevenueData)
        const ago = cached.fetchedAt ? new Date(cached.fetchedAt) : null
        const mins = ago ? Math.round((Date.now() - ago.getTime()) / 60000) : null
        addToast('info', mins !== null ? `Cached data (${mins}m ago)` : 'Showing cached data.')
      } else {
        setData(null as unknown as RevenueData)
        addToast('info', 'No cached data for this range. Click refresh to fetch.')
      }
    } catch {
      addToast('error', 'Failed to load cached data')
    } finally {
      setLoading(false)
    }
  }, [addToast])

  // ─── Date picker handler ────────────────────────────────────────
  const handleDateApply = useCallback((label: string, start: Date, end: Date) => {
    setDateLabel(label)
    setDateStart(start)
    setDateEnd(end)
    // Auto-load cached data for the new date
    loadCacheForDate(start, end)
  }, [loadCacheForDate])

  // ─── Sort handlers ───────────────────────────────────────────────
  const handleSort = (f: string) => { if (sortField === f) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortField(f); setSortDir('desc') } }
  const handleTrackSort = (f: string) => { if (trackSortField === f) setTrackSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setTrackSortField(f); setTrackSortDir('asc') } }

  // Only show mapped creators (those linked to a LinkMe profile) in Revenue lists
  // Split creators into linked (mapped to a LinkMe creator) and unlinked Infloww accounts
  const linkedCreators = useMemo(() => {
    if (!data?.creators) return []
    return data.creators.filter(c => c.supabase_creator_id !== null)
  }, [data])

  const unlinkedCreators = useMemo(() => {
    if (!data?.creators) return []
    return data.creators.filter(c => c.supabase_creator_id === null)
  }, [data])

  const sortedLinked = useMemo(() => {
    return [...linkedCreators].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortField] as number || 0
      const bVal = (b as Record<string, unknown>)[sortField] as number || 0
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal
    })
  }, [linkedCreators, sortField, sortDir])

  const sortedUnlinked = useMemo(() => {
    return [...unlinkedCreators].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortField] as number || 0
      const bVal = (b as Record<string, unknown>)[sortField] as number || 0
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal
    })
  }, [unlinkedCreators, sortField, sortDir])

  // Combined for CSV export compatibility
  const sortedCreators = useMemo(() => [...sortedLinked, ...sortedUnlinked], [sortedLinked, sortedUnlinked])

  // ─── Save handlers ──────────────────────────────────────────────
  const saveExpectation = async (creatorId: string, field: string, value: number | boolean) => {
    setExpSaving(creatorId)
    const creator = expCreators.find(c => c.id === creatorId)
    const existing = creator?.expectation || { daily_revenue_target: 0, revenue_per_fan_baseline: 0, check_frequency: 1, free_subs: false }
    try {
      const res = await fetch('/api/admin/revenue/expectations', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creator_id: creatorId, ...existing, [field]: value }),
      })
      if (res.ok) {
        setExpCreators(prev => prev.map(c => c.id === creatorId ? { ...c, expectation: { ...existing, [field]: value } } : c))
        addToast('success', 'Expectation saved')
      } else { addToast('error', 'Failed to save expectation') }
    } catch { addToast('error', 'Failed to save expectation') }
    finally { setExpSaving(null) }
  }

  const saveEmergency = async (creatorId: string, emergencySince: string | null, notes: string) => {
    try {
      const res = await fetch('/api/admin/revenue/emergency', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creator_id: creatorId, emergency_since: emergencySince, notes }),
      })
      if (res.ok) addToast('success', 'Emergency status updated')
      else addToast('error', 'Failed to update emergency status')
    } catch { addToast('error', 'Failed to update emergency status') }
  }

  const saveConfig = async () => {
    setConfigSaving(true)
    try {
      const payload: Record<string, unknown> = { agency_oid: configForm.agency_oid, refund_threshold_dollars: configForm.refund_threshold_dollars, fetching_enabled: configForm.fetching_enabled }
      if (configForm.api_key) payload.api_key = configForm.api_key
      const res = await fetch('/api/admin/revenue/config', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const json = await res.json()
      if (res.ok) {
        setConfig(json.config)
        setConfigForm(p => ({ ...p, api_key: '' }))
        addToast('success', 'Settings saved')
      } else addToast('error', `Failed to save: ${json.error}`)
    } catch { addToast('error', 'Failed to save settings') }
    finally { setConfigSaving(false) }
  }

  const exportCSV = () => {
    if (!data?.creators) return
    const h = ['Creator','Total Revenue','New Subs','New Subs Rev','Rec Subs Rev','Tips Rev','Message Rev','Texting Ratio','Open Chats','Selling Chats','Avg Fan Spend','Link Clicks','CVR']
    const rows = sortedCreators.map(c => [c.display_name,c.totalRevenue,c.newSubs,c.newSubRevenue,c.recurringSubRevenue,c.tipRevenue,c.messageRevenue,c.textingRatio,c.openChats,c.sellingChats,c.avgFanSpend,c.linkClicks,c.conversionRate])
    const csv = [h.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `revenue_${dateLabel.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`; a.click()
    URL.revokeObjectURL(url)
    addToast('success', 'CSV exported')
  }

  const getTrackingCreators = (freq: number) => {
    if (!data?.creators) return []
    return [...data.creators]
      .filter(c => c.supabase_creator_id !== null && c.expectation?.check_frequency === freq)
      .sort((a, b) => {
        const aVal = (a as Record<string, unknown>)[trackSortField] as number || 0
        const bVal = (b as Record<string, unknown>)[trackSortField] as number || 0
        return trackSortDir === 'asc' ? aVal - bVal : bVal - aVal
      })
  }

  // Unlinked Infloww creators (no LinkMe mapping). Surfaced in Revenue
  // Tracking so nothing the API returns gets swallowed — per requirement
  // that any stat-producing creator shows up even if it's not wired into
  // the dashboard yet.
  const trackingUnlinked = useMemo(() => {
    if (!data?.creators) return []
    return [...data.creators]
      .filter(c => c.supabase_creator_id === null)
      .sort((a, b) => {
        const aVal = (a as Record<string, unknown>)[trackSortField] as number || 0
        const bVal = (b as Record<string, unknown>)[trackSortField] as number || 0
        return trackSortDir === 'asc' ? aVal - bVal : bVal - aVal
      })
  }, [data, trackSortField, trackSortDir])

  // ═══════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════
  const tabCls = (tab: SubTab) =>
    `px-4 py-2 text-[13px] font-medium rounded-lg transition-all duration-150 ${
      activeTab === tab
        ? isLight ? 'text-black/90 bg-black/[0.06]' : 'text-white/95 bg-white/[0.08]'
        : isLight ? 'text-black/40 hover:text-black/70 hover:bg-black/[0.03]' : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
    }`

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Toasts */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className={`text-2xl font-bold ${text1}`}>Revenue</h1>
        {(activeTab === 'overview' || activeTab === 'tracking') && (
          <div className="flex items-center gap-3">
            {loading && (
              <InlineProgress message={progressMsg} current={progressCurrent} total={progressTotal} isLight={isLight} />
            )}
            <DatePicker dateStart={dateStart} dateEnd={dateEnd} dateLabel={dateLabel} onApply={handleDateApply} isLight={isLight} />
            <button onClick={refreshCache} disabled={loading}
              className={`p-2 rounded-lg transition-all ${isLight ? 'hover:bg-black/[0.04] text-black/40' : 'hover:bg-white/[0.06] text-white/40'} disabled:opacity-50`}>
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8">
        {(['overview', 'tracking', 'expectations', 'settings'] as SubTab[]).map(tab => (
          <button key={tab} className={tabCls(tab)} onClick={() => setActiveTab(tab)}>
            {tab === 'overview' ? 'Overview' : tab === 'tracking' ? 'Revenue Tracking' : tab === 'expectations' ? 'Expectations' : 'Settings'}
          </button>
        ))}
      </div>

      {/* Empty state — no data yet */}
      {(activeTab === 'overview' || activeTab === 'tracking') && !data && !loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className={`text-sm ${isLight ? 'text-black/40' : 'text-white/40'}`}>No revenue data loaded yet.</div>
          <button onClick={refreshCache}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${isLight ? 'bg-black/[0.04] hover:bg-black/[0.08] text-black/60' : 'bg-white/[0.06] hover:bg-white/[0.10] text-white/60'}`}>
            Fetch Revenue Data
          </button>
        </div>
      )}

      {/* ─── OVERVIEW ──────────────────────────────────────────── */}
      {activeTab === 'overview' && data && (
        <div>
          {/* Summary Cards + Donut */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <div className="grid grid-cols-2 gap-4 lg:col-span-1">
              <div className={`${card} rounded-xl p-4 col-span-2`}>
                {data.hourlyChart && <Sparkline data={data.hourlyChart.map(h => h.revenue)} color="#3b82f6" width={200} height={40} />}
                <div className="mt-3">
                  <div className={`text-3xl font-bold ${text1}`}>{fmt(data.totals.totalTurnover)}</div>
                  <div className={`text-sm ${text2}`}>Total Turnover</div>
                </div>
              </div>
              <div className={`${card} rounded-xl p-4`}>
                <div className={`text-2xl font-bold ${text1}`}>{data.totals.totalNewSubs}</div>
                <div className={`text-sm ${text2}`}>New Subs</div>
              </div>
              <div className={`${card} rounded-xl p-4`}>
                <div className={`text-2xl font-bold ${text1}`}>{data.totals.messageRevenue > 0 ? (data.totals.totalTurnover / data.totals.messageRevenue).toFixed(1) : '—'}</div>
                <div className={`text-sm ${text2}`}>Texting Ratio</div>
              </div>
            </div>
            <div className={`${card} rounded-xl p-6 lg:col-span-2 flex items-center justify-center`}>
              <DonutChart isLight={isLight} segments={[
                { label: 'Subscriptions', value: data.totals.subscriptionRevenue, color: '#a855f7' },
                { label: 'Messages', value: data.totals.messageRevenue, color: '#3b82f6' },
                { label: 'Tips', value: data.totals.tipRevenue, color: '#14b8a6' },
              ]} />
            </div>
          </div>

          {/* Charts */}
          {data.hourlyChart && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
              <div className={`${card} rounded-xl p-5`}>
                <div className={`text-lg font-semibold ${text1}`}>{data.totals.totalNewSubs}</div>
                <div className={`text-sm mb-4 ${text2}`}>Subscriptions</div>
                <LineChart data={data.hourlyChart} dataKey="subs" label="" isLight={isLight} color="#a855f7" />
              </div>
              <div className={`${card} rounded-xl p-5`}>
                <div className={`text-lg font-semibold ${text1}`}>{fmt(data.totals.totalTurnover)}</div>
                <div className={`text-sm mb-4 ${text2}`}>Revenue</div>
                <LineChart data={data.hourlyChart} dataKey="revenue" label="" isLight={isLight} color="#3b82f6" formatY={v => `$${Math.round(v).toLocaleString()}`} />
              </div>
            </div>
          )}

          {/* Detailed Comparison */}
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-lg font-bold ${text1}`}>Detailed Comparison</h2>
            <button onClick={exportCSV} className={`flex items-center gap-2 text-sm ${text2} hover:${text1} transition-colors`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export
            </button>
          </div>

          <div className={`${card} rounded-xl overflow-x-auto`}>
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b ${tableBorder}`}>
                  <SortHeader label="Creator" field="display_name" sortField={sortField} sortDir={sortDir} onSort={handleSort} isLight={isLight} />
                  <SortHeader label="Total Revenue" field="totalRevenue" sortField={sortField} sortDir={sortDir} onSort={handleSort} isLight={isLight} />
                  <SortHeader label="New Subs" field="newSubs" sortField={sortField} sortDir={sortDir} onSort={handleSort} isLight={isLight} />
                  <SortHeader label="New Subs Rev" field="newSubRevenue" sortField={sortField} sortDir={sortDir} onSort={handleSort} isLight={isLight} />
                  <SortHeader label="Rec. Subs Rev" field="recurringSubRevenue" sortField={sortField} sortDir={sortDir} onSort={handleSort} isLight={isLight} />
                  <SortHeader label="Tips Rev" field="tipRevenue" sortField={sortField} sortDir={sortDir} onSort={handleSort} isLight={isLight} />
                  <SortHeader label="Message Rev" field="messageRevenue" sortField={sortField} sortDir={sortDir} onSort={handleSort} isLight={isLight} />
                  <SortHeader label="Texting Ratio" field="textingRatio" sortField={sortField} sortDir={sortDir} onSort={handleSort} isLight={isLight} tooltip="Total Revenue / Message Revenue" />
                  <SortHeader label="Open Chats" field="openChats" sortField={sortField} sortDir={sortDir} onSort={handleSort} isLight={isLight} />
                  <SortHeader label="Selling Chats" field="sellingChats" sortField={sortField} sortDir={sortDir} onSort={handleSort} isLight={isLight} />
                  <SortHeader label="Avg Fan Spend" field="avgFanSpend" sortField={sortField} sortDir={sortDir} onSort={handleSort} isLight={isLight} />
                  <SortHeader label="Link Clicks" field="linkClicks" sortField={sortField} sortDir={sortDir} onSort={handleSort} isLight={isLight} />
                  <SortHeader label="CVR" field="conversionRate" sortField={sortField} sortDir={sortDir} onSort={handleSort} isLight={isLight} tooltip="Conversion Rate" />
                </tr>
              </thead>
              <tbody>
                {/* ── Linked Creators (mapped to a LinkMe profile) ── */}
                {sortedLinked.map(c => (
                  <tr key={c.infloww_id} className={`border-b ${tableBorder} ${tableRowHover}`}>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2.5">
                        {c.avatar_url
                          ? <img src={c.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover" />
                          : <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${isLight ? 'bg-black/[0.06] text-black/40' : 'bg-white/[0.08] text-white/50'}`}>{c.display_name?.charAt(0) || c.name?.charAt(0) || "?"}</div>}
                        <span className={`font-medium ${text1}`}>{c.display_name || c.name}</span>
                      </div>
                    </td>
                    <td className={`px-3 py-3 font-semibold ${text1}`}>{fmt(c.totalRevenue)}</td>
                    <td className={`px-3 py-3 ${text1}`}>{c.newSubs}</td>
                    <td className={`px-3 py-3 ${text1}`}>{fmt(c.newSubRevenue)}</td>
                    <td className={`px-3 py-3 ${text1}`}>{fmt(c.recurringSubRevenue)}</td>
                    <td className={`px-3 py-3 ${text1}`}>{fmt(c.tipRevenue)}</td>
                    <td className={`px-3 py-3 ${text1}`}>{fmt(c.messageRevenue)}</td>
                    <td className={`px-3 py-3 ${text1}`}>{c.messageRevenue > 0 ? (c.totalRevenue / c.messageRevenue).toFixed(1) : '—'}</td>
                    <td className={`px-3 py-3 ${text1}`}>{c.openChats}</td>
                    <td className={`px-3 py-3 ${text1}`}>{c.sellingChats}</td>
                    <td className={`px-3 py-3 ${text1}`}>{fmtDec(c.avgFanSpend)}</td>
                    <td className={`px-3 py-3 ${text1}`}>{c.linkClicks}</td>
                    <td className={`px-3 py-3 ${text1}`}>{c.conversionRate.toFixed(1)}%</td>
                  </tr>
                ))}

                {/* ── Divider between linked and unlinked ── */}
                {sortedLinked.length > 0 && sortedUnlinked.length > 0 && (
                  <tr>
                    <td colSpan={13} className={`px-3 py-2 text-xs font-semibold uppercase tracking-wider ${isLight ? 'bg-black/[0.03] text-black/40 border-y border-black/10' : 'bg-white/[0.03] text-white/30 border-y border-white/10'}`}>
                      Unlinked Infloww Accounts
                    </td>
                  </tr>
                )}

                {/* ── Unlinked Infloww accounts (not mapped to any LinkMe creator) ── */}
                {sortedUnlinked.map(c => (
                  <tr key={c.infloww_id} className={`border-b ${tableBorder} ${tableRowHover} ${isLight ? 'bg-black/[0.015]' : 'bg-white/[0.015]'}`}>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2.5">
                        {c.avatar_url
                          ? <img src={c.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover opacity-60" />
                          : <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${isLight ? 'bg-black/[0.06] text-black/30' : 'bg-white/[0.06] text-white/30'}`}>{c.display_name?.charAt(0) || c.name?.charAt(0) || "?"}</div>}
                        <span className={`font-medium ${text2}`}>{c.display_name || c.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isLight ? 'bg-amber-100 text-amber-700' : 'bg-amber-900/30 text-amber-400'}`}>Unlinked</span>
                      </div>
                    </td>
                    <td className={`px-3 py-3 font-semibold ${text2}`}>{fmt(c.totalRevenue)}</td>
                    <td className={`px-3 py-3 ${text2}`}>{c.newSubs}</td>
                    <td className={`px-3 py-3 ${text2}`}>{fmt(c.newSubRevenue)}</td>
                    <td className={`px-3 py-3 ${text2}`}>{fmt(c.recurringSubRevenue)}</td>
                    <td className={`px-3 py-3 ${text2}`}>{fmt(c.tipRevenue)}</td>
                    <td className={`px-3 py-3 ${text2}`}>{fmt(c.messageRevenue)}</td>
                    <td className={`px-3 py-3 ${text2}`}>{c.messageRevenue > 0 ? (c.totalRevenue / c.messageRevenue).toFixed(1) : '—'}</td>
                    <td className={`px-3 py-3 ${text2}`}>{c.openChats}</td>
                    <td className={`px-3 py-3 ${text2}`}>{c.sellingChats}</td>
                    <td className={`px-3 py-3 ${text2}`}>{fmtDec(c.avgFanSpend)}</td>
                    <td className={`px-3 py-3 ${text2}`}>{c.linkClicks}</td>
                    <td className={`px-3 py-3 ${text2}`}>{c.conversionRate.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {sortedLinked.length === 0 && sortedUnlinked.length === 0 && <div className={`text-center py-10 ${text2}`}>No data. Configure API key in Settings first.</div>}
          </div>
        </div>
      )}

      {/* ─── TRACKING ──────────────────────────────────────────── */}
      {activeTab === 'tracking' && data && (
        <div>
          {[1, 3, 7].map(freq => {
            const creators = getTrackingCreators(freq)
            if (!creators.length) return null
            return (
              <div key={freq} className="mb-10">
                <div className="flex items-center gap-3 mb-4">
                  <h2 className={`text-lg font-bold ${text1}`}>Daily Report ({freq} Day{freq > 1 ? 's' : ''})</h2>
                  <span className={`text-sm ${text3}`}>{creators.length} creators</span>
                </div>
                <div className={`${card} rounded-xl overflow-x-auto`}>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className={`border-b ${tableBorder}`}>
                        <th className={`px-3 py-3 text-left text-xs font-medium uppercase ${text3}`}>OnlyFans Name</th>
                        <SortHeader label="Exp. Revenue" field="expectation.daily_revenue_target" sortField={trackSortField} sortDir={trackSortDir} onSort={handleTrackSort} isLight={isLight} />
                        <SortHeader label="Revenue" field="totalRevenue" sortField={trackSortField} sortDir={trackSortDir} onSort={handleTrackSort} isLight={isLight} />
                        <SortHeader label="Gen. Revenue %" field="generatedRevenuePct" sortField={trackSortField} sortDir={trackSortDir} onSort={handleTrackSort} isLight={isLight} />
                        <SortHeader label="14d Sub Avg" field="subAvg14d" sortField={trackSortField} sortDir={trackSortDir} onSort={handleTrackSort} isLight={isLight} />
                        <SortHeader label={`${freq}d Subs`} field="newSubs" sortField={trackSortField} sortDir={trackSortDir} onSort={handleTrackSort} isLight={isLight} />
                        <th className={`px-3 py-3 text-left text-xs font-medium uppercase ${text3}`}>Subs Avg %</th>
                        <th className={`px-3 py-3 text-left text-xs font-medium uppercase ${text3}`}>Emergency Since</th>
                        <th className={`px-3 py-3 text-left text-xs font-medium uppercase ${text3}`}>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {creators.map(c => {
                        const expected = c.expectation ? c.expectation.daily_revenue_target * freq : null
                        const subsAvgPct = c.subAvg14d > 0 ? Math.round(((c.newSubs / (c.subAvg14d * freq)) - 1) * 1000) / 10 : null
                        return (
                          <tr key={c.infloww_id} className={`border-b ${tableBorder} ${tableRowHover}`}>
                            <td className="px-3 py-3">
                              <div className="flex items-center gap-2">
                                {c.avatar_url
                                  ? <img src={c.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover" />
                                  : <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${isLight ? 'bg-black/[0.06] text-black/40' : 'bg-white/[0.08] text-white/50'}`}>{c.display_name?.charAt(0) || c.name?.charAt(0) || "?"}</div>}
                                <span className={`font-medium ${text1}`}>{c.display_name || c.name}</span>
                              </div>
                            </td>
                            <td className={`px-3 py-3 ${text1}`}>{expected !== null ? fmt(expected) : '—'}</td>
                            <td className={`px-3 py-3 font-semibold ${text1}`}>{fmt(c.totalRevenue)}</td>
                            <td className="px-3 py-3">
                              {c.generatedRevenuePct !== null
                                ? <span className={`px-2 py-1 rounded text-xs font-medium ${pctColor(c.generatedRevenuePct, isLight)}`}>
                                    {(c.generatedRevenuePct ?? 0) > 0 ? '+' : ''}{(c.generatedRevenuePct ?? 0).toFixed(1)}%
                                  </span>
                                : <span className={text3}>—</span>}
                            </td>
                            <td className={`px-3 py-3 ${text1}`}>{c.subAvg14d}</td>
                            <td className={`px-3 py-3 ${text1}`}>{c.newSubs}</td>
                            <td className="px-3 py-3">
                              {subsAvgPct !== null
                                ? <span className={`px-2 py-1 rounded text-xs font-medium ${pctColor(subsAvgPct, isLight)}`}>
                                    {subsAvgPct > 0 ? '+' : ''}{subsAvgPct.toFixed(1)}%
                                  </span>
                                : <span className={text3}>—</span>}
                            </td>
                            <td className="px-3 py-3">
                              <EmergencyDropdown creatorId={c.supabase_creator_id} currentDate={c.emergency_since}
                                onSave={date => c.supabase_creator_id && saveEmergency(c.supabase_creator_id, date, c.emergency_notes)}
                                isLight={isLight} inputCls={inputCls} />
                            </td>
                            <td className="px-3 py-3">
                              <NotesInput creatorId={c.supabase_creator_id} currentNotes={c.emergency_notes} emergencySince={c.emergency_since}
                                onSave={notes => c.supabase_creator_id && saveEmergency(c.supabase_creator_id, c.emergency_since, notes)}
                                isLight={isLight} />
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

          {linkedCreators.filter(c => !c.expectation).length > 0 && (
            <div className={`mt-6 rounded-lg p-4 ${isLight ? 'bg-amber-50 border border-amber-200' : 'bg-yellow-900/15 border border-yellow-700/30'}`}>
              <p className={`text-sm font-medium mb-1 ${isLight ? 'text-amber-800' : 'text-yellow-300'}`}>Creators without expectations:</p>
              <p className={`text-sm ${isLight ? 'text-amber-700' : 'text-yellow-200/70'}`}>
                {linkedCreators.filter(c => !c.expectation).map(c => c.display_name).join(', ')}
              </p>
              <p className={`text-xs mt-2 ${isLight ? 'text-amber-600' : 'text-yellow-200/40'}`}>Set targets in the Expectations tab.</p>
            </div>
          )}

          {/* ── Unlinked Infloww accounts ── */}
          {trackingUnlinked.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-4 mt-10">
                <h2 className={`text-lg font-bold ${text1}`}>Unlinked Infloww Accounts</h2>
                <span className={`text-sm ${text3}`}>{trackingUnlinked.length} creators</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${isLight ? 'bg-amber-100 text-amber-700' : 'bg-amber-900/30 text-amber-400'}`}>
                  Not mapped to a LinkMe profile
                </span>
              </div>
              <div className={`${card} rounded-xl overflow-x-auto`}>
                <table className="w-full text-sm">
                  <thead>
                    <tr className={`border-b ${tableBorder}`}>
                      <th className={`px-3 py-3 text-left text-xs font-medium uppercase ${text3}`}>OnlyFans Name</th>
                      <SortHeader label="Revenue" field="totalRevenue" sortField={trackSortField} sortDir={trackSortDir} onSort={handleTrackSort} isLight={isLight} />
                      <SortHeader label="New Subs" field="newSubs" sortField={trackSortField} sortDir={trackSortDir} onSort={handleTrackSort} isLight={isLight} />
                      <SortHeader label="14d Sub Avg" field="subAvg14d" sortField={trackSortField} sortDir={trackSortDir} onSort={handleTrackSort} isLight={isLight} />
                      <SortHeader label="Msg Rev" field="messageRevenue" sortField={trackSortField} sortDir={trackSortDir} onSort={handleTrackSort} isLight={isLight} />
                      <SortHeader label="Tips Rev" field="tipRevenue" sortField={trackSortField} sortDir={trackSortDir} onSort={handleTrackSort} isLight={isLight} />
                    </tr>
                  </thead>
                  <tbody>
                    {trackingUnlinked.map(c => (
                      <tr key={c.infloww_id} className={`border-b ${tableBorder} ${tableRowHover} ${isLight ? 'bg-black/[0.015]' : 'bg-white/[0.015]'}`}>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            {c.avatar_url
                              ? <img src={c.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover opacity-60" />
                              : <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${isLight ? 'bg-black/[0.06] text-black/30' : 'bg-white/[0.06] text-white/30'}`}>{c.display_name?.charAt(0) || c.name?.charAt(0) || "?"}</div>}
                            <span className={`font-medium ${text2}`}>{c.display_name || c.name}</span>
                          </div>
                        </td>
                        <td className={`px-3 py-3 font-semibold ${text2}`}>{fmt(c.totalRevenue)}</td>
                        <td className={`px-3 py-3 ${text2}`}>{c.newSubs}</td>
                        <td className={`px-3 py-3 ${text2}`}>{c.subAvg14d}</td>
                        <td className={`px-3 py-3 ${text2}`}>{fmt(c.messageRevenue)}</td>
                        <td className={`px-3 py-3 ${text2}`}>{fmt(c.tipRevenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── EXPECTATIONS ──────────────────────────────────────── */}
      {activeTab === 'expectations' && (
        <div>
          <p className={`text-sm mb-6 ${text2}`}>Set daily revenue targets and check frequencies. The tracking tab uses these.</p>
          {expLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className={`animate-spin rounded-full h-8 w-8 border-t-2 ${isLight ? 'border-black/20' : 'border-white/30'}`} />
            </div>
          ) : (
            <div className={`${card} rounded-xl overflow-x-auto`}>
              <table className="w-full text-sm">
                <thead>
                  <tr className={`border-b ${tableBorder}`}>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase ${text3}`}>Creator</th>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase ${text3}`}>Daily Revenue Target ($)</th>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase ${text3}`}>Revenue / Fan (14d $)</th>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase ${text3}`}>Check Frequency</th>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase ${text3}`}>Free Subs?</th>
                  </tr>
                </thead>
                <tbody>
                  {expCreators.map(c => {
                    const exp = c.expectation || { daily_revenue_target: 0, revenue_per_fan_baseline: 0, check_frequency: 1, free_subs: false }
                    return (
                      <tr key={c.id} className={`border-b ${tableBorder} ${expSaving === c.id ? 'opacity-50' : ''}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {c.avatar_url
                              ? <img src={c.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover" />
                              : <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${isLight ? 'bg-black/[0.06] text-black/40' : 'bg-white/[0.08] text-white/50'}`}>{c.display_name?.charAt(0) || c.name?.charAt(0) || "?"}</div>}
                            <span className={`font-medium ${text1}`}>{c.display_name || c.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <input type="number" defaultValue={exp.daily_revenue_target}
                            onBlur={e => saveExpectation(c.id, 'daily_revenue_target', Number(e.target.value))}
                            className={`w-28 ${inputCls} rounded px-2 py-1 text-sm outline-none`} />
                        </td>
                        <td className="px-4 py-3">
                          <input type="number" defaultValue={exp.revenue_per_fan_baseline}
                            onBlur={e => saveExpectation(c.id, 'revenue_per_fan_baseline', Number(e.target.value))}
                            className={`w-28 ${inputCls} rounded px-2 py-1 text-sm outline-none`} />
                        </td>
                        <td className="px-4 py-3">
                          <select defaultValue={exp.check_frequency}
                            onChange={e => saveExpectation(c.id, 'check_frequency', Number(e.target.value))}
                            className={`${selectCls} rounded px-2 py-1 text-sm outline-none`}>
                            <option value={1}>Every Day</option>
                            <option value={3}>Every 3 Days</option>
                            <option value={7}>Every 7 Days</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <input type="checkbox" defaultChecked={exp.free_subs}
                            onChange={e => saveExpectation(c.id, 'free_subs', e.target.checked)}
                            className="w-4 h-4 rounded" />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {!expCreators.length && <div className={`text-center py-10 ${text2}`}>No active creators found.</div>}
            </div>
          )}
        </div>
      )}

      {/* ─── SETTINGS ──────────────────────────────────────────── */}
      {activeTab === 'settings' && (
        <div className="space-y-10">
          <div className="max-w-xl">
            <h2 className={`text-lg font-bold mb-1 ${text1}`}>Infloww API Configuration</h2>
            <p className={`text-sm mb-6 ${text2}`}>API key expires every 30 days. Update it here.</p>

            {configLoading ? (
              <div className="flex items-center justify-center py-10">
                <div className={`animate-spin rounded-full h-8 w-8 border-t-2 ${isLight ? 'border-black/20' : 'border-white/30'}`} />
              </div>
            ) : (
              <div className="space-y-5">
                {/* Fetching Toggle */}
                <div className={`${card} rounded-lg p-4 flex items-center justify-between`}>
                  <div>
                    <div className={`text-sm font-medium ${text1}`}>Revenue Data Fetching</div>
                    <div className={`text-xs mt-0.5 ${text3}`}>
                      {configForm.fetching_enabled
                        ? 'Live fetching and cron cache refresh are active.'
                        : 'All Infloww API calls are paused. Cached data is still visible.'}
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={configForm.fetching_enabled}
                    onClick={() => setConfigForm(p => ({ ...p, fetching_enabled: !p.fetching_enabled }))}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none
                      ${configForm.fetching_enabled
                        ? (isLight ? 'bg-black' : 'bg-white')
                        : (isLight ? 'bg-black/20' : 'bg-white/20')}`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full shadow ring-0 transition duration-200 ease-in-out
                        ${configForm.fetching_enabled ? 'translate-x-5' : 'translate-x-0'}
                        ${configForm.fetching_enabled
                          ? (isLight ? 'bg-white' : 'bg-black')
                          : (isLight ? 'bg-white' : 'bg-black')}`}
                    />
                  </button>
                </div>

                {config?.api_key_masked && (
                  <div className={`${card} rounded-lg p-4`}>
                    <div className={`text-xs mb-1 ${text3}`}>Current API Key</div>
                    <div className={`text-sm font-mono ${text2}`}>{config.api_key_masked}</div>
                    {config.api_key_updated_at && (
                      <div className={`text-xs mt-1 ${text3}`}>
                        Last updated: {new Date(config.api_key_updated_at).toLocaleDateString()}
                        {(() => {
                          const d = Math.floor((Date.now() - new Date(config.api_key_updated_at).getTime()) / 86400000)
                          if (d >= 25) return <span className="text-red-500 ml-2 font-medium">({d} days — expires soon!)</span>
                          if (d >= 20) return <span className={`ml-2 ${isLight ? 'text-amber-600' : 'text-yellow-400'}`}>({d} days ago)</span>
                          return <span className={`ml-2 ${text3}`}>({d} days ago)</span>
                        })()}
                      </div>
                    )}
                  </div>
                )}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${text1}`}>New API Key</label>
                  <input type="password" value={configForm.api_key}
                    onChange={e => setConfigForm(p => ({ ...p, api_key: e.target.value }))}
                    placeholder="Paste new API key (leave blank to keep current)"
                    className={`w-full ${inputCls} rounded-lg px-3 py-2 text-sm outline-none`} />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${text1}`}>Agency OID</label>
                  <input type="text" value={configForm.agency_oid}
                    onChange={e => setConfigForm(p => ({ ...p, agency_oid: e.target.value }))}
                    placeholder="Your agency OID"
                    className={`w-full ${inputCls} rounded-lg px-3 py-2 text-sm outline-none`} />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${text1}`}>Refund Alert Threshold ($)</label>
                  <input type="number" value={configForm.refund_threshold_dollars}
                    onChange={e => setConfigForm(p => ({ ...p, refund_threshold_dollars: Number(e.target.value) }))}
                    className={`w-32 ${inputCls} rounded-lg px-3 py-2 text-sm outline-none`} />
                  <p className={`text-xs mt-1 ${text3}`}>Minimum refund amount for chargeback alerts</p>
                </div>
                <button onClick={saveConfig} disabled={configSaving}
                  className={`px-5 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50
                    ${isLight ? 'bg-black text-white hover:bg-black/90' : 'bg-white text-black hover:bg-white/90'}`}>
                  {configSaving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────
function EmergencyDropdown({ creatorId, currentDate, onSave, isLight, inputCls }: {
  creatorId: string | null; currentDate: string | null; onSave: (d: string | null) => void; isLight: boolean; inputCls: string
}) {
  const [value, setValue] = useState(currentDate || '')
  if (!creatorId) return <span className={isLight ? 'text-black/20' : 'text-white/20'}>—</span>
  return (
    <div className="flex items-center gap-1">
      <input type="date" value={value}
        onChange={e => { setValue(e.target.value); onSave(e.target.value || null) }}
        className={`${inputCls} rounded px-2 py-1 text-xs outline-none w-32`} />
      {value && <button onClick={() => { setValue(''); onSave(null) }}
        className={`text-xs ${isLight ? 'text-black/30 hover:text-red-500' : 'text-white/30 hover:text-red-400'}`}>✕</button>}
    </div>
  )
}

function NotesInput({ creatorId, currentNotes, onSave, isLight }: {
  creatorId: string | null; currentNotes: string; emergencySince: string | null; onSave: (n: string) => void; isLight: boolean
}) {
  const [value, setValue] = useState(currentNotes)
  if (!creatorId) return <span className={isLight ? 'text-black/20' : 'text-white/20'}>—</span>
  return (
    <input type="text" value={value} onChange={e => setValue(e.target.value)} onBlur={() => onSave(value)}
      placeholder="Notes..."
      className={`w-40 bg-transparent border-b text-xs py-1 outline-none ${isLight ? 'border-black/10 text-black/70 placeholder:text-black/20 focus:border-black/30' : 'border-white/10 text-white/80 placeholder:text-white/20 focus:border-white/30'}`} />
  )
}
