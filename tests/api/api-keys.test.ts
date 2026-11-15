import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'node:crypto'

const mocks = vi.hoisted(() => ({
  gate: vi.fn(), client: vi.fn(), from: vi.fn(),
  responses: {} as Record<string, any>,
  queries: [] as { table: string; calls: { method: string; args: any[] }[] }[],
}))

vi.mock('@/lib/auth', () => ({
  requireSuperAdmin: mocks.gate,
  guardResponse: (gate: any) => NextResponse.json({ error: gate.error }, { status: gate.status }),
}))
vi.mock('@/lib/supabase', () => ({ createServerSupabaseClient: mocks.client }))

import { GET, POST, DELETE } from '@/app/api/admin/api-keys/route'
import { API_KEY_FIELDS, API_USER_FIELDS, runWithApiPrincipal } from '@/lib/api-access'

const owner = { id: '11111111-1111-4111-8111-111111111111', display_name: 'Jonas', email: 'owner@example.test', is_super_admin: true }
const target = { id: '22222222-2222-4222-8222-222222222222', display_name: 'Marlon', email: 'marlon@example.test', is_active: true, is_super_admin: false }
const key = {
  id: '33333333-3333-4333-8333-333333333333', name: 'Marlon', prefix: 'bva_api_prefix',
  user_id: target.id, created_at: '2026-11-15T12:00:00.000Z',
  expires_at: '2027-02-13T12:00:00.000Z', revoked_at: null, last_used_at: null,
}

function request(method: string, body?: unknown, headers: Record<string, string> = {}, query = '') {
  return new NextRequest(`https://dashboard.test/api/admin/api-keys${query}`, {
    method,
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    headers: { 'content-type': 'application/json', ...headers },
  })
}
const creation = () => ({ name: 'Marlon', user_id: target.id, expires_in_days: 90 })

beforeEach(() => {
  vi.clearAllMocks()
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'
  mocks.gate.mockResolvedValue({ ok: true, user: owner })
  mocks.queries.length = 0
  mocks.responses = {
    dashboard_api_keys: { data: key, error: null },
    admin_users: { data: target, error: null },
    dashboard_api_requests: { data: [], error: null },
  }
  mocks.from.mockImplementation((table: string) => {
    const query = { table, calls: [] as { method: string; args: any[] }[] }
    mocks.queries.push(query)
    const chain: any = {}
    for (const method of ['select', 'order', 'limit', 'eq', 'is', 'insert', 'update']) {
      chain[method] = (...args: any[]) => { query.calls.push({ method, args }); return chain }
    }
    chain.single = () => Promise.resolve(mocks.responses[table])
    chain.then = (resolve: (result: any) => any, reject: (error: unknown) => any) =>
      Promise.resolve(mocks.responses[table]).then(resolve, reject)
    return chain
  })
  mocks.client.mockReturnValue({ from: mocks.from })
})

describe('API key administration authorization', () => {
  it.each([GET, POST, DELETE])('requires a current super-admin dashboard session', async handler => {
    mocks.gate.mockResolvedValue({ ok: false, status: 403, error: 'Forbidden' })
    const response = await handler(request(handler === GET ? 'GET' : handler === POST ? 'POST' : 'DELETE', handler === POST ? creation() : undefined))
    expect(response.status).toBe(403)
    expect(mocks.client).not.toHaveBeenCalled()
  })

  it('rejects requests with an Authorization header even when a dashboard session exists', async () => {
    const response = await POST(request('POST', creation(), { authorization: `Bearer bva_api_${'A'.repeat(43)}` }))
    expect(response.status).toBe(403)
    expect(mocks.gate).not.toHaveBeenCalled()
    expect(mocks.client).not.toHaveBeenCalled()
  })

  it('cannot mint successor keys from a super-admin API request context', async () => {
    const response = await runWithApiPrincipal({ keyId: key.id, user: owner }, () => POST(request('POST', creation())))
    expect(response.status).toBe(403)
    expect(mocks.gate).not.toHaveBeenCalled()
    expect(mocks.client).not.toHaveBeenCalled()
  })

  it('rejects cross-origin cookie requests before querying the database', async () => {
    const response = await POST(request('POST', creation(), { origin: 'https://attacker.test' }))
    expect(response.status).toBe(403)
    expect(mocks.gate).not.toHaveBeenCalled()
    expect(mocks.client).not.toHaveBeenCalled()
  })

  it('fails closed when the service-role credential is missing', async () => {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY
    const response = await GET(request('GET'))
    expect(response.status).toBe(403)
    expect(mocks.client).not.toHaveBeenCalled()
  })
})

