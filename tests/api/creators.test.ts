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

const mockInsert = vi.fn().mockReturnValue({
  select: () => ({ single: vi.fn().mockResolvedValue({ data: { id: 'new-id', slug: 'test' }, error: null }) }),
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

function makeRequest(method: string, body?: Record<string, unknown>) {
  return new NextRequest('http://localhost:3000/api/admin/creators', {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: { 'Content-Type': 'application/json' },
  })
}

const allow = () => { authResult = { ok: true, user: { id: 'u1', is_super_admin: true } } }
const deny = (status: 401 | 403) => { authResult = { ok: false, status, error: status === 401 ? 'Unauthorized' : 'Forbidden' } }

describe('POST /api/admin/creators (super-admin only)', () => {
  beforeEach(() => { vi.clearAllMocks(); allow() })

  it('returns 401 when unauthenticated', async () => {
    deny(401)
    const res = await POST(makeRequest('POST', { slug: 'test', display_name: 'Test' }))
    expect(res.status).toBe(401)
  })

  it('returns 403 for a non-super-admin', async () => {
    deny(403)
    const res = await POST(makeRequest('POST', { slug: 'test', display_name: 'Test' }))
    expect(res.status).toBe(403)
  })

  it('creates a creator for a super-admin', async () => {
    const res = await POST(makeRequest('POST', { slug: 'test', display_name: 'Test Creator' }))
    expect(res.status).toBe(200)
    expect(mockInsert).toHaveBeenCalled()
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
