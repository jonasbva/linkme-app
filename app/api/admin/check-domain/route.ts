import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'

// Vercel custom domains should CNAME to cname.vercel-dns.com
const VERCEL_CNAME_TARGET = 'cname.vercel-dns.com'

export async function GET(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const domain = req.nextUrl.searchParams.get('domain')
  if (!domain) return NextResponse.json({ error: 'Missing domain' }, { status: 400 })

  try {
    // Check CNAME via Google DNS-over-HTTPS
    const cnameRes = await fetch(
      `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=CNAME`,
      { headers: { Accept: 'application/dns-json' }, cache: 'no-store' }
    )
    const cnameData = await cnameRes.json()

    // Check A record as fallback (some use Vercel's IP 76.76.21.21)
    const aRes = await fetch(
      `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=A`,
      { headers: { Accept: 'application/dns-json' }, cache: 'no-store' }
    )
    const aData = await aRes.json()

    const cnameAnswers: string[] = (cnameData.Answer || []).map((r: any) =>
      r.data?.toLowerCase().replace(/\.$/, '')
    )
    const aAnswers: string[] = (aData.Answer || []).map((r: any) => r.data?.trim())

    const cnameMatch = cnameAnswers.some(a => a.includes('vercel'))
    // Vercel IPs (including expanded range)
    const vercelIPs = ['76.76.21.21', '76.76.21.22', '76.76.21.9', '76.76.21.61', '76.76.21.93', '76.76.21.123', '76.76.21.164', '76.76.21.241']
    const aMatch = aAnswers.some(ip => vercelIPs.includes(ip))

    // Fallback: try fetching the domain to see if it actually works
    let reachable = false
    if (!cnameMatch && !aMatch) {
      try {
        const probe = await fetch(`https://${domain}`, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(5000) })
        const server = probe.headers.get('server') || ''
        const via = probe.headers.get('x-vercel-id') || probe.headers.get('x-vercel-cache') || ''
        reachable = server.toLowerCase().includes('vercel') || via.length > 0 || probe.ok
      } catch {}
    }

    const verified = cnameMatch || aMatch || reachable
    const resolvedCname = cnameAnswers[0] || null
    const resolvedA = aAnswers[0] || null

    return NextResponse.json({
      verified,
      resolvedCname,
      resolvedA,
      cnameTarget: VERCEL_CNAME_TARGET,
    })
  } catch (err: any) {
    return NextResponse.json({ verified: false, error: err.message }, { status: 200 })
  }
}
