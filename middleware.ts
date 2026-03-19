import { NextRequest, NextResponse } from 'next/server'

// Main app domain — e.g. "yourdomain.com" or "linkme-app.vercel.app"
const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN || 'localhost'

export async function middleware(req: NextRequest) {
  const hostname = req.headers.get('host') || ''
  const { pathname } = req.nextUrl

  // Strip port for local dev
  const domain = hostname.replace(':3000', '').replace(':3001', '')

  // If on main app domain — serve normally (admin, /[slug] etc.)
  if (domain === APP_DOMAIN || domain === 'localhost' || domain.includes('vercel.app')) {
    return NextResponse.next()
  }

  // Otherwise: this is a creator's custom domain (e.g. lilybrown.com)
  // We look up which creator owns this domain and rewrite to /[slug]
  // We use an API call to avoid importing DB directly in middleware (edge runtime)
  const creatorSlug = await resolveCustomDomain(domain, req)
  if (!creatorSlug) {
    return new NextResponse('Not found', { status: 404 })
  }

  // Rewrite / to /[slug], pass through /api routes
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  const url = req.nextUrl.clone()
  url.pathname = `/${creatorSlug}${pathname === '/' ? '' : pathname}`
  return NextResponse.rewrite(url)
}

async function resolveCustomDomain(domain: string, req: NextRequest): Promise<string | null> {
  try {
    const baseUrl = `${req.nextUrl.protocol}//${req.headers.get('host')}`
    const res = await fetch(`${baseUrl}/api/resolve-domain?domain=${encodeURIComponent(domain)}`)
    if (!res.ok) return null
    const data = await res.json()
    return data.slug || null
  } catch {
    return null
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
