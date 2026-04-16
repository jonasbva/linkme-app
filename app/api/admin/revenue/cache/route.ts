import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase'

function isAdmin() {
  const cookieStore = cookies()
  return cookieStore.get('admin_auth')?.value === 'true'
}

// ─── Cache key logic ────────────────────────────────────────────────
// Historical: rng:${fromMs}-${toMs}
// Live  (end within 2 min of now): live:${fromMs}-${toBucketedMs}  (to floored to minute)
//
// Backward-compat keys still supported: 'today' and 'YYYY-MM-DD'
const LIVE_WINDOW_MS = 2 * 60 * 1000
const LIVE_BUCKET_MS = 60 * 1000
const LIVE_STALE_MS = 10 * 60 * 1000 // auto-rebuild live cache if older than this

function floorToMinute(ms: number): number {
  return Math.floor(ms / LIVE_BUCKET_MS) * LIVE_BUCKET_MS
}

function isLiveRange(toMs: number, nowMs: number): boolean {
  return Math.abs(nowMs - toMs) <= LIVE_WINDOW_MS
}

function buildCacheKey(fromMs: number, toMs: number, nowMs: number): string {
  if (isLiveRange(toMs, nowMs)) return `live:${fromMs}-${floorToMinute(toMs)}`
  return `rng:${fromMs}-${toMs}`
}

function parseMaybeMs(v: string | null): number | null {
  if (!v) return null
  if (/^\d+$/.test(v)) return parseInt(v, 10)
  const t = Date.parse(v)
  return Number.isFinite(t) ? t : null
}

function pad(n: number) { return String(n).padStart(2, '0') }
function localYmd(d: Date) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` }

type ResolvedRange =
  | { kind: 'range'; fromMs: number; toMs: number; cacheKey: string; isLive: boolean }
  | { kind: 'legacy'; cacheKey: string; fromMs: number; toMs: number; isLive: boolean }

function resolveRange(searchParams: URLSearchParams): ResolvedRange | null {
  const now = new Date()
  const nowMs = now.getTime()
  const fromParam = parseMaybeMs(searchParams.get('from'))
  const toParam = parseMaybeMs(searchParams.get('to'))
  const keyParam = searchParams.get('key')

  if (fromParam !== null && toParam !== null) {
    const isLive = isLiveRange(toParam, nowMs)
    return { kind: 'range', fromMs: fromParam, toMs: toParam, cacheKey: buildCacheKey(fromParam, toParam, nowMs), isLive }
  }

  if (keyParam === 'today') {
    const startOfDay = new Date(now); startOfDay.setHours(0, 0, 0, 0)
    const fromMs = startOfDay.getTime()
    const toMs = nowMs
    return { kind: 'legacy', cacheKey: 'today', fromMs, toMs, isLive: true }
  }

  if (keyParam && /^\d{4}-\d{2}-\d{2}$/.test(keyParam)) {
    const startOfDay = new Date(keyParam + 'T00:00:00')
    const endOfDay = new Date(keyParam + 'T23:59:59.999')
    const todayStr = localYmd(now)
    const fromMs = startOfDay.getTime()
    const toMs = keyParam === todayStr ? nowMs : endOfDay.getTime()
    const isLive = keyParam === todayStr
    return { kind: 'legacy', cacheKey: keyParam, fromMs, toMs, isLive }
  }

  return null
}

async function triggerRebuild(baseUrl: string, fromMs: number, toMs: number): Promise<void> {
  const cronSecret = process.env.CRON_SECRET || ''
  const qs = new URLSearchParams({ from: String(fromMs), to: String(toMs) }).toString()
  const res = await fetch(`${baseUrl}/api/cron/revenue-cache?${qs}`, {
    headers: { Authorization: `Bearer ${cronSecret}` },
    cache: 'no-store',
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as any).error || `Rebuild failed: HTTP ${res.status}`)
  }
}

// ─── GET — read from cache, optionally rebuild if stale/missing ─────
export async function GET(req: NextRequest) {
  if (!isAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const resolved = resolveRange(searchParams) ?? resolveRange(new URLSearchParams({ key: 'today' }))!

  const supabase = createServerSupabaseClient()

  const readCache = async () => {
    const { data } = await supabase
      .from('revenue_cache')
      .select('data, fetched_at')
      .eq('cache_key', resolved.cacheKey)
      .single()
    return data
  }

  let cached = await readCache()

  const nowMs = Date.now()
  const cachedAgeMs = cached?.fetched_at ? nowMs - new Date(cached.fetched_at).getTime() : Infinity
  const staleLive = resolved.isLive && cachedAgeMs > LIVE_STALE_MS

  if (!cached || staleLive) {
    try {
      await triggerRebuild(req.nextUrl.origin, resolved.fromMs, resolved.toMs)
      cached = await readCache()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Rebuild failed'
      if (!cached) {
        return NextResponse.json(
          { error: msg, totals: null, fetchedAt: null },
          { status: 502 }
        )
      }
      // Fall through — serve stale cache if rebuild fails
    }
  }

  if (!cached) {
    return NextResponse.json({ error: 'No cached data. Click refresh to fetch.', totals: null, fetchedAt: null })
  }

  return NextResponse.json({
    ...cached.data,
    fetchedAt: cached.fetched_at,
    cacheKey: resolved.cacheKey,
  })
}

// ─── POST — trigger a manual cache refresh ──────────────────────────
export async function POST(req: NextRequest) {
  if (!isAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const resolved = resolveRange(searchParams)

  const baseUrl = req.nextUrl.origin
  const cronSecret = process.env.CRON_SECRET || ''

  // Build the cron URL: prefer from/to if given, else legacy ?date=YYYY-MM-DD for BC
  let cronUrl = `${baseUrl}/api/cron/revenue-cache`
  if (resolved) {
    const qs = new URLSearchParams({ from: String(resolved.fromMs), to: String(resolved.toMs) }).toString()
    cronUrl = `${cronUrl}?${qs}`
  } else {
    // Legacy: accept ?date=YYYY-MM-DD passthrough
    const dateParam = searchParams.get('date')
    if (dateParam) cronUrl = `${cronUrl}?date=${encodeURIComponent(dateParam)}`
  }

  const res = await fetch(cronUrl, {
    headers: { Authorization: `Bearer ${cronSecret}` },
    cache: 'no-store',
  })

  const result = await res.json()

  if (!res.ok) {
    return NextResponse.json({ error: result.error || 'Failed to refresh' }, { status: 500 })
  }

  return NextResponse.json(result)
}
