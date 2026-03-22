import { NextRequest, NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  const hostname = req.headers.get('host') || ''
  const { pathname } = req.nextUrl

  // Strip port for local dev
  const domain = hostname.split(':')[0]

  // If on main app domain or Vercel preview — serve normally (admin, /[slug], etc.)
  if (domain === 'localhost' || domain.endsWith('.vercel.app')) {
    return NextResponse.next()
  }

  // Check if an explicit app domain is set (your main domain)
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN
  if (appDomain && domain === appDomain) {
    return NextResponse.next()
  }

  // ── Custom domain request (e.g. lilybrown.com) ──

  // Always pass through API routes and static assets
  if (pathname.startsWith('/api/') || pathname.startsWith('/_next/') || pathname === '/favicon.ico') {
    return NextResponse.next()
  }

  // Block admin access from custom domains
  if (pathname.startsWith('/admin') || pathname.startsWith('/login')) {
    return new NextResponse('Not found', { status: 404 })
  }

  // Look up creator by custom_domain directly from Supabase REST API
  const slug = await resolveCustomDomain(domain)

  if (!slug) {
    return new NextResponse('This domain is not connected to a page.', { status: 404 })
  }

  // Rewrite / → /[slug] so the creator page renders, URL stays as lilybrown.com
  const url = req.nextUrl.clone()
  url.pathname = `/${slug}`
  return NextResponse.rewrite(url)
}

async function resolveCustomDomain(domain: string): Promise<string | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) return null

  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/creators?custom_domain=eq.${encodeURIComponent(domain)}&is_active=eq.true&select=slug&limit=1`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
        // Cache for 60s so we're not hitting Supabase on every single request
        next: { revalidate: 60 },
      }
    )

    if (!res.ok) return null
    const data = await res.json()
    return data?.[0]?.slug || null
  } catch {
    return null
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
