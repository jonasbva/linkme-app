import { cookies } from 'next/headers'
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

// ── Session / Auth helpers ──

export interface SessionUser {
  id: string
  email: string
  display_name: string
  is_super_admin: boolean
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = cookies()
  const sessionToken = cookieStore.get('admin_session')?.value

  if (!sessionToken) return null

  try {
    const payload = JSON.parse(Buffer.from(sessionToken, 'base64').toString())
    if (!payload.id || !payload.exp || Date.now() > payload.exp) return null
    return { id: payload.id, email: payload.email, display_name: payload.display_name, is_super_admin: payload.is_super_admin }
  } catch {
    return null
  }
}

export function createSessionToken(user: { id: string; email: string; display_name: string; is_super_admin: boolean }): string {
  const payload = {
    id: user.id,
    email: user.email,
    display_name: user.display_name,
    is_super_admin: user.is_super_admin,
    exp: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
  }
  return Buffer.from(JSON.stringify(payload)).toString('base64')
}

// ── API route auth helper ──

export async function requireAuth(): Promise<SessionUser | null> {
  return getSessionUser()
}

// ── Permission helpers ──

export type PermissionType = 'view_links' | 'view_social' | 'view_conversions' | 'edit_settings' | 'edit_links' | 'input_conversions' | 'edit_social'

export async function getUserPermissions(userId: string): Promise<{
  visibleCreatorIds: string[]
  permissions: Record<string, Set<PermissionType>>
}> {
  const supabase = createServerSupabaseClient()

  // Get user's role IDs
  const { data: userRoles } = await supabase
    .from('admin_user_roles')
    .select('role_id')
    .eq('user_id', userId)

  const roleIds = (userRoles || []).map(r => r.role_id)

  // Get creator access (direct + via roles)
  const creatorIds = new Set<string>()

  const { data: directAccess } = await supabase
    .from('admin_creator_access')
    .select('creator_id')
    .eq('user_id', userId)

  ;(directAccess || []).forEach(a => creatorIds.add(a.creator_id))

  if (roleIds.length > 0) {
    const { data: roleAccess } = await supabase
      .from('admin_creator_access')
      .select('creator_id')
      .in('role_id', roleIds)

    ;(roleAccess || []).forEach(a => creatorIds.add(a.creator_id))
  }

  // Get permissions (direct + via roles)
  const permissions: Record<string, Set<PermissionType>> = {}

  const { data: directPerms } = await supabase
    .from('admin_permissions')
    .select('creator_id, permission_type')
    .eq('user_id', userId)

  ;(directPerms || []).forEach(p => {
    if (!permissions[p.creator_id]) permissions[p.creator_id] = new Set()
    permissions[p.creator_id].add(p.permission_type as PermissionType)
  })

  if (roleIds.length > 0) {
    const { data: rolePerms } = await supabase
      .from('admin_permissions')
      .select('creator_id, permission_type')
      .in('role_id', roleIds)

    ;(rolePerms || []).forEach(p => {
      if (!permissions[p.creator_id]) permissions[p.creator_id] = new Set()
      permissions[p.creator_id].add(p.permission_type as PermissionType)
    })
  }

  return {
    visibleCreatorIds: Array.from(creatorIds),
    permissions,
  }
}
