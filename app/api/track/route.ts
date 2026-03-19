import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

// Free IP geolocation — no API key needed, 45k reqs/month free
async function getGeoData(ip: string) {
  if (!ip || ip === '127.0.0.1' || ip === '::1') {
    return { country: 'Local', country_code: 'LO', city: 'Local' }
  }
  try {
    const res = await fetch(`https://ipapi.co/${ip}/json/`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return {}
    const data = await res.json()
    return {
      country: data.country_name || '',
      country_code: data.country_code || '',
      city: data.city || '',
    }
  } catch {
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
    const body = await req.json()
    const { creator_id, link_id, type } = body

    if (!creator_id || !type) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // Get real IP (Vercel sets x-real-ip or x-forwarded-for)
    const ip =
      req.headers.get('x-real-ip') ||
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      '127.0.0.1'

    const userAgent = req.headers.get('user-agent') || ''
    const referrer = req.headers.get('referer') || ''
    const device = getDeviceType(userAgent)
    const geo = await getGeoData(ip)

    const supabase = createServerSupabaseClient()
    await supabase.from('clicks').insert({
      creator_id,
      link_id: link_id || null,
      type,
      device,
      referrer,
      ...geo,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Track error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
