import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock rate limiter
vi.mock('@/lib/rate-limit', () => ({
  rateLimit: vi.fn().mockResolvedValue({ success: true, remaining: 29, reset: 0 }),
  getClientIp: vi.fn().mockReturnValue('1.2.3.4'),
}))

import { GET } from '@/app/api/redirect/route'
import { rateLimit } from '@/lib/rate-limit'

function makeRequest(url?: string) {
  const searchParams = url ? `?url=${encodeURIComponent(url)}` : ''
  return new NextRequest(`http://localhost:3000/api/redirect${searchParams}`, {
    method: 'GET',
    headers: { 'x-real-ip': '1.2.3.4' },
  })
}

describe('GET /api/redirect', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(rateLimit).mockResolvedValue({ success: true, remaining: 29, reset: 0 })
  })

  it('returns 400 when url param is missing', async () => {
    const req = makeRequest()
    const res = await GET(req)
    expect(res.status).toBe(400)
    const text = await res.text()
    expect(text).toBe('Missing url parameter')
  })

  it('returns 400 for non-http URLs', async () => {
    const req = makeRequest('javascript:alert(1)')
    const res = await GET(req)
    expect(res.status).toBe(400)
    expect(await res.text()).toBe('Invalid URL')
  })

  it('returns 400 for invalid URLs', async () => {
    const req = makeRequest('not a url')
    const res = await GET(req)
    expect(res.status).toBe(400)
  })

  it('returns HTML bounce page for valid URL', async () => {
    const req = makeRequest('https://example.com')
    const res = await GET(req)
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toContain('text/html')

    const html = await res.text()
    expect(html).toContain('<!DOCTYPE html>')
    expect(html).toContain('https://example.com')
    expect(html).toContain('Opening...')
  })

  it('escapes dangerous characters in the URL', async () => {
    const req = makeRequest('https://example.com/"><script>alert(1)</script>')
    const res = await GET(req)
    const html = await res.text()
    // The URL in the HTML attribute context should be escaped
    expect(html).not.toContain('"><script>')
  })

  it('returns 429 when rate limited', async () => {
    vi.mocked(rateLimit).mockResolvedValue({
      success: false,
      remaining: 0,
      reset: Math.floor(Date.now() / 1000) + 30,
    })

    const req = makeRequest('https://example.com')
    const res = await GET(req)
    expect(res.status).toBe(429)
    expect(await res.text()).toContain('Too many requests')
  })

  it('sets no-store Cache-Control header', async () => {
    const req = makeRequest('https://example.com')
    const res = await GET(req)
    expect(res.headers.get('Cache-Control')).toBe('no-store')
  })
})
