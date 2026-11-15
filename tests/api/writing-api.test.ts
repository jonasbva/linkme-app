import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

const mock = vi.hoisted(() => ({
  authenticate: vi.fn(), context: vi.fn(), audit: vi.fn(), admin: vi.fn(), access: vi.fn(),
  creators: vi.fn(), conversions: vi.fn(), emergency: vi.fn(), upload: vi.fn(), from: vi.fn(),
}))
vi.mock('@/lib/api-access', () => ({ authenticateApiRequest: mock.authenticate, runWithApiPrincipal: mock.context, recordApiRequest: mock.audit }))
vi.mock('@/lib/auth', () => ({
  requireSuperAdmin: mock.admin, requireCreatorAccess: mock.access,
  guardResponse: (gate: any) => NextResponse.json({ error: gate.error }, { status: gate.status }),
}))
vi.mock('@/lib/supabase', () => ({ createServerSupabaseClient: () => ({ from: mock.from }) }))
vi.mock('@/app/api/admin/creators/route', () => ({ POST: mock.creators, GET: mock.creators }))
vi.mock('@/app/api/admin/conversions/route', () => ({ POST: mock.conversions, GET: mock.conversions }))
vi.mock('@/app/api/admin/revenue/emergency/route', () => ({ POST: mock.emergency, GET: mock.emergency }))
vi.mock('@/app/api/admin/upload/route', () => ({ POST: mock.upload }))

import { GET, POST, PATCH, DELETE } from '@/app/api/v1/[[...path]]/route'

const creatorId = '11111111-1111-4111-8111-111111111111'
const linkId = '22222222-2222-4222-8222-222222222222'
const principal = { keyId: 'key-id', user: { id: 'user-id', display_name: 'Marlon', email: 'marlon@example.test', is_super_admin: false } }
function request(path: string, method = 'GET', body?: unknown, query = '') {
  return new NextRequest(`http://localhost/api/v1/${path}${query}`, {
    method, headers: { authorization: 'Bearer test-key', ...(body !== undefined ? { 'content-type': 'application/json' } : {}) },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  })
}
const context = (path: string) => ({ params: { path: path ? path.split('/') : [] } })

beforeEach(() => {
  vi.resetAllMocks()
  mock.authenticate.mockResolvedValue({ ok: true, principal })
  mock.context.mockImplementation((_principal, fn) => fn())
  mock.audit.mockResolvedValue(undefined)
  mock.admin.mockResolvedValue({ ok: true, user: { ...principal.user, is_super_admin: true } })
  mock.access.mockResolvedValue({ ok: true, user: principal.user })
  for (const handler of [mock.creators, mock.conversions, mock.emergency, mock.upload]) handler.mockResolvedValue(NextResponse.json({ saved: true }))
})

