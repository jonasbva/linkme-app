import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { requireUser, guardResponse } from '@/lib/auth'
import { rebuildRevenueCache, resolveRevenueRange } from '@/lib/revenue-cache'

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

// ─── GET — read from cache, optionally rebuild if stale/missing ─────
export async function GET(req: NextRequest) {
  const gate = await requireUser()
  if (!gate.ok) return guardResponse(gate)

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
    // Rebuild in-process (no internal HTTP hop / shared secret).
    const rebuild = await rebuildRevenueCache(resolved.fromMs, resolved.toMs)
    if (rebuild.ok) {
      cached = await readCache()
    } else if (!cached) {
      return NextResponse.json(
        { error: rebuild.error, totals: null, fetchedAt: null },
        { status: 502 }
      )
    }
    // else: rebuild failed but we have stale cache — fall through and serve it.
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
// Any admin may refresh (the traffic team relies on live revenue); the
// in-process rebuild is internally rate-limited against the Infloww API.
export async function POST(req: NextRequest) {
  const gate = await requireUser()
  if (!gate.ok) return guardResponse(gate)

  const { searchParams } = new URL(req.url)
  const { fromMs, toMs } = resolveRevenueRange(searchParams)

  const result = await rebuildRevenueCache(fromMs, toMs)
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }
  return NextResponse.json(result)
}
