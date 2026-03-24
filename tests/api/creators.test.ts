import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock next/headers cookies
const mockCookieValue = vi.fn().mockReturnValue('true')
vi.mock('next/headers', () => ({
  cookies: () => ({
    get: (name: string) => {
      if (name === 'admin_auth') return { value: mockCookieValue() }
      return undefined
    },
  }),
}))

// Mock Supabase
const mockSelect = vi.fn().mockReturnValue({
  single: vi.fn().mockResolvedValue({ data: { id: 'new-id', slug: 'test' }, error: null }),
})
const mockInsert = vi.fn().mockReturnValue({ select: () => mockSelect() })
const mockUpdate = vi.fn().mockReturnValue({
  eq: vi.fn().mockReturnValue({
    select: () => ({
      single: vi.fn().mockResolvedValue({ data: { id: '123', slug: 'updated' }, error: null }),
    }),
  }),
})
const mockDelete = vi.fn().mockReturnValue({
  eq: vi.fn().mockResolvedValue({ error: null }),
})

vi.mock('@/lib/supabase', () => ({
  createServerSupabaseClient: () => ({
    from: (table: string) => ({
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
    }),
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

describe('POST /api/admin/creators', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCookieValue.mockReturnValue('true')
  })

  it('returns 401 when not authenticated', async () => {
    mockCookieValue.mockReturnValue(undefined)
    const req = makeRequest('POST', { slug: 'test', display_name: 'Test' })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('creates a creator when authenticated', async () => {
    const req = makeRequest('POST', { slug: 'test', display_name: 'Test Creator' })
    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(mockInsert).toHaveBeenCalled()
  })
})

describe('PUT /api/admin/creators/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCookieValue.mockReturnValue('true')
  })

  it('returns 401 when not authenticated', async () => {
    mockCookieValue.mockReturnValue(undefined)
    const req = makeRequest('PUT', { display_name: 'Updated' })
    const res = await PUT(req, { params: { id: '123' } })
    expect(res.status).toBe(401)
  })

  it('updates a creator when authenticated', async () => {
    const req = makeRequest('PUT', { display_name: 'Updated Name' })
    const res = await PUT(req, { params: { id: '123' } })
    expect(res.status).toBe(200)
    expect(mockUpdate).toHaveBeenCalled()
  })
})

describe('DELETE /api/admin/creators/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCookieValue.mockReturnValue('true')
  })

  it('returns 401 when not authenticated', async () => {
    mockCookieValue.mockReturnValue(undefined)
    const req = makeRequest('DELETE')
    const res = await DELETE(req, { params: { id: '123' } })
    expect(res.status).toBe(401)
  })

  it('deletes a creator when authenticated', async () => {
    const req = makeRequest('DELETE')
    const res = await DELETE(req, { params: { id: '123' } })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.ok).toBe(true)
  })
})
