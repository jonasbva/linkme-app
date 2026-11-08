import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CHALLENGE_VIEWER_IDS, isChallengeViewer } from '@/lib/challenge/access-policy'
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
describe('Private challenge release: Max only', () => {
  it('contains exactly the approved stable account ID', () => {
    expect(CHALLENGE_VIEWER_IDS).toEqual([maxId])
    expect(isChallengeViewer(maxId)).toBe(true)
    expect(isChallengeViewer('Max')).toBe(false)
    for (const participant of PARTICIPANTS) expect(isChallengeViewer(participant.id)).toBe(false)
  })
  it('allows active Max and rechecks current account privileges', async () => {
    mock.account.data.is_super_admin = false
    const result = await requireChallengeAccess()
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.user.is_super_admin).toBe(false)
    expect(mock.lookup).toHaveBeenCalledWith('id', maxId)
  })
  it('has no super-admin or display-name bypass for Jonas or other accounts', async () => {
    mock.gate.user = { id: 'cbad9d09-e4b4-4198-ac4f-b167ef765792', display_name: 'Max', is_super_admin: true }
    expect(await requireChallengeAccess()).toMatchObject({ ok: false, status: 403 })
    expect(mock.lookup).not.toHaveBeenCalled()
  })
  it.each(PARTICIPANTS.map(p => [p.name, p.id]))('denies %s even with a valid active session', async (_name, id) => {
    mock.gate.user.id = id
    expect(await requireChallengeAccess()).toMatchObject({ ok: false, status: 403 })
    expect(mock.lookup).not.toHaveBeenCalled()
  })
  it('requires authentication', async () => {
    mock.gate = { ok: false, status: 401, error: 'Unauthorized' }
    expect(await requireChallengeAccess()).toMatchObject({ ok: false, status: 401 })
  })
  it('denies deactivated Max even with an unexpired signed session', async () => {
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
