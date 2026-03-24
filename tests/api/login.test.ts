import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock next/headers cookies
const mockCookiesSet = vi.fn()
vi.mock('next/headers', () => ({
  cookies: () => ({
    get: vi.fn(),
    set: mockCookiesSet,
  }),
}))

import { POST } from '@/app/api/admin/login/route'

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost:3000/api/admin/login', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('POST /api/admin/login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.ADMIN_PASSWORD = 'test-password-123'
  })

  it('returns 401 for wrong password', async () => {
    const req = makeRequest({ password: 'wrong-password' })
    const res = await POST(req)
    expect(res.status).toBe(401)
    const json = await res.json()
    expect(json.error).toBe('Invalid password')
  })

  it('returns 200 and sets cookie for correct password', async () => {
    const req = makeRequest({ password: 'test-password-123' })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.ok).toBe(true)
  })

  it('returns 500 when ADMIN_PASSWORD is not set', async () => {
    delete process.env.ADMIN_PASSWORD
    const req = makeRequest({ password: 'anything' })
    const res = await POST(req)
    expect(res.status).toBe(500)
    const json = await res.json()
    expect(json.error).toBe('Admin password not set')
  })
})
