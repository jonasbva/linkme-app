import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { logError, errorToEntry } from '@/lib/error-logging'

// Free IP geolocation — no API key needed, 45k reqs/month free
// Returns empty object on failure so tracking still records the event
async function getGeoData(ip: string) {
  if (!ip || ip === '127.0.0.1' || ip === '::1') {
    return { country: 'Local', country_code: 'LO', city: 'Local' }
  }
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3000) // 3s timeout

    const res = await fetch(`https://ipapi.co/${ip}/json/`, {
      signal: controller.signal,
      next: { revalidate: 3600 },
    })
    clearTimeout(timeout)

    if (!res.ok) {
      if (res.status === 429) {
        console.warn('ipapi.co rate limit hit — geo data unavailable')
      } else {
        console.warn(`ipapi.co returned ${res.status} for IP ${ip}`)
      }
      return {}
    }
    const data = await res.json()

    // ipapi.co returns { error: true, reason: '...' } when rate-limited or invalid
    if (data.error) {
      console.warn('ipapi.co error:', data.reason || 'unknown')
      return {}
    }

    return {
      country: data.country_name || '',
      country_code: data.country_code || '',
      city: data.city || '',
    }
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      console.warn('ipapi.co request timed out for IP', ip)
    } else {
      console.warn('ipapi.co fetch error:', err?.message || err)
    }
    return {}
  }
}

function getDeviceType(userAgent: string): string {
  if (!userAgent) return 'unknown'
  if (/mobile|android|iphone|ipad/i.test(userAgent)) return 'mobile'
  if (/tablet/i.test(userAgent)) return 'tablet'
  return 'desktop'
}

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 30 requests per minute per IP
    const ip = getClientIp(req.headers)
    const { success, remaining, reset } = await rateLimit(ip, 'track', {
      max: 30,
      windowSeconds: 60,
    })

    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        {
          status: 429,
          headers: {
            'Retry-After': String(reset - Math.floor(Date.now() / 1000)),
            'X-RateLimit-Remaining': '0',
          },
        }
      )
    }

    const body = await req.json()
    const { creator_id, link_id, type } = body

    if (!creator_id || !type) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const userAgent = req.headers.get('user-agent') || ''
    const referrer = req.headers.get('referer') || ''
    const device = getDeviceType(userAgent)
    const geo = await getGeoData(ip)

    const supabase = createServerSupabaseClient()
    const { error: insertError } = await supabase.from('clicks').insert({
      creator_id,
      link_id: link_id || null,
      type,
      device,
      referrer,
      country: geo.country || null,
      country_code: geo.country_code || null,
      city: geo.city || null,
    })

    if (insertError) {
      console.error('Track insert error:', insertError)
      return NextResponse.json({ error: 'Failed to record event' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Track error:', err)
    logError(errorToEntry(err, 'api/track', req))
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
