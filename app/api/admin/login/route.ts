import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { verifyPassword, hashPassword, createSessionToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const body = await req.json()

  if (!body.email || !body.password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
  }

  const supabase = createServerSupabaseClient()
  const { data: user, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('email', body.email.toLowerCase().trim())
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

  const token = createSessionToken({
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
