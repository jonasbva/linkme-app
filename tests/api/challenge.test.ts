import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

const mock = vi.hoisted(() => ({
  gate: { ok: true, user: { id: 'reviewer', is_super_admin: false } } as any,
  load: vi.fn(async () => ({ racers: [] })),
}))
vi.mock('@/lib/auth', () => ({
  guardResponse: (r: any) => NextResponse.json({ error: r.error }, { status: r.status }),
}))
vi.mock('@/lib/challenge/access', () => ({ requireChallengeAccess: async () => mock.gate }))
vi.mock('@/lib/challenge/load', () => ({ loadRace: mock.load }))
import { GET } from '@/app/api/admin/challenge/route'
const request = (query = '') => new NextRequest(`http://localhost/api/admin/challenge${query}`)

beforeEach(() => {
  vi.clearAllMocks()
  mock.gate = { ok: true, user: { id: 'reviewer', is_super_admin: false } }
  mock.load.mockResolvedValue({ racers: [] })
})
describe('Challenge API access and reports', () => {
  it('rejects unauthenticated requests before querying any challenge data', async () => {
    mock.gate = { ok: false, status: 401, error: 'Unauthorized' }
    expect((await GET(request())).status).toBe(401)
    expect(mock.load).not.toHaveBeenCalled()
  })
  it('rejects deactivated accounts', async () => {
    mock.gate = { ok: false, status: 403, error: 'Forbidden' }
    expect((await GET(request())).status).toBe(403)
    expect(mock.load).not.toHaveBeenCalled()
  })
  it('uses the authorized guard identity and prevents caching', async () => {
    const response = await GET(request())
    expect(response.status).toBe(200)
    expect(response.headers.get('Cache-Control')).toBe('private, no-store')
    expect(mock.load).toHaveBeenCalledWith({ id: 'reviewer', is_super_admin: false }, undefined)
  })
  it.each(['2026-10-31', '2026-12-01', '2026-11-31', 'garbage'])('rejects invalid report cutoff %s', async cutoff => {
    expect((await GET(request(`?asOf=${cutoff}`))).status).toBe(400)
    expect(mock.load).not.toHaveBeenCalled()
  })
  it('does not expose database internals on failure', async () => {
    mock.load.mockRejectedValue(new Error('private database details'))
    const response = await GET(request())
    expect(response.status).toBe(500)
    expect(await response.text()).not.toContain('private database details')
  })
})
