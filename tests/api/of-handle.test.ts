import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

let authResult: any = { ok: true, user: { id: 'admin', is_super_admin: true } }
const mockCreatorRead = vi.fn()
const mockClashRead = vi.fn()
const mockUpdateResult = vi.fn()
const mockUpdate = vi.fn(() => ({
  eq: () => ({ select: () => ({ single: mockUpdateResult }) }),
}))

vi.mock('@/lib/auth', () => ({
  requireCreatorAccess: vi.fn(async () => authResult),
  guardResponse: (result: any) => NextResponse.json({ error: result.error }, { status: result.status }),
}))

vi.mock('@/lib/supabase', () => ({
  createServerSupabaseClient: () => ({
    from: () => ({
      select: () => ({ eq: () => ({
        single: mockCreatorRead,
        neq: () => ({ maybeSingle: mockClashRead }),
      }) }),
      update: mockUpdate,
    }),
  }),
}))

import { PATCH } from '@/app/api/admin/creators/[id]/of-handle/route'

const request = (of_handle: string | null) => new NextRequest('http://localhost:3000/api/admin/creators/creator-id/of-handle', {
  method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ of_handle }),
})
const context = { params: { id: 'creator-id' } }

describe('PATCH /api/admin/creators/[id]/of-handle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authResult = { ok: true, user: { id: 'admin', is_super_admin: true } }
    mockCreatorRead.mockResolvedValue({ data: { id: 'creator-id' }, error: null })
    mockClashRead.mockResolvedValue({ data: null, error: null })
    mockUpdateResult.mockResolvedValue({ data: { id: 'creator-id', of_handle: 'fernanda' }, error: null })
  })

  it('connects a handle after name-only creation using columns that exist in the creators table', async () => {
    const response = await PATCH(request(' @Fernanda '), context)
    expect(response.status).toBe(200)
    // The live creators schema has no updated_at column; including it makes
    // adding a handle to a name-only creator fail with PGRST204.
    expect(mockUpdate).toHaveBeenCalledWith({ of_handle: 'fernanda' })
    expect(await response.json()).toEqual({ creator: { id: 'creator-id', of_handle: 'fernanda' } })
  })

  it('can clear a handle without writing unsupported columns', async () => {
    mockUpdateResult.mockResolvedValueOnce({ data: { id: 'creator-id', of_handle: null }, error: null })
    const response = await PATCH(request(null), context)
    expect(response.status).toBe(200)
    expect(mockUpdate).toHaveBeenCalledWith({ of_handle: null })
  })

  it('continues to reject a handle already assigned to another creator', async () => {
    mockClashRead.mockResolvedValueOnce({ data: { id: 'other-creator' }, error: null })
    const response = await PATCH(request('fernanda'), context)
    expect(response.status).toBe(409)
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('does not update creators outside the caller\'s permission scope', async () => {
    authResult = { ok: false, status: 403, error: 'Forbidden' }
    const response = await PATCH(request('fernanda'), context)
    expect(response.status).toBe(403)
    expect(mockCreatorRead).not.toHaveBeenCalled()
    expect(mockUpdate).not.toHaveBeenCalled()
  })
})
