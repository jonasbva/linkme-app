import { requireUser, GuardResult } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase'
import { isChallengeViewer } from './access-policy'

export async function requireChallengeAccess(): Promise<GuardResult> {
  const gate = await requireUser()
  if (!gate.ok) return gate
  if (!isChallengeViewer(gate.user.id)) return { ok: false, status: 403, error: 'Forbidden' }
  // Recheck activity and privileges on each request, including stale sessions.
  const { data, error } = await createServerSupabaseClient().from('admin_users')
    .select('is_active, is_super_admin').eq('id', gate.user.id).single()
  if (error || !data?.is_active) return { ok: false, status: 403, error: 'Forbidden' }
  return { ok: true, user: { ...gate.user, is_super_admin: data.is_super_admin === true } }
}