describe('Versioned dashboard writing API boundary', () => {
  it('authenticates before revealing routes or loading handlers', async () => {
    mock.authenticate.mockResolvedValue({ ok: false, status: 401, error: 'Invalid API key' })
    const result = await GET(request(''), context(''))
    expect(result.status).toBe(401)
    expect(mock.context).not.toHaveBeenCalled()
    expect(mock.creators).not.toHaveBeenCalled()
    expect(result.headers.get('cache-control')).toContain('no-store')
  })

  it('publishes operational routes, permissions and destructive warnings only to authenticated callers', async () => {
    const result = await GET(request(''), context(''))
    const data = await result.json()
    expect(data.routes).toContainEqual(expect.objectContaining({ path: '/api/v1/creators/:id', warning: expect.stringContaining('permanently') }))
    expect(data.routes.find((route: any) => route.path === '/api/v1/revenue/cache').methods).toContainEqual({ method: 'POST', requiredPermissions: 'Active super admin' })
    expect(data.routes.some((route: any) => /team|roles|api-keys|revenue\/config/.test(route.path))).toBe(false)
    expect(mock.audit).toHaveBeenCalledWith(principal, expect.objectContaining({ path: '/api/v1', status: 200 }))
  })

  it('dispatches an existing handler inside the validated owner context without issuing a session cookie', async () => {
    const result = await POST(request('creators', 'POST', { display_name: 'New Creator', of_handle: '@new.creator' }), context('creators'))
    expect(result.status).toBe(200)
    expect(mock.context).toHaveBeenCalledWith(principal, expect.any(Function))
    expect(mock.creators).toHaveBeenCalledOnce()
    expect(result.headers.get('set-cookie')).toBeNull()
  })

  it.each(['team', 'roles', 'api-keys', 'login', 'profile', 'revenue/config', 'creators/' + creatorId + '/conversion-accounts'])('excludes access, credential and legacy route %s', async path => {
    const result = await POST(request(path, 'POST', {}), context(path))
    expect(result.status).toBe(404)
    expect(mock.creators).not.toHaveBeenCalled()
  })

  it('rejects unsupported methods with Allow and audits the failure', async () => {
    const result = await DELETE(request('conversions', 'DELETE'), context('conversions'))
    expect(result.status).toBe(405)
    expect(result.headers.get('allow')).toBe('GET, POST')
    expect(mock.audit).toHaveBeenCalledWith(principal, expect.objectContaining({ status: 405 }))
  })

  it('rejects malformed JSON before the existing write handler runs', async () => {
    const req = new NextRequest('http://localhost/api/v1/conversions', { method: 'POST', body: '{"action":', headers: { 'content-type': 'application/json' } })
    expect((await POST(req, context('conversions'))).status).toBe(400)
    expect(mock.conversions).not.toHaveBeenCalled()
  })

  it('requires JSON content type and rejects a body over 1 MB even without Content-Length', async () => {
    const wrongType = new NextRequest('http://localhost/api/v1/conversions', { method: 'POST', body: '{}' })
    expect((await POST(wrongType, context('conversions'))).status).toBe(415)
    const huge = request('conversions', 'POST', { padding: 'a'.repeat(1024 * 1024) })
    expect(huge.headers.has('content-length')).toBe(false)
    expect((await POST(huge, context('conversions'))).status).toBe(413)
    expect(mock.conversions).not.toHaveBeenCalled()
  })

  it('rejects malformed nested tracking links before an account can be inserted', async () => {
    for (const tracking_link of [{ label: 42 }, { url: [] }, { infloww_link_name: {} }, 'bad-object']) {
      expect((await POST(request('social-accounts', 'POST', { creator_id: creatorId, platform: 'instagram', username: 'handle', tracking_link }), context('social-accounts'))).status).toBe(400)
    }
    expect(mock.from).not.toHaveBeenCalled()
  })

  it.each([null, [], 'not-an-object'])('rejects nonobject JSON %s before dispatch', async value => {
    expect((await POST(request('conversions', 'POST', value), context('conversions'))).status).toBe(400)
    expect(mock.conversions).not.toHaveBeenCalled()
  })

  it('rejects arbitrary creator columns instead of mass assigning them', async () => {
    const path = `creators/${creatorId}`
    expect((await PATCH(request(path, 'PATCH', { is_super_admin: true }), context(path))).status).toBe(400)
    expect((await POST(request('creators', 'POST', { slug: 'new', display_name: 'New', id: creatorId }), context('creators'))).status).toBe(400)
    expect(mock.creators).not.toHaveBeenCalled()
  })

  it.each([-1, 1.5, '10', 2147483648])('rejects invalid traffic counts %s before writing', async value => {
    const result = await POST(request('conversions', 'POST', { action: 'update_link_cell', tracking_link_id: linkId, date: '2026-11-14', field: 'views', value }), context('conversions'))
    expect(result.status).toBe(400)
    expect(mock.conversions).not.toHaveBeenCalled()
  })

  it('rejects impossible dates, invalid IDs and duplicate batch IDs', async () => {
    for (const body of [
      { action: 'update_creator_cell', creator_id: creatorId, date: '2026-11-31', value: 4 },
      { action: 'update_creator_cell', creator_id: 'arbitrary-id', date: '2026-11-14', value: 4 },
      { action: 'set_daily_subs', date: '2026-11-14', entries: [{ creator_id: creatorId, new_subs: 4 }, { creator_id: creatorId, new_subs: 5 }] },
    ]) expect((await POST(request('conversions', 'POST', body), context('conversions'))).status).toBe(400)
    expect(mock.conversions).not.toHaveBeenCalled()
  })

  it('keeps explicit zero and deletion-null distinct', async () => {
    for (const value of [0, null]) expect((await POST(request('conversions', 'POST', { action: 'update_creator_cell', creator_id: creatorId, date: '2026-11-14', value }), context('conversions'))).status).toBe(200)
    expect(mock.conversions).toHaveBeenCalledTimes(2)
    expect(await mock.conversions.mock.calls[0][0].json()).toMatchObject({ value: 0 })
    expect(await mock.conversions.mock.calls[1][0].json()).toMatchObject({ value: null })
  })

  it('rejects an unknown batch tracking link instead of silently dropping it', async () => {
    mock.from.mockReturnValue({ select: () => ({ in: async () => ({ data: [], error: null }) }) })
    const result = await POST(request('conversions', 'POST', { action: 'set_link_daily', date: '2026-11-14', entries: [{ tracking_link_id: linkId, views: 2, profile_views: 1, link_clicks: 0 }] }), context('conversions'))
    expect(result.status).toBe(404)
    expect(mock.conversions).not.toHaveBeenCalled()
  })

  it('requires creator settings access before changing emergency status', async () => {
    mock.access.mockResolvedValue({ ok: false, status: 403, error: 'Forbidden' })
    const result = await POST(request('revenue/emergency', 'POST', { creator_id: creatorId, emergency_since: null }), context('revenue/emergency'))
    expect(result.status).toBe(403)
    expect(mock.access).toHaveBeenCalledWith(creatorId, 'edit_settings')
    expect(mock.emergency).not.toHaveBeenCalled()
  })

  it('blocks unscoped revenue and job reads for non-super-admin key owners', async () => {
    mock.admin.mockResolvedValue({ ok: false, status: 403, error: 'Forbidden' })
    for (const path of ['revenue/cache', 'revenue/data', 'revenue/emergency', 'revenue/infloww-creators-cached', 'scrape-all']) expect((await GET(request(path), context(path))).status).toBe(403)
    expect(mock.emergency).not.toHaveBeenCalled()
  })

  it('rejects the upstream revenue SSE path before loading its handler', async () => {
    const result = await GET(request('revenue/data', 'GET', undefined, '?stream=true'), context('revenue/data'))
    expect(result.status).toBe(400)
    expect(await result.json()).toMatchObject({ error: expect.stringContaining('normal JSON') })
  })

  it('redacts thrown internal details and audits canonical paths without caller text', async () => {
    mock.conversions.mockRejectedValue(new Error('secret-database-password'))
    const result = await GET(request('conversions', 'GET', undefined, '?access_token=secret-token'), context('conversions'))
    expect(result.status).toBe(500)
    expect(JSON.stringify(await result.json())).not.toContain('secret')
    expect(mock.audit).toHaveBeenCalledWith(principal, expect.objectContaining({ path: '/api/v1/conversions', status: 500 }))
    await GET(request('secret-path'), context('secret-path'))
    expect(mock.audit).toHaveBeenLastCalledWith(principal, expect.objectContaining({ path: '/api/v1/<unrecognized>', status: 404 }))
  })

  it('preserves a successful mutation response if audit recording fails', async () => {
    mock.audit.mockRejectedValue(new Error('audit unavailable'))
    const stderr = vi.spyOn(console, 'error').mockImplementation(() => {})
    const result = await POST(request('conversions', 'POST', { action: 'set_expectation', creator_id: creatorId, daily_sub_target: 10 }), context('conversions'))
    expect(result.status).toBe(200)
    stderr.mockRestore()
  })

  it('rejects active content and arbitrary storage buckets', async () => {
    for (const [type, bucket] of [['image/svg+xml', 'creators'], ['text/html', 'creators'], ['image/png', 'private-secrets']]) {
      const form = new FormData()
      form.set('file', new Blob(['<svg/>'], { type }), 'asset.svg')
      form.set('bucket', bucket)
      const req = new NextRequest('http://localhost/api/v1/upload', { method: 'POST', body: form })
      expect((await POST(req, context('upload'))).status).toBe(400)
    }
    expect(mock.upload).not.toHaveBeenCalled()
  })
})
