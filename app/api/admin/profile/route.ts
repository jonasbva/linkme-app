import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { requireUser, guardResponse, verifyPassword, hashPassword, createSessionToken } from '@/lib/auth'

// Self-service profile actions. Always operate on the CURRENT user only
// (gate.user.id) — never a user_id from the body.
export async function POST(req: NextRequest) {
  const gate = await requireUser()
  if (!gate.ok) return guardResponse(gate)

  const supabase = createServerSupabaseClient()
  const body = await req.json()

  // ── Update own display name ──
  if (body.action === 'update_display_name') {
    const display_name = String(body.display_name || '').trim()
    if (!display_name) return NextResponse.json({ error: 'Display name is required' }, { status: 400 })

    const { error } = await supabase
      .from('admin_users')
      .update({ display_name, updated_at: new Date().toISOString() })
      .eq('id', gate.user.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    // Re-issue the signed session cookie so the new name shows immediately.
    const token = await createSessionToken({
      id: gate.user.id,
      email: gate.user.email,
      display_name,
      is_super_admin: gate.user.is_super_admin,
    })
    const res = NextResponse.json({ ok: true, display_name })
    res.cookies.set('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    })
    return res
  }

  // ── Change own password ──
  if (body.action === 'change_password') {
    const current = String(body.current || '')
    const next = String(body.new || '')
    if (next.length < 8) {
      return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 })
    }

    const { data: user, error: fetchErr } = await supabase
      .from('admin_users')
      .select('password_hash')
      .eq('id', gate.user.id)
      .single()
    if (fetchErr || !user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    if (!user.password_hash || !(await verifyPassword(current, user.password_hash))) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
    }

    const password_hash = await hashPassword(next)
    const { error } = await supabase
      .from('admin_users')
      .update({ password_hash, updated_at: new Date().toISOString() })
      .eq('id', gate.user.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