describe('GET /api/admin/api-keys', () => {
  it('selects only safe metadata and joins the assigned user without returning token hashes', async () => {
    mocks.responses.dashboard_api_keys.data = [key]
    mocks.responses.admin_users.data = [target]
    mocks.responses.dashboard_api_requests.data = [{ id: 'audit-1', key_id: key.id, method: 'PATCH', path: '/api/v1/creators/:id', status: 200, created_at: key.created_at }]
    const response = await GET(request('GET'))
    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe('no-store')
    expect(await response.json()).toEqual({ keys: [{ ...key, user: target }], users: [target], recentRequests: mocks.responses.dashboard_api_requests.data })
    expect(mocks.queries.find(q => q.table === 'dashboard_api_keys')?.calls).toContainEqual({ method: 'select', args: [API_KEY_FIELDS] })
    expect(mocks.queries.find(q => q.table === 'admin_users')?.calls).toContainEqual({ method: 'select', args: [API_USER_FIELDS] })
    expect(API_KEY_FIELDS).not.toContain('key_hash')
    expect(API_USER_FIELDS).not.toContain('password')
  })

  it('returns a migration hint when the database schema is unavailable, without internal details', async () => {
    mocks.responses.dashboard_api_keys = { data: null, error: { message: 'secret database details' } }
    const response = await GET(request('GET'))
    expect(response.status).toBe(503)
    const body = await response.text()
    expect(body).toContain('migration')
    expect(body).not.toContain('secret database details')
  })
})

describe('POST /api/admin/api-keys', () => {
  it('issues a one-time token and stores its hash, issuer, user and expiration', async () => {
    const before = Date.now()
    const response = await POST(request('POST', { ...creation(), name: '  Marlon  ' }))
    const after = Date.now()
    expect(response.status).toBe(201)
    expect(response.headers.get('cache-control')).toBe('no-store')
    const body = await response.json()
    expect(body.key).toEqual({ ...key, user: target })
    expect(body.token).toMatch(/^bva_api_[A-Za-z0-9_-]{43}$/)
    const inserted = mocks.queries.find(q => q.table === 'dashboard_api_keys')?.calls.find(c => c.method === 'insert')?.args[0]
    expect(inserted).toMatchObject({ name: 'Marlon', user_id: target.id, created_by: owner.id })
    expect(inserted.key_hash).toBe(createHash('sha256').update(body.token).digest('hex'))
    expect(inserted.prefix).toBe(body.token.slice(0, 16))
    expect(JSON.stringify(inserted)).not.toContain(body.token)
    expect(Date.parse(inserted.expires_at)).toBeGreaterThanOrEqual(before + 90 * 86400000)
    expect(Date.parse(inserted.expires_at)).toBeLessThanOrEqual(after + 90 * 86400000)
  })

  it.each([
    { name: '' }, { name: ' '.repeat(3) }, { name: 'x'.repeat(81) },
    { user_id: 'not-a-uuid' }, { expires_in_days: 0 }, { expires_in_days: 366 },
    { expires_in_days: 1.5 }, { expires_in_days: '90' }, { permissions: ['admin'] },
  ])('rejects invalid key settings before database access: %j', async override => {
    const response = await POST(request('POST', { ...creation(), ...override }))
    expect(response.status).toBe(400)
    expect(mocks.client).not.toHaveBeenCalled()
  })

  it('rejects invalid JSON and non-JSON bodies', async () => {
    const invalidJson = new NextRequest('https://dashboard.test/api/admin/api-keys', { method: 'POST', body: '{', headers: { 'content-type': 'application/json' } })
    expect((await POST(invalidJson)).status).toBe(400)
    expect((await POST(request('POST', creation(), { 'content-type': 'text/plain' }))).status).toBe(415)
    expect(mocks.client).not.toHaveBeenCalled()
  })

  it('does not issue a key for an inactive user', async () => {
    mocks.responses.admin_users = { data: { ...target, is_active: false }, error: null }
    const response = await POST(request('POST', creation()))
    expect(response.status).toBe(400)
    expect(mocks.queries.map(q => q.table)).toEqual(['admin_users'])
  })

  it('does not reveal a generated token when persisting the hash fails', async () => {
    mocks.responses.dashboard_api_keys = { data: null, error: { message: 'secret database details' } }
    const response = await POST(request('POST', creation()))
    expect(response.status).toBe(503)
    const body = await response.json()
    expect(body).not.toHaveProperty('token')
    expect(JSON.stringify(body)).not.toContain('secret database details')
  })
})

describe('DELETE /api/admin/api-keys', () => {
  it('soft-revokes the specified key while preserving earlier revocation and audit records', async () => {
    const response = await DELETE(request('DELETE', undefined, {}, `?id=${key.id}`))
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ ok: true })
    const query = mocks.queries[0]
    expect(query.table).toBe('dashboard_api_keys')
    expect(query.calls).toContainEqual({ method: 'eq', args: ['id', key.id] })
    expect(query.calls).toContainEqual({ method: 'is', args: ['revoked_at', null] })
    const updated = query.calls.find(c => c.method === 'update')?.args[0]
    expect(Object.keys(updated)).toEqual(['revoked_at'])
    expect(Number.isNaN(Date.parse(updated.revoked_at))).toBe(false)
    expect(mocks.queries.map(q => q.table)).not.toContain('dashboard_api_requests')
  })

  it('rejects invalid IDs without mutation', async () => {
    const response = await DELETE(request('DELETE', undefined, {}, '?id=all'))
    expect(response.status).toBe(400)
    expect(mocks.client).not.toHaveBeenCalled()
  })

  it('reports revocation failure without exposing database details', async () => {
    mocks.responses.dashboard_api_keys = { data: null, error: { message: 'secret database details' } }
    const response = await DELETE(request('DELETE', undefined, {}, `?id=${key.id}`))
    expect(response.status).toBe(503)
    expect(await response.text()).not.toContain('secret database details')
  })
})
