import { createHash, randomBytes } from 'node:crypto'
import { createServerSupabaseClient } from './supabase'
import type { ApiPrincipal } from './api-principal'
export { getApiPrincipal, runWithApiPrincipal } from './api-principal'
export type { ApiPrincipal } from './api-principal'

export const API_KEY_FIELDS = 'id, name, prefix, user_id, created_at, expires_at, revoked_at, last_used_at'
export const API_USER_FIELDS = 'id, display_name, email, is_active, is_super_admin'
export const API_TOKEN_PATTERN = /^bva_api_[A-Za-z0-9_-]{43}$/

export function hashApiToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export function generateApiToken(): { token: string; hash: string; prefix: string } {
  const token = `bva_api_${randomBytes(32).toString('base64url')}`
  return { token, hash: hashApiToken(token), prefix: token.slice(0, 16) }
}

type Authentication =
  | { ok: true; principal: ApiPrincipal }
  | { ok: false; status: number; error: string }

export async function authenticateApiRequest(req: Request): Promise<Authentication> {
  // Only bearer headers are supported. Cookies, query strings, read-only MCP
  // tokens and URL segments never grant this API write access.
  const match = /^Bearer (\S+)$/i.exec(req.headers.get('authorization') || '')
  if (!match || !API_TOKEN_PATTERN.test(match[1])) {
    return { ok: false, status: 401, error: 'A valid API bearer key is required.' }
  }
  // No public-key fallback for this privileged boundary.
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { ok: false, status: 503, error: 'API access is not configured.' }
  }
  try {
    const { data, error } = await createServerSupabaseClient().rpc('consume_dashboard_api_key', {
      p_key_hash: hashApiToken(match[1]),
    })
    if (error) return { ok: false, status: 503, error: 'API access is temporarily unavailable.' }
    const row = data?.[0]
    if (!row) return { ok: false, status: 401, error: 'API key is invalid, expired or revoked.' }
    if (row.rate_limited) return { ok: false, status: 429, error: 'API limit exceeded. Try again in one minute.' }
    return {
      ok: true,
      principal: {
        keyId: row.key_id,
        user: { id: row.user_id, email: row.email, display_name: row.display_name, is_super_admin: row.is_super_admin === true },
      },
    }
  } catch {
    return { ok: false, status: 503, error: 'API access is temporarily unavailable.' }
  }
}

export async function recordApiRequest(
  principal: ApiPrincipal,
  entry: { method: string; path: string; status: number; durationMs: number },
): Promise<void> {
  // No query strings, bodies, headers or keys in the audit log. Route labels are
  // canonical registry paths; never record arbitrary caller-supplied URL text.
  const { error } = await createServerSupabaseClient().from('dashboard_api_requests').insert({
    key_id: principal.keyId,
    user_id: principal.user.id,
    method: entry.method,
    path: entry.path,
    status: entry.status,
    duration_ms: Math.max(0, Math.round(entry.durationMs)),
  })
  if (error) throw new Error('API request audit unavailable')
}
