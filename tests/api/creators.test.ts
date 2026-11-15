import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

// Controllable guard result shared by all guards.
let authResult: any = { ok: true, user: { id: 'u1', is_super_admin: true } }

vi.mock('@/lib/auth', () => ({
  requireUser: vi.fn(async () => authResult),
  requireSuperAdmin: vi.fn(async () => authResult),
  requireCreatorAccess: vi.fn(async () => authResult),
  guardResponse: (r: any) => NextResponse.json({ error: r.error }, { status: r.status }),
  getUserPermissions: vi.fn(async () => ({
    visibleCreatorIds: [], permissions: {}, grantAllCreators: true, allCreatorsPermissions: new Set(),
  })),
}))

const mockInsertSingle = vi.fn()
const mockInsert = vi.fn().mockReturnValue({
  select: () => ({ single: mockInsertSingle }),
})
const mockUpdate = vi.fn().mockReturnValue({
  eq: () => ({ select: () => ({ single: vi.fn().mockResolvedValue({ data: { id: '123', slug: 'updated' }, error: null }) }) }),
})
const mockDelete = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) })

vi.mock('@/lib/supabase', () => ({
  createServerSupabaseClient: () => ({
    from: () => ({ insert: mockInsert, update: mockUpdate, delete: mockDelete }),
  }),
}))

import { POST } from '@/app/api/admin/creators/route'
import { PUT, DELETE } from '@/app/api/admin/creators/[id]/route'

function makeRequest(method: string, body?: unknown) {
  return new NextRequest('http://localhost:3000/api/admin/creators', {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: { 'Content-Type': 'application/json' },
  })
}

const allow = () => { authResult = { ok: true, user: { id: 'u1', is_super_admin: true } } }
const deny = (status: 401 | 403) => { authResult = { ok: false, status, error: status === 401 ? 'Unauthorized' : 'Forbidden' } }

describe('POST /api/admin/creators (super-admin only)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    allow()
    mockInsertSingle.mockResolvedValue({ data: { id: 'new-id', slug: 'fernanda' }, error: null })
  })

  it('returns 401 when unauthenticated', async () => {
    deny(401)
    const res = await POST(makeRequest('POST', { slug: 'test', display_name: 'Test' }))
    expect(res.status).toBe(401)
    expect(mockInsert).not.toHaveBeenCalled()
  })

  it('returns 403 for a non-super-admin', async () => {
    deny(403)
    const res = await POST(makeRequest('POST', { slug: 'test', display_name: 'Test' }))
    expect(res.status).toBe(403)
    expect(mockInsert).not.toHaveBeenCalled()
  })

  it('creates Fernanda from her name alone without requiring an OnlyFans account', async () => {
    const res = await POST(makeRequest('POST', { display_name: ' Fernanda ' }))
    expect(res.status).toBe(200)
    expect(mockInsert).toHaveBeenCalledWith({
      display_name: 'Fernanda', slug: 'fernanda', of_handle: null, is_active: true,
    })
    expect(await res.json()).toEqual({ id: 'new-id', slug: 'fernanda' })
  })

  it('normalizes a pasted OnlyFans URL and ignores unrelated request fields', async () => {
    const res = await POST(makeRequest('POST', {
      display_name: ' Fernanda ', of_handle: ' https://www.onlyfans.com/Fernanda.Real_2/ ',
      slug: 'untrusted-slug', id: 'chosen-id', is_super_admin: true, bio: 'unrequested field',
    }))
    expect(res.status).toBe(200)
    expect(mockInsert).toHaveBeenCalledWith({
      display_name: 'Fernanda', slug: 'fernanda.real_2', of_handle: 'fernanda.real_2', is_active: true,
    })
  })

  it.each([
    null, [], {}, { display_name: ' ' }, { display_name: 123 },
    { display_name: 'Fernanda', of_handle: 'https://example.com/fernanda' },
    { display_name: 'Fernanda', of_handle: 'onlyfans.com/fernanda/posts' },
    { display_name: 'Fernanda', of_handle: 'fern anda' },
    { display_name: 'Fernanda', is_active: 'true' },
  ])('rejects invalid input before inserting: %j', async (input) => {
    const res = await POST(makeRequest('POST', input))
    expect(res.status).toBe(400)
    expect(mockInsert).not.toHaveBeenCalled()
    expect(await res.json()).toEqual({ error: expect.any(String) })
  })

  it('returns a clear 400 response for malformed JSON', async () => {
    const req = new NextRequest('http://localhost:3000/api/admin/creators', {
      method: 'POST', body: '{"display_name":', headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    expect(mockInsert).not.toHaveBeenCalled()
    expect(await res.json()).toEqual({ error: expect.any(String) })
  })

  it('returns an actionable conflict when the name or handle already exists', async () => {
    mockInsertSingle.mockResolvedValueOnce({
      data: null,
      error: { code: '23505', message: 'duplicate key value violates unique constraint "creators_slug_key"' },
    })
    const res = await POST(makeRequest('POST', { display_name: 'Fernanda' }))
    expect(res.status).toBe(409)
    const body = await res.json()
    expect(body.error).toMatch(/already|exists/i)
    expect(body.error).not.toContain('creators_slug_key')
  })

  it('does not expose internal database errors to the user', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      mockInsertSingle.mockResolvedValueOnce({
        data: null, error: { code: 'XX000', message: 'private database diagnostic' },
      })
      const res = await POST(makeRequest('POST', { display_name: 'Fernanda' }))
      expect(res.status).toBe(500)
      const body = await res.json()
      expect(body.error).toEqual(expect.any(String))
      expect(body.error).not.toContain('private database diagnostic')
      expect(log).toHaveBeenCalled()
    } finally {
      log.mockRestore()
    }
  })
})

describe('PUT /api/admin/creators/[id] (per-creator access)', () => {
  beforeEach(() => { vi.clearAllMocks(); allow() })

  it('returns 403 without creator access', async () => {
    deny(403)
    const res = await PUT(makeRequest('PUT', { display_name: 'Updated' }), { params: { id: '123' } })
    expect(res.status).toBe(403)
  })

  it('updates a creator with access', async () => {
    const res = await PUT(makeRequest('PUT', { display_name: 'Updated Name' }), { params: { id: '123' } })
    expect(res.status).toBe(200)
    expect(mockUpdate).toHaveBeenCalled()
  })
})

describe('DELETE /api/admin/creators/[id] (super-admin only)', () => {
  beforeEach(() => { vi.clearAllMocks(); allow() })

  it('returns 403 for a non-super-admin', async () => {
    deny(403)
    const res = await DELETE(makeRequest('DELETE'), { params: { id: '123' } })
    expect(res.status).toBe(403)
  })

  it('deletes a creator for a super-admin', async () => {
    const res = await DELETE(makeRequest('DELETE'), { params: { id: '123' } })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.ok).toBe(true)
  })
})
