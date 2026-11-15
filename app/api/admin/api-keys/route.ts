import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase'
import { API_KEY_FIELDS, API_USER_FIELDS, generateApiToken, getApiPrincipal } from '@/lib/api-access'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { 'Cache-Control': 'no-store' } })
}

async function authorize(req: NextRequest) {
  // Only the owner's dashboard session can issue or revoke keys. An API key
  // cannot mint successor keys, even when assigned to a super administrator.
  if (getApiPrincipal() || req.headers.has('authorization')) {
    return { ok: false as const, status: 403 as const, error: 'Use a super-admin dashboard session to manage API keys.' }
  }
  const origin = req.headers.get('origin')
  if (origin && origin !== req.nextUrl.origin) {
    return { ok: false as const, status: 403 as const, error: 'Forbidden' }
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { ok: false as const, status: 403 as const, error: 'API key administration is not configured.' }
  }
  return requireSuperAdmin()
}

export async function GET(req: NextRequest) {
  const gate = await authorize(req)
  if (!gate.ok) return json({ error: gate.error }, gate.status)
  try {
    const db = createServerSupabaseClient()
    const [keys, users, recent] = await Promise.all([
      db.from('dashboard_api_keys').select(API_KEY_FIELDS).order('created_at', { ascending: false }),
      db.from('admin_users').select(API_USER_FIELDS).order('display_name'),
      db.from('dashboard_api_requests').select('id, key_id, method, path, status, created_at')
        .order('created_at', { ascending: false }).limit(100),
    ])
    if (keys.error || users.error || recent.error) return json({ error: 'API keys are unavailable. Apply the dashboard API database migration before using this tab.' }, 503)
    const userById = new Map((users.data || []).map(u => [u.id, u]))
    return json({ keys: (keys.data || []).map(k => ({ ...k, user: userById.get(k.user_id) || null })), users: users.data || [], recentRequests: recent.data || [] })
  } catch {
    return json({ error: 'API key administration is temporarily unavailable.' }, 503)
  }
}

export async function POST(req: NextRequest) {
  const gate = await authorize(req)
  if (!gate.ok) return json({ error: gate.error }, gate.status)
  if (!req.headers.get('content-type')?.includes('application/json')) return json({ error: 'Send application/json.' }, 415)
  let body: any
  try { body = await req.json() } catch { return json({ error: 'Invalid JSON.' }, 400) }
  if (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).some(k => !['name', 'user_id', 'expires_in_days'].includes(k))) {
    return json({ error: 'Expected name, user_id and expires_in_days.' }, 400)
  }
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const days = body.expires_in_days
  if (!name || name.length > 80 || typeof body.user_id !== 'string' || !uuid.test(body.user_id) || !Number.isInteger(days) || days < 1 || days > 365) {
    return json({ error: 'Provide a name (1–80 characters), valid user_id and expiry of 1–365 whole days.' }, 400)
  }
  try {
    const db = createServerSupabaseClient()
    const { data: user, error: userError } = await db.from('admin_users').select(API_USER_FIELDS).eq('id', body.user_id).single()
    if (userError || !user || user.is_active !== true) return json({ error: 'Select an active dashboard user.' }, 400)
    const generated = generateApiToken()
    const { data: key, error } = await db.from('dashboard_api_keys').insert({
      name, user_id: user.id, created_by: gate.user.id,
      key_hash: generated.hash, prefix: generated.prefix,
      expires_at: new Date(Date.now() + days * 86400000).toISOString(),
    }).select(API_KEY_FIELDS).single()
    if (error || !key) return json({ error: 'Could not create the API key. Check that the database migration has been applied.' }, 503)
    return json({ key: { ...key, user }, token: generated.token }, 201)
  } catch {
    return json({ error: 'API key administration is temporarily unavailable.' }, 503)
  }
}

export async function DELETE(req: NextRequest) {
  const gate = await authorize(req)
  if (!gate.ok) return json({ error: gate.error }, gate.status)
  const id = req.nextUrl.searchParams.get('id') || ''
  if (!uuid.test(id)) return json({ error: 'A valid key id is required.' }, 400)
  try {
    // Preserve the first revocation timestamp and retain the audit trail.
    const db = createServerSupabaseClient()
    const { error } = await db.from('dashboard_api_keys').update({ revoked_at: new Date().toISOString() })
      .eq('id', id).is('revoked_at', null)
    if (error) return json({ error: 'Could not revoke the API key.' }, 503)
    return json({ ok: true })
  } catch {
    return json({ error: 'API key administration is temporarily unavailable.' }, 503)
  }
}
