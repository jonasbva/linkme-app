import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createHash } from 'node:crypto'

const { rpc, insert, client } = vi.hoisted(() => {
  const rpc = vi.fn()
  const insert = vi.fn()
  const client = vi.fn(() => ({ rpc, from: vi.fn(() => ({ insert })) }))
  return { rpc, insert, client }
})

vi.mock('@/lib/supabase', () => ({ createServerSupabaseClient: client }))

import {
  authenticateApiRequest, generateApiToken, hashApiToken,
  recordApiRequest, runWithApiPrincipal,
} from '@/lib/api-access'
import { getApiPrincipal, type ApiPrincipal } from '@/lib/api-principal'
import { getSessionUser, requireUser } from '@/lib/auth'

const token = `bva_api_${'A'.repeat(43)}`
const row = {
  key_id: 'key-1', user_id: 'user-1', email: 'marlon@example.test',
  display_name: 'Marlon', is_super_admin: false, rate_limited: false,
}
const principal: ApiPrincipal = {
  keyId: row.key_id,
  user: { id: row.user_id, email: row.email, display_name: row.display_name, is_super_admin: false },
}

function request(authorization?: string, url = 'https://dashboard.test/api/v1/creators') {
  return new Request(url, { headers: authorization === undefined ? {} : { authorization } })
}

describe('dashboard API bearer authentication', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'
    rpc.mockResolvedValue({ data: [row], error: null })
  })

  it.each([
    undefined, '', 'Basic dXNlcjpwYXNz', `Bearer ${'A'.repeat(43)}`,
    `Bearer bva_api_${'A'.repeat(42)}`, `Bearer bva_api_${'A'.repeat(44)}`,
    `Bearer ${token} extra`, 'Bearer bva_mgmt_readonly',
  ])('rejects missing or malformed header without database access: %s', async header => {
    expect(await authenticateApiRequest(request(header))).toMatchObject({ ok: false, status: 401 })
    expect(client).not.toHaveBeenCalled()
  })

  it('does not accept a cookie, query token or API-key header as write credentials', async () => {
    const req = new Request(`https://dashboard.test/api/v1/creators?token=${token}`, {
      headers: { cookie: 'admin_session=valid-session', 'x-api-key': token },
    })
    expect(await authenticateApiRequest(req)).toMatchObject({ ok: false, status: 401 })
    expect(client).not.toHaveBeenCalled()
  })

  it('sends only a SHA-256 digest to the atomic database verifier', async () => {
    expect(await authenticateApiRequest(request(`Bearer ${token}`))).toEqual({ ok: true, principal })
    expect(rpc).toHaveBeenCalledTimes(1)
    expect(rpc).toHaveBeenCalledWith('consume_dashboard_api_key', {
      p_key_hash: createHash('sha256').update(token).digest('hex'),
    })
    expect(JSON.stringify(rpc.mock.calls)).not.toContain(token)
  })

  it('uses the current database super-admin flag rather than trusting key text', async () => {
    rpc.mockResolvedValueOnce({ data: [{ ...row, is_super_admin: true }], error: null })
    expect(await authenticateApiRequest(request(`Bearer ${token}`))).toMatchObject({
      ok: true, principal: { user: { is_super_admin: true } },
    })
    expect(await authenticateApiRequest(request(`Bearer ${token}`))).toMatchObject({
      ok: true, principal: { user: { is_super_admin: false } },
    })
  })

  it('rejects revoked, expired, deactivated or unknown keys when the verifier returns no row', async () => {
    rpc.mockResolvedValue({ data: [], error: null })
    expect(await authenticateApiRequest(request(`Bearer ${token}`))).toMatchObject({ ok: false, status: 401 })
  })

  it('reports the database rate limit as 429 without exposing a principal', async () => {
    rpc.mockResolvedValue({ data: [{ ...row, rate_limited: true }], error: null })
    const response = await authenticateApiRequest(request(`Bearer ${token}`))
    expect(response).toMatchObject({ ok: false, status: 429 })
    expect(response).not.toHaveProperty('principal')
  })

  it('fails closed when only a public Supabase credential is configured', async () => {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY
    expect(await authenticateApiRequest(request(`Bearer ${token}`))).toMatchObject({ ok: false, status: 503 })
    expect(client).not.toHaveBeenCalled()
  })

  it.each(['database-error', 'network-error'])('redacts internal errors on %s', async kind => {
    const secret = 'secret database details'
    if (kind === 'database-error') rpc.mockResolvedValue({ data: null, error: { message: secret } })
    else rpc.mockRejectedValue(new Error(secret))
    const response = await authenticateApiRequest(request(`Bearer ${token}`))
    expect(response).toMatchObject({ ok: false, status: 503 })
    expect(JSON.stringify(response)).not.toContain(secret)
    expect(JSON.stringify(response)).not.toContain(token)
  })
})

describe('API key generation and request attribution', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('generates independent 256-bit keys and retains only the hash and public prefix', () => {
    const first = generateApiToken()
    const second = generateApiToken()
    expect(first.token).toMatch(/^bva_api_[A-Za-z0-9_-]{43}$/)
    expect(second.token).not.toBe(first.token)
    expect(first.hash).toBe(hashApiToken(first.token))
    expect(first.hash).toMatch(/^[a-f0-9]{64}$/)
    expect(first.prefix).toBe(first.token.slice(0, 16))
    expect(first.prefix).not.toBe(first.token)
  })

  it('isolates concurrent principals and removes the context after requests complete', async () => {
    const second = { ...principal, keyId: 'key-2', user: { ...principal.user, id: 'user-2' } }
    let release!: () => void
    const barrier = new Promise<void>(resolve => { release = resolve })
    const firstRequest = runWithApiPrincipal(principal, async () => {
      expect(getApiPrincipal()).toEqual(principal)
      await barrier
      return getApiPrincipal()
    })
    const secondRequest = runWithApiPrincipal(second, async () => {
      expect(getApiPrincipal()).toEqual(second)
      release()
      await Promise.resolve()
      return getApiPrincipal()
    })
    expect(await Promise.all([firstRequest, secondRequest])).toEqual([principal, second])
    expect(getApiPrincipal()).toBeUndefined()
  })

  it('makes existing dashboard guards use the API principal without requiring a cookie session', async () => {
    await runWithApiPrincipal(principal, async () => {
      expect(await getSessionUser()).toEqual(principal.user)
      expect(await requireUser()).toEqual({ ok: true, user: principal.user })
    })
  })

  it('writes attributed request metadata without credentials, bodies or query strings', async () => {
    insert.mockResolvedValue({ error: null })
    await recordApiRequest(principal, {
      method: 'PATCH', path: '/api/v1/creators/:id', status: 403, durationMs: 1.6,
    })
    expect(insert).toHaveBeenCalledTimes(1)
    expect(insert).toHaveBeenCalledWith({
      key_id: 'key-1', user_id: 'user-1', method: 'PATCH',
      path: '/api/v1/creators/:id', status: 403, duration_ms: 2,
    })
  })

  it('makes audit failure explicit without returning internal database details', async () => {
    insert.mockResolvedValue({ error: { message: 'secret database details' } })
    await expect(recordApiRequest(principal, {
      method: 'POST', path: '/api/v1/creators', status: 200, durationMs: 1,
    })).rejects.toThrow('API request audit unavailable')
  })
})
