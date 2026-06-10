import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { verifyPassword, hashPassword, createSessionToken } from '@/lib/auth'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  // ── Rate limiting (brute-force / credential-stuffing protection) ──
  // NOTE: lib/rate-limit fails open when Upstash isn't configured, so these
  // limits only take effect when UPSTASH_REDIS_REST_URL/_TOKEN are set.
  const ip = getClientIp(req.headers)
  const ipLimit = await rateLimit(ip, 'login:ip', { max: 10, windowSeconds: 60 })
  if (!ipLimit.success) {
    return NextResponse.json(
      { error: 'Too many attempts. Please try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(Math.max(1, ipLimit.reset - Math.floor(Date.now() / 1000))) } }
    )
  }

  const body = await req.json()

  if (!body.email || !body.password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
  }

  const email = String(body.email).toLowerCase().trim()

  // Per-email limit stops one account being targeted from rotating IPs.
  const emailLimit = await rateLimit(email, 'login:email', { max: 5, windowSeconds: 300 })
  if (!emailLimit.success) {
    return NextResponse.json(
      { error: 'Too many attempts for this account. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(Math.max(1, emailLimit.reset - Math.floor(Date.now() / 1000))) } }
    )
  }

  const supabase = createServerSupabaseClient()
  const { data: user, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('email', email)
    .eq('is_active', true)
    .single()

  if (error || !user) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  }

  // First login: if no password_hash set, set it now
  if (!user.password_hash) {
    const hash = await hashPassword(body.password)
    await supabase.from('admin_users').update({ password_hash: hash }).eq('id', user.id)
  } else {
    const valid = await verifyPassword(body.password, user.password_hash)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }
  }

  const token = await createSessionToken({
    id: user.id,
    email: user.email,
    display_name: user.display_name,
    is_super_admin: user.is_super_admin,
  })

  const res = NextResponse.json({ ok: true, user: { display_name: user.display_name } })
  res.cookies.set('admin_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })
  return res
}
