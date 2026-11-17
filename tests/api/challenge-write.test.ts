import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import { PARTICIPANTS } from '@/lib/challenge/config'

const mock = vi.hoisted(() => ({ admin: vi.fn(), load: vi.fn(), save: vi.fn() }))
vi.mock('@/lib/auth', () => ({
  requireSuperAdmin: mock.admin,
  guardResponse: (r: any) => NextResponse.json({ error: r.error }, { status: r.status }),
}))
vi.mock('@/lib/challenge/store', () => ({
  loadChallengeConfiguration: mock.load, updateChallengeConfiguration: mock.save,
  ChallengeUpdateError: class extends Error { constructor(message: string, public status: number) { super(message) } },
}))
vi.mock('@/lib/challenge/load', () => ({ loadRace: vi.fn() }))
import { ChallengeUpdateError } from '@/lib/challenge/store'
import { PATCH as batch } from '@/app/api/admin/challenge/route'
import { GET, PATCH } from '@/app/api/admin/challenge/[id]/route'

const id = PARTICIPANTS[3].id
const context = { params: { id } }
const request = (body: unknown) => new NextRequest('http://localhost/api/admin/challenge/' + id, {
  method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
})
beforeEach(() => {
  vi.resetAllMocks()
  mock.admin.mockResolvedValue({ ok: true, user: { id: 'admin', is_super_admin: true } })
  mock.load.mockResolvedValue({ revision: 3, participants: structuredClone(PARTICIPANTS) })
  mock.save.mockResolvedValue({ revision: 4, participants: structuredClone(PARTICIPANTS) })
})
describe('Challenge configuration permission and write boundary', () => {
  it.each([401, 403])('rejects configuration reads and writes with %s before accessing storage', async status => {
    mock.admin.mockResolvedValue({ ok: false, status, error: 'Forbidden' })
    expect((await GET(request({}), context)).status).toBe(status)
    expect((await PATCH(request({ expectedRevision: 3, target: 7000 }), context)).status).toBe(status)
    expect((await batch(request({ expectedRevision: 3, participants: [{ id, target: 7000 }] }))).status).toBe(status)
    expect(mock.load).not.toHaveBeenCalled()
    expect(mock.save).not.toHaveBeenCalled()
  })
  it('returns the current revision and full manager settings without caching', async () => {
    const response = await GET(request({}), context)
    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toContain('no-store')
    expect(await response.json()).toEqual({ revision: 3, participant: PARTICIPANTS[3] })
  })
  it('returns 404 for an unenrolled manager and hides storage errors', async () => {
    expect((await GET(request({}), { params: { id: '11111111-1111-4111-8111-111111111111' } })).status).toBe(404)
    mock.load.mockRejectedValue(new Error('private database detail'))
    const response = await GET(request({}), context)
    expect(response.status).toBe(500)
    expect(await response.text()).not.toContain('private database detail')
  })
  it('validates the admin route too, including malformed JSON and immutable fields', async () => {
    const malformed = new NextRequest('http://localhost/api/admin/challenge', { method: 'PATCH', body: '{' })
    expect((await PATCH(malformed, context)).status).toBe(400)
    expect((await PATCH(request({ expectedRevision: 3, bonus: 999 }), context)).status).toBe(400)
    expect((await PATCH(request({ expectedRevision: 3, target: 0 }), context)).status).toBe(400)
    expect(mock.save).not.toHaveBeenCalled()
  })
  it('saves a single-manager patch under the authorized identity', async () => {
    const response = await PATCH(request({ expectedRevision: 3, target: 7096, baseline: 4580 }), context)
    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toContain('no-store')
    expect(mock.save).toHaveBeenCalledWith({ expectedRevision: 3, participants: [{ id, target: 7096, baseline: 4580 }] }, 'admin')
  })
  it('passes both managers in one batch to the atomic storage operation', async () => {
    const body = { expectedRevision: 3, participants: [{ id: PARTICIPANTS[2].id, target: 17895 }, { id, target: 7096 }] }
    const response = await batch(request(body))
    expect(response.status).toBe(200)
    expect(mock.save).toHaveBeenCalledOnce()
    expect(mock.save).toHaveBeenCalledWith(body, 'admin')
  })
  it.each([400, 404, 409] as const)('preserves a safe storage rejection with status %s', async status => {
    mock.save.mockRejectedValue(new ChallengeUpdateError('Safe explanation', status))
    const response = await PATCH(request({ expectedRevision: 3, target: 7096 }), context)
    expect(response.status).toBe(status)
    expect(await response.json()).toEqual({ error: 'Safe explanation' })
  })
  it('does not expose database details on save failure', async () => {
    mock.save.mockRejectedValue(new Error('private database detail'))
    const response = await PATCH(request({ expectedRevision: 3, target: 7096 }), context)
    expect(response.status).toBe(500)
    expect(await response.text()).not.toContain('private database detail')
  })
})
