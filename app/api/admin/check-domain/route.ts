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
    // Vercel IPs
    const vercelIPs = ['76.76.21.21', '76.76.21.22']
    const aMatch = aAnswers.some(ip => vercelIPs.includes(ip))

    const verified = cnameMatch || aMatch
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
