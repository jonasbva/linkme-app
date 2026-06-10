import { NextRequest, NextResponse } from 'next/server'
import { requireUser, guardResponse } from '@/lib/auth'
import { validateProxyImageUrl } from '@/lib/ssrf'

const MAX_IMAGE_BYTES = 10 * 1024 * 1024 // 10 MB

export async function GET(req: NextRequest) {
  // Admin-only (used by the Social tab to display Instagram CDN images).
  const gate = await requireUser()
  if (!gate.ok) return guardResponse(gate)

  const raw = req.nextUrl.searchParams.get('url')
  if (!raw) return new NextResponse('Missing url', { status: 400 })

  // SSRF guard: only https Instagram/Facebook CDN hosts, never private/internal IPs.
  const target = validateProxyImageUrl(raw)
  if (!target) return new NextResponse('URL not allowed', { status: 400 })

  try {
    const res = await fetch(target.toString(), {
      headers: {
        // Pretend to be a regular browser so Instagram CDN serves the image
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.instagram.com/',
      },
      cache: 'force-cache',
      // Don't follow redirects — a 3xx could point at an internal host and bypass the allowlist.
      redirect: 'error',
    })

    if (!res.ok) {
      return new NextResponse('Failed to fetch image', { status: res.status })
    }

    const contentType = res.headers.get('content-type') || ''
    if (!contentType.startsWith('image/')) {
      return new NextResponse('Not an image', { status: 400 })
    }

    const declaredLength = Number(res.headers.get('content-length') || '0')
    if (declaredLength && declaredLength > MAX_IMAGE_BYTES) {
      return new NextResponse('Image too large', { status: 413 })
    }

    const buffer = await res.arrayBuffer()
    if (buffer.byteLength > MAX_IMAGE_BYTES) {
      return new NextResponse('Image too large', { status: 413 })
    }

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch {
    return new NextResponse('Error fetching image', { status: 500 })
  }
}
