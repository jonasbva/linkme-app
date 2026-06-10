'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Users, TrendingUp, DollarSign, UserPlus, Globe, BarChart3, RefreshCw,
  AlertTriangle, Link2, ChevronRight, CheckCircle2,
} from 'lucide-react'
import { useTheme } from './ThemeProvider'
import { Card, Spinner } from './ui'

interface Emergency { creator_id: string; name: string; since: string | null; notes: string }

interface Props {
  totalFollowers: number
  followerGrowth7d: number
  totalEngagement: number
  engagementGrowth7d: number
  activeCreators: number
  creatorsWithSocial: number
  newSubs7d: number
  newSubsToday: number
  revenueToday: number | null
  emergencies: Emergency[]
  targetMissesToday: number
  staleCreators: number
  unmappedCount: number
  displayName?: string
  isSuperAdmin?: boolean
}

function fmt(n: number): string {
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (Math.abs(n) >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toLocaleString()
}

function money(n: number): string {
  return '$' + Math.round(n).toLocaleString()
}

export default function DashboardClient(props: Props) {
  const {
    totalFollowers, followerGrowth7d, totalEngagement, engagementGrowth7d,
    activeCreators, creatorsWithSocial, newSubs7d, newSubsToday, revenueToday,
    emergencies, targetMissesToday, staleCreators, unmappedCount,
    displayName, isSuperAdmin,
  } = props

  const router = useRouter()
  const { resolved } = useTheme()
  const isLight = resolved === 'light'

  const textPrimary = isLight ? 'text-black/90' : 'text-white/95'
  const textSecondary = isLight ? 'text-black/50' : 'text-white/55'
  const textTertiary = isLight ? 'text-black/35' : 'text-white/40'

  // ── Scrape-all (super admin) ──
  const [scraping, setScraping] = useState(false)
  const [scrapeProgress, setScrapeProgress] = useState<{ completed: number; total: number; message: string } | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  async function scrapeAll() {
    setScraping(true)
    setScrapeProgress({ completed: 0, total: 0, message: 'Starting…' })
    const jobId = crypto.randomUUID()
    fetch('/api/admin/scrape-all', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jobId }),
    }).catch(() => {})
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/admin/scrape-all?jobId=${jobId}`)
        const job = await res.json()
        if (job.status === 'pending') return
        setScrapeProgress({ completed: job.completed ?? 0, total: job.total ?? 0, message: job.message || 'Working…' })
        if (job.status === 'done' || job.status === 'error') {
          if (pollRef.current) clearInterval(pollRef.current)
          pollRef.current = null
          setScrapeProgress(null)
          setScraping(false)
          router.refresh()
        }
      } catch {}
    }, 3000)
  }
  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current) }, [])

  const TrendChip = ({ value }: { value: number }) => {
    if (!value) return null
    const up = value > 0
    return (
      <span className={`inline-flex items-center gap-0.5 text-[11px] font-medium px-1.5 py-0.5 rounded-full ${up ? 'text-emerald-500 bg-emerald-500/10' : 'text-red-400 bg-red-400/10'}`}>
        {up ? '↑' : '↓'} {fmt(Math.abs(value))}
      </span>
    )
  }

  const kpis = [
    { label: 'Total Followers', value: fmt(totalFollowers), sub: '7d change', trend: followerGrowth7d, icon: Users, href: '/admin/creators' },
    { label: 'Engagement', value: fmt(totalEngagement), sub: 'likes + comments · 7d', trend: engagementGrowth7d, icon: TrendingUp, href: '/admin/creators' },
    { label: 'New Subs', value: fmt(newSubs7d), sub: `${newSubsToday} today · 7d total`, trend: 0, icon: UserPlus, href: '/admin/conversions' },
    { label: 'Revenue Today', value: revenueToday != null ? money(revenueToday) : '—', sub: revenueToday != null ? 'from cache' : 'open Revenue to fetch', trend: 0, icon: DollarSign, href: '/admin/revenue' },
  ]

  // ── Needs-attention items ──
  type Attn = { key: string; severity: 'red' | 'amber' | 'neutral'; icon: any; label: string; detail: string; href: string }
  const attention: Attn[] = []
  for (const e of emergencies) {
    attention.push({ key: `em-${e.creator_id}`, severity: 'red', icon: AlertTriangle, label: `${e.name} — revenue emergency`, detail: e.notes || (e.since ? `Since ${e.since}` : 'Flagged'), href: '/admin/revenue' })
  }
  if (targetMissesToday > 0) {
    attention.push({ key: 'targets', severity: 'amber', icon: TrendingUp, label: `${targetMissesToday} account${targetMissesToday > 1 ? 's' : ''} below sub target today`, detail: 'Check daily conversions', href: '/admin/conversions' })
  }
  if (unmappedCount > 0) {
    attention.push({ key: 'unmapped', severity: 'amber', icon: Link2, label: `${unmappedCount} unmapped Infloww creator${unmappedCount > 1 ? 's' : ''}`, detail: 'Link them to a profile', href: '/admin/creators' })
  }
  if (staleCreators > 0) {
    attention.push({ key: 'stale', severity: 'neutral', icon: RefreshCw, label: `${staleCreators} creator${staleCreators > 1 ? 's' : ''} not scraped in 3+ days`, detail: 'Run a scrape to refresh', href: '/admin/creators' })
  }

  const sevColor = (s: Attn['severity']) =>
    s === 'red' ? (isLight ? 'text-red-600 bg-red-500/10' : 'text-red-400 bg-red-500/12')
    : s === 'amber' ? (isLight ? 'text-amber-600 bg-amber-500/10' : 'text-amber-400 bg-amber-500/12')
    : (isLight ? 'text-black/45 bg-black/[0.05]' : 'text-white/45 bg-white/[0.06]')

  const quickActions = [
    { label: 'Creators', icon: Users, href: '/admin/creators' },
    { label: 'Conversions', icon: TrendingUp, href: '/admin/conversions' },
    { label: 'Revenue', icon: DollarSign, href: '/admin/revenue' },
    ...(isSuperAdmin ? [{ label: 'Social Accounts', icon: BarChart3, href: '/admin/social-accounts' }] : []),
    { label: 'Domains', icon: Globe, href: '/admin/domains' },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className={`text-xl font-semibold tracking-tight ${textPrimary}`}>Overview</h1>
          {displayName && <p className={`text-[13px] mt-0.5 ${textTertiary}`}>Welcome back, {displayName.split(' ')[0]}.</p>}
        </div>
        {isSuperAdmin && (
          <button
            onClick={scrapeAll}
            disabled={scraping}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-200 disabled:opacity-60 ${
              isLight ? 'bg-black/[0.04] text-black/60 border border-black/[0.08] hover:text-black/90 hover:bg-black/[0.06]'
                      : 'bg-white/[0.05] text-white/60 border border-white/[0.08] hover:text-white/90 hover:bg-white/[0.08]'
            }`}
          >
            {scraping ? <Spinner size={14} /> : <RefreshCw className="w-3.5 h-3.5" />}
            {scraping
              ? (scrapeProgress ? `Scraping ${scrapeProgress.completed}/${scrapeProgress.total}…` : 'Starting…')
              : 'Scrape all accounts'}
          </button>
        )}
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(k => {
          const Icon = k.icon
          return (
            <Link key={k.label} href={k.href}>
              <Card hover className="p-4 h-full">
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isLight ? 'bg-black/[0.05] text-black/50' : 'bg-white/[0.06] text-white/55'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <TrendChip value={k.trend} />
                </div>
                <p className={`text-2xl font-semibold tracking-tight ${textPrimary}`}>{k.value}</p>
                <p className={`text-[11px] mt-1 ${textTertiary}`}>{k.label}</p>
                <p className={`text-[10px] mt-0.5 ${textTertiary}`}>{k.sub}</p>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Needs attention + Quick actions */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className={`text-[13px] font-semibold uppercase tracking-wider ${textTertiary}`}>Needs attention</h2>
            {attention.length > 0 && (
              <span className={`text-[11px] px-2 py-0.5 rounded-full ${isLight ? 'bg-black/[0.05] text-black/45' : 'bg-white/[0.06] text-white/45'}`}>{attention.length}</span>
            )}
          </div>
          {attention.length === 0 ? (
            <div className={`flex items-center gap-2 py-6 justify-center ${textTertiary}`}>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-[13px]">All clear — nothing needs attention.</span>
            </div>
          ) : (
            <div className="space-y-1.5">
              {attention.map(a => {
                const Icon = a.icon
                return (
                  <Link
                    key={a.key}
                    href={a.href}
                    className={`flex items-center gap-3 p-2.5 rounded-lg transition-all duration-200 group ${isLight ? 'hover:bg-black/[0.03]' : 'hover:bg-white/[0.04]'}`}
                  >
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${sevColor(a.severity)}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={`text-[12.5px] font-medium truncate ${textPrimary}`}>{a.label}</p>
                      <p className={`text-[11px] truncate ${textTertiary}`}>{a.detail}</p>
                    </div>
                    <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:translate-x-0.5 ${textTertiary}`} />
                  </Link>
                )
              })}
            </div>
          )}
        </Card>

        {/* Quick actions */}
        <Card className="p-5">
          <h2 className={`text-[13px] font-semibold uppercase tracking-wider mb-3 ${textTertiary}`}>Quick actions</h2>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map(q => {
              const Icon = q.icon
              return (
                <Link
                  key={q.label}
                  href={q.href}
                  className={`flex flex-col items-start gap-2 p-3 rounded-lg border transition-all duration-200 ${
                    isLight ? 'border-black/[0.06] hover:border-black/[0.12] hover:bg-black/[0.03]' : 'border-white/[0.08] hover:border-white/[0.16] hover:bg-white/[0.05]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${textSecondary}`} />
                  <span className={`text-[12px] font-medium ${textPrimary}`}>{q.label}</span>
                </Link>
              )
            })}
          </div>
          <div className={`mt-4 pt-3 border-t text-[11px] ${isLight ? 'border-black/[0.06] text-black/35' : 'border-white/[0.06] text-white/35'}`}>
            {activeCreators} active creators · {creatorsWithSocial} with social tracking
          </div>
        </Card>
      </div>
    </div>
  )
}
