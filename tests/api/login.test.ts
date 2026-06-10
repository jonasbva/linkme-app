import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// admin_users lookup
const singleMock = vi.fn()
vi.mock('@/lib/supabase', () => ({
  createServerSupabaseClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({ single: singleMock }),
        }),
      }),
      update: () => ({ eq: () => Promise.resolve({ error: null }) }),
    }),
  }),
}))

vi.mock('@/lib/auth', () => ({
  verifyPassword: vi.fn(),
  hashPassword: vi.fn().mockResolvedValue('hash'),
  createSessionToken: vi.fn().mockResolvedValue('payload.signature'),
}))

vi.mock('@/lib/rate-limit', () => ({
  rateLimit: vi.fn().mockResolvedValue({ success: true, remaining: 9, reset: 0 }),
  getClientIp: vi.fn().mockReturnValue('1.2.3.4'),
}))

import { POST } from '@/app/api/admin/login/route'
import { verifyPassword } from '@/lib/auth'
import { rateLimit } from '@/lib/rate-limit'

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost:3000/api/admin/login', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

const activeUser = {
  id: '1', email: 'a@b.com', display_name: 'A', is_super_admin: true,
  password_hash: 'stored-hash', is_active: true,
}

describe('POST /api/admin/login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(rateLimit).mockResolvedValue({ success: true, remaining: 9, reset: 0 })
  })

  it('returns 400 when email or password missing', async () => {
    const res = await POST(makeRequest({ email: 'a@b.com' }))
    expect(res.status).toBe(400)
  })

  it('returns 401 for unknown user', async () => {
    singleMock.mockResolvedValue({ data: null, error: { message: 'not found' } })
    const res = await POST(makeRequest({ email: 'a@b.com', password: 'x' }))
    expect(res.status).toBe(401)
  })

  it('returns 401 for wrong password', async () => {
    singleMock.mockResolvedValue({ data: activeUser, error: null })
    vi.mocked(verifyPassword).mockResolvedValue(false)
    const res = await POST(makeRequest({ email: 'a@b.com', password: 'wrong' }))
    expect(res.status).toBe(401)
  })

  it('returns 200 and sets a signed session cookie for correct password', async () => {
    singleMock.mockResolvedValue({ data: activeUser, error: null })
    vi.mocked(verifyPassword).mockResolvedValue(true)
    const res = await POST(makeRequest({ email: 'a@b.com', password: 'right' }))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.ok).toBe(true)
    expect(res.cookies.get('admin_session')?.value).toBe('payload.signature')
  })

  it('returns 429 when rate limited', async () => {
    vi.mocked(rateLimit).mockResolvedValue({
      success: false, remaining: 0, reset: Math.floor(Date.now() / 1000) + 60,
    })
    const res = await POST(makeRequest({ email: 'a@b.com', password: 'x' }))
    expect(res.status).toBe(429)
  })
})
