import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock Supabase before importing the route
const mockInsert = vi.fn().mockReturnValue({ error: null })
vi.mock('@/lib/supabase', () => ({
  createServerSupabaseClient: () => ({
    from: () => ({ insert: mockInsert }),
  }),
}))

// Mock rate limiter — allow all by default
vi.mock('@/lib/rate-limit', () => ({
  rateLimit: vi.fn().mockResolvedValue({ success: true, remaining: 29, reset: 0 }),
  getClientIp: vi.fn().mockReturnValue('1.2.3.4'),
}))

// Mock error logging
vi.mock('@/lib/error-logging', () => ({
  logError: vi.fn(),
  errorToEntry: vi.fn().mockReturnValue({ message: 'test' }),
}))

// Mock geo fetch
const mockFetch = vi.fn().mockResolvedValue({
  ok: true,
  json: () => Promise.resolve({ country_name: 'US', country_code: 'US', city: 'NYC' }),
})
vi.stubGlobal('fetch', mockFetch)

import { POST } from '@/app/api/track/route'
import { rateLimit } from '@/lib/rate-limit'

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost:3000/api/track', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      'x-real-ip': '1.2.3.4',
      'user-agent': 'Mozilla/5.0',
    },
  })
}

describe('POST /api/track', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockInsert.mockReturnValue({ error: null })
    vi.mocked(rateLimit).mockResolvedValue({ success: true, remaining: 29, reset: 0 })
  })

  it('returns 400 when creator_id is missing', async () => {
    const req = makeRequest({ type: 'page_view' })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBe('Missing fields')
  })

  it('returns 400 when type is missing', async () => {
    const req = makeRequest({ creator_id: 'abc-123' })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('inserts a click with geo data on valid request', async () => {
    const req = makeRequest({ creator_id: 'abc-123', type: 'page_view' })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.ok).toBe(true)

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        creator_id: 'abc-123',
        type: 'page_view',
        device: 'desktop',
      })
    )
  })

  it('includes link_id when provided', async () => {
    const req = makeRequest({ creator_id: 'abc-123', link_id: 'link-456', type: 'link_click' })
    const res = await POST(req)
    expect(res.status).toBe(200)

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        creator_id: 'abc-123',
        link_id: 'link-456',
        type: 'link_click',
      })
    )
  })

  it('sets link_id to null when not provided', async () => {
    const req = makeRequest({ creator_id: 'abc-123', type: 'page_view' })
    await POST(req)

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        link_id: null,
      })
    )
  })

  it('returns 429 when rate limited', async () => {
    vi.mocked(rateLimit).mockResolvedValue({
      success: false,
      remaining: 0,
      reset: Math.floor(Date.now() / 1000) + 30,
    })

    const req = makeRequest({ creator_id: 'abc-123', type: 'page_view' })
    const res = await POST(req)
    expect(res.status).toBe(429)
    const json = await res.json()
    expect(json.error).toBe('Too many requests')
  })

  it('detects mobile devices from user-agent', async () => {
    const req = new NextRequest('http://localhost:3000/api/track', {
      method: 'POST',
      body: JSON.stringify({ creator_id: 'abc-123', type: 'page_view' }),
      headers: {
        'Content-Type': 'application/json',
        'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0)',
      },
    })

    await POST(req)

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ device: 'mobile' })
    )
  })
})
