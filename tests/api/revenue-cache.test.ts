import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
const mocks = vi.hoisted(() => ({ read: vi.fn(), rebuild: vi.fn() }))
vi.mock('@/lib/auth', () => ({ requireUser: async () => ({ ok: true, user: { id: 'u', is_super_admin: true } }), guardResponse: (r: any) => NextResponse.json({ error: r.error }, { status: r.status }) }))
vi.mock('@/lib/supabase', () => ({ createServerSupabaseClient: () => ({ from: () => ({ select: () => ({ eq: () => ({ single: mocks.read }) }) }) }) }))
vi.mock('@/lib/revenue-cache', async importOriginal => ({ ...await importOriginal<any>(), rebuildRevenueCache: mocks.rebuild }))
import { GET, POST, maxDuration } from '@/app/api/admin/revenue/cache/route'
import { buildCacheKey } from '@/lib/revenue-cache'
const payload = { totals: { totalTurnover: 12 }, creators: [{ name: 'Test', totalRevenue: 12 }] }
const request = (method: string) => new NextRequest('https://example.com/api/admin/revenue/cache?from=1000&to=2000', { method })
describe('revenue cache loading', () => {
  beforeEach(() => vi.resetAllMocks())
  it('keeps range identity stable across a slow request', () => {
    expect(buildCacheKey(1000, 2000, 2001)).toBe(buildCacheKey(1000, 2000, 999999))
  })
  it('allows enough time for paged agency pulls', () => expect(maxDuration).toBe(300))
  it('serves existing revenue without a rebuild', async () => {
    mocks.read.mockResolvedValue({ data: { data: payload, fetched_at: new Date().toISOString() } })
    expect((await (await GET(request('GET'))).json()).totals.totalTurnover).toBe(12)
    expect(mocks.rebuild).not.toHaveBeenCalled()
  })
  it('returns freshly rebuilt data on a cache miss', async () => {
    mocks.read.mockResolvedValueOnce({ data: null }).mockResolvedValueOnce({ data: { data: payload } })
    mocks.rebuild.mockResolvedValue({ ok: true, cacheKey: 'rng:1000-2000' })
    expect((await (await GET(request('GET'))).json()).creators).toHaveLength(1)
    expect(mocks.rebuild).toHaveBeenCalledTimes(1)
  })
  it('returns the refreshed payload directly, avoiding a second rebuild', async () => {
    mocks.rebuild.mockResolvedValue({ ok: true, cacheKey: 'rng:1000-2000' })
    mocks.read.mockResolvedValue({ data: { data: payload } })
    expect((await (await POST(request('POST'))).json()).totals.totalTurnover).toBe(12)
    expect(mocks.rebuild).toHaveBeenCalledTimes(1)
  })
  it('reports upstream errors instead of an empty success', async () => {
    mocks.read.mockResolvedValue({ data: null })
    mocks.rebuild.mockResolvedValue({ ok: false, status: 502, error: 'Infloww unavailable' })
    const res = await GET(request('GET'))
    expect(res.status).toBe(502)
    expect((await res.json()).error).toBe('Infloww unavailable')
  })
  it('explains disabled fetching on manual refresh', async () => {
    mocks.rebuild.mockResolvedValue({ ok: true, skipped: true, reason: 'fetching_disabled' })
    expect((await POST(request('POST'))).status).toBe(409)
  })
})
