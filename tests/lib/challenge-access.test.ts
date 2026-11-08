import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PARTICIPANTS } from '@/lib/challenge/config'

const maxId = 'f0579a4d-dd34-4787-88aa-baa5b0c9ce75'
const mock = vi.hoisted(() => ({
  gate: {} as any, account: {} as any, lookup: vi.fn(),
}))
vi.mock('@/lib/auth', () => ({ requireUser: async () => mock.gate }))
vi.mock('@/lib/supabase', () => ({ createServerSupabaseClient: () => ({ from: () => ({ select: () => ({ eq: (...args: any[]) => {
  mock.lookup(...args)
  return { single: async () => mock.account }
} }) }) }) }))
import { requireChallengeAccess } from '@/lib/challenge/access'

beforeEach(() => {
  vi.clearAllMocks()
  mock.gate = { ok: true, user: { id: maxId, display_name: 'Max', is_super_admin: true } }
  mock.account = { data: { is_active: true, is_super_admin: true }, error: null }
})
describe('Challenge release to all active dashboard users', () => {
  it('continues to allow Max and refreshes current account privileges', async () => {
    mock.account.data.is_super_admin = false
    const result = await requireChallengeAccess()
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.user.is_super_admin).toBe(false)
    expect(mock.lookup).toHaveBeenCalledWith('id', maxId)
  })
  it.each([
    ['Jonas', 'cbad9d09-e4b4-4198-ac4f-b167ef765792'],
    ...PARTICIPANTS.map(p => [p.name, p.id]),
    ['Richard', 'c0f13e81-43e3-478d-b607-bf56306c6d50'],
  ])('allows active %s without requiring super-admin privileges or enrollment', async (name, id) => {
    mock.gate.user = { id, display_name: name, is_super_admin: false }
    mock.account.data.is_super_admin = false
    expect(await requireChallengeAccess()).toMatchObject({ ok: true, user: { id, is_super_admin: false } })
    expect(mock.lookup).toHaveBeenCalledWith('id', id)
  })
  it('still requires authentication', async () => {
    mock.gate = { ok: false, status: 401, error: 'Unauthorized' }
    expect(await requireChallengeAccess()).toMatchObject({ ok: false, status: 401 })
    expect(mock.lookup).not.toHaveBeenCalled()
  })
  it('denies a deactivated account even with an unexpired signed super-admin session', async () => {
    mock.account.data.is_active = false
    expect(await requireChallengeAccess()).toMatchObject({ ok: false, status: 403 })
  })
  it('fails closed on database failure and missing account', async () => {
    mock.account = { data: null, error: { message: 'unavailable' } }
    expect(await requireChallengeAccess()).toMatchObject({ ok: false, status: 403 })
    mock.account = { data: null, error: null }
    expect(await requireChallengeAccess()).toMatchObject({ ok: false, status: 403 })
  })
})
