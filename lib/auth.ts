import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from './supabase'

// ── Password hashing using Web Crypto (no external deps) ──

async function deriveKey(password: string, salt: Uint8Array): Promise<ArrayBuffer> {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits'])
  return crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    256
  )
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const derived = await deriveKey(password, salt)
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('')
  const hashHex = Array.from(new Uint8Array(derived)).map(b => b.toString(16).padStart(2, '0')).join('')
  return `${saltHex}:${hashHex}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex, hashHex] = stored.split(':')
  if (!saltHex || !hashHex) return false
  const salt = new Uint8Array(saltHex.match(/.{2}/g)!.map(b => parseInt(b, 16)))
  const derived = await deriveKey(password, salt)
  const derivedHex = Array.from(new Uint8Array(derived)).map(b => b.toString(16).padStart(2, '0')).join('')
  return derivedHex === hashHex
}

// ── Signed session tokens (HMAC-SHA-256, no external deps) ──
//
// Token format: `<base64url(payload)>.<base64url(hmac)>`.
// The signature is verified on every read, so the payload (including
// is_super_admin) cannot be forged the way an unsigned base64 blob could.

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!secret) {
    throw new Error('SESSION_SECRET (or SUPABASE_SERVICE_ROLE_KEY) must be set to sign sessions')
  }
  return secret
}

function base64urlFromBytes(bytes: Uint8Array): string {
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64urlToBytes(s: string): Uint8Array {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/')
  const bin = atob(b64)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

async function hmacSign(data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(getSessionSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data))
  return base64urlFromBytes(new Uint8Array(sig))
}

// Length-safe constant-time string compare.
function timingSafeEqual(a: string, b: string): boolean {
  const ab = new TextEncoder().encode(a)
  const bb = new TextEncoder().encode(b)
  let diff = ab.length ^ bb.length
  const len = Math.max(ab.length, bb.length)
  for (let i = 0; i < len; i++) diff |= (ab[i] ?? 0) ^ (bb[i] ?? 0)
  return diff === 0
}

// ── Session / Auth helpers ──

export interface SessionUser {
  id: string
  email: string
  display_name: string
  is_super_admin: boolean
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = cookies()
  const token = cookieStore.get('admin_session')?.value
  if (!token) return null

  const [payloadB64, sig] = token.split('.')
  // Reject malformed and legacy unsigned (single-segment) tokens.
  if (!payloadB64 || !sig) return null

  let expectedSig: string
  try {
    expectedSig = await hmacSign(payloadB64)
  } catch {
    return null
  }
  if (!timingSafeEqual(sig, expectedSig)) return null

  try {
    const payload = JSON.parse(new TextDecoder().decode(base64urlToBytes(payloadB64)))
    if (!payload.id || !payload.exp || Date.now() > payload.exp) return null
    return {
      id: payload.id,
      email: payload.email,
      display_name: payload.display_name,
      is_super_admin: payload.is_super_admin,
    }
  } catch {
    return null
  }
}

export async function createSessionToken(user: {
  id: string
  email: string
  display_name: string
  is_super_admin: boolean
}): Promise<string> {
  const payload = {
    id: user.id,
    email: user.email,
    display_name: user.display_name,
    is_super_admin: user.is_super_admin,
    exp: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
  }
  const payloadB64 = base64urlFromBytes(new TextEncoder().encode(JSON.stringify(payload)))
  const sig = await hmacSign(payloadB64)
  return `${payloadB64}.${sig}`
}

// ── API route guards ──
//
// These return a discriminated result so route handlers can branch and emit
// the right HTTP status. Use unauthorizedResponse() to convert a failed guard
// into a NextResponse in one line.

export type GuardResult =
  | { ok: true; user: SessionUser }
  | { ok: false; status: 401 | 403; error: string }

export function guardResponse(result: { ok: false; status: 401 | 403; error: string }): NextResponse {
  return NextResponse.json({ error: result.error }, { status: result.status })
}

export async function requireUser(): Promise<GuardResult> {
  const user = await getSessionUser()
  if (!user) return { ok: false, status: 401, error: 'Unauthorized' }
  return { ok: true, user }
}

// Re-validates super-admin status against the DB so a still-valid token issued
// before a demotion (or deactivation) cannot be used for privileged actions.
export async function requireSuperAdmin(): Promise<GuardResult> {
  const user = await getSessionUser()
  if (!user) return { ok: false, status: 401, error: 'Unauthorized' }

  const supabase = createServerSupabaseClient()
  const { data } = await supabase
    .from('admin_users')
    .select('is_super_admin, is_active')
    .eq('id', user.id)
    .single()

  if (!data || data.is_active === false || data.is_super_admin !== true) {
    return { ok: false, status: 403, error: 'Forbidden' }
  }
  return { ok: true, user: { ...user, is_super_admin: true } }
}

// ── Permission helpers ──

export type PermissionType =
  | 'view_links'
  | 'view_social'
  | 'view_conversions'
  | 'view_link_analytics'
  | 'edit_settings'
  | 'edit_links'
  | 'input_conversions'
  | 'edit_social'

export async function getUserPermissions(userId: string): Promise<{
  visibleCreatorIds: string[]
  permissions: Record<string, Set<PermissionType>>
  grantAllCreators: boolean
  allCreatorsPermissions: Set<PermissionType>
}> {
  const supabase = createServerSupabaseClient()

  // Get user's role IDs
  const { data: userRoles } = await supabase
    .from('admin_user_roles')
    .select('role_id')
    .eq('user_id', userId)

  const roleIds = (userRoles || []).map(r => r.role_id)

  if (roleIds.length === 0) {
    return { visibleCreatorIds: [], permissions: {}, grantAllCreators: false, allCreatorsPermissions: new Set() }
  }

  // Check if any role has grant_all_creators
  const { data: roles } = await supabase
    .from('admin_roles')
    .select('id, grant_all_creators, all_creators_permissions')
    .in('id', roleIds)

  let grantAllCreators = false
  const allCreatorsPermissions = new Set<PermissionType>()

  ;(roles || []).forEach(r => {
    if (r.grant_all_creators) {
      grantAllCreators = true
      ;(r.all_creators_permissions || []).forEach((p: string) => allCreatorsPermissions.add(p as PermissionType))
    }
  })

  // Get creator visibility from roles
  const creatorIds = new Set<string>()

  const { data: roleAccess } = await supabase
    .from('admin_creator_access')
    .select('creator_id')
    .in('role_id', roleIds)

  ;(roleAccess || []).forEach(a => creatorIds.add(a.creator_id))

  // Also get user-level creator access (assigned in Teams tab)
  const { data: userAccess } = await supabase
    .from('admin_creator_access')
    .select('creator_id')
    .eq('user_id', userId)

  const hasUserLevelAccess = (userAccess || []).length > 0
  ;(userAccess || []).forEach(a => creatorIds.add(a.creator_id))

  // Get permissions from roles
  const permissions: Record<string, Set<PermissionType>> = {}

  const { data: rolePerms } = await supabase
    .from('admin_permissions')
    .select('creator_id, permission_type')
    .in('role_id', roleIds)

  ;(rolePerms || []).forEach(p => {
    if (!permissions[p.creator_id]) permissions[p.creator_id] = new Set()
    permissions[p.creator_id].add(p.permission_type as PermissionType)
  })

  // Also get user-level permissions (assigned directly to the user)
  const { data: userPerms } = await supabase
    .from('admin_permissions')
    .select('creator_id, permission_type')
    .eq('user_id', userId)

  ;(userPerms || []).forEach(p => {
    if (!permissions[p.creator_id]) permissions[p.creator_id] = new Set()
    permissions[p.creator_id].add(p.permission_type as PermissionType)
  })

  // If user has grant_all_creators role but also has user-level creator assignments,
  // restrict visibility to only those assigned creators
  const effectiveGrantAll = grantAllCreators && !hasUserLevelAccess

  return {
    visibleCreatorIds: Array.from(creatorIds),
    permissions,
    grantAllCreators: effectiveGrantAll,
    allCreatorsPermissions,
  }
}

// True if the user can see (and optionally has `permission` on) the creator.
export async function canAccessCreator(
  userId: string,
  creatorId: string,
  permission?: PermissionType,
): Promise<boolean> {
  const perms = await getUserPermissions(userId)
  if (perms.grantAllCreators) {
    return permission ? perms.allCreatorsPermissions.has(permission) : true
  }
  if (!perms.visibleCreatorIds.includes(creatorId)) return false
  if (!permission) return true
  return perms.permissions[creatorId]?.has(permission) ?? false
}

// For server-component pages: may the current session user VIEW this creator's
// page? Super-admins and grant-all roles always can; otherwise the creator must
// be in their visible set. Pages call this and `notFound()` on false.
export async function canViewCreator(creatorId: string): Promise<boolean> {
  const user = await getSessionUser()
  if (!user) return false
  if (user.is_super_admin) return true
  return canAccessCreator(user.id, creatorId)
}

// requireUser + per-creator access. Super-admins bypass (the is_super_admin
// flag is now signed and therefore trustworthy for read/write scoping).
export async function requireCreatorAccess(
  creatorId: string,
  permission?: PermissionType,
): Promise<GuardResult> {
  const gate = await requireUser()
  if (!gate.ok) return gate
  if (gate.user.is_super_admin) return gate
  const allowed = await canAccessCreator(gate.user.id, creatorId, permission)
  if (!allowed) return { ok: false, status: 403, error: 'Forbidden' }
  return gate
}

// Verifies a child row actually belongs to the creator named in the route,
// closing IDOR on nested resources. Generalizes the check already used in
// conversion-accounts/[accountId].
export async function childBelongsToCreator(
  table: 'links' | 'conversion_accounts' | 'social_accounts',
  childId: string,
  creatorId: string,
): Promise<boolean> {
  const supabase = createServerSupabaseClient()
  const { data } = await supabase.from(table).select('id, creator_id').eq('id', childId).single()
  return !!data && data.creator_id === creatorId
}

// ── Cron auth ──
// Fails CLOSED: if CRON_SECRET is unset, no request is authorized.
export function verifyCronSecret(req: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  return req.headers.get('authorization') === `Bearer ${secret}`
}

// ── Subscriber MCP read-only token ──
// Guards GET /api/subscribers (read-only conversion data for the subscriber MCP server).
// Fails CLOSED: if SUBSCRIBER_MCP_TOKEN is unset, no request is authorized.
export function verifySubscriberToken(req: Request): boolean {
  const secret = process.env.SUBSCRIBER_MCP_TOKEN
  if (!secret) return false
  const header = req.headers.get('authorization') || ''
  const prefix = 'Bearer '
  if (!header.startsWith(prefix)) return false
  return timingSafeEqual(header.slice(prefix.length), secret)
}
