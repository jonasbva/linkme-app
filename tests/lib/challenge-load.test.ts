import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PARTICIPANTS } from '@/lib/challenge/config'
const mock = vi.hoisted(() => ({ permissions: {} as any, calls: [] as any[], fail: false }))
vi.mock('@/lib/auth', () => ({ getUserPermissions: async () => mock.permissions }))
vi.mock('@/lib/supabase', () => ({ createServerSupabaseClient: () => ({ from: (table: string) => {
  const call: any = { table, filters: [] }; mock.calls.push(call)
  const query: any = {
    select: (columns: string) => { call.columns = columns; return query },
    in: (column: string, values: string[]) => { call.filters.push({ column, values }); return query },
    gte: (column: string, value: string) => { call.filters.push({ column, gte: value }); return query },
    lte: (column: string, value: string) => { call.filters.push({ column, lte: value }); return query },
    then: (resolve: any) => resolve({ data: table === 'creators' ? PARTICIPANTS.flatMap(p => p.creators).map(c => ({ id: c.id })) : [], error: mock.fail ? { message: 'failure' } : null }),
  }
  return query
} }) }))
import { loadRace } from '@/lib/challenge/load'
const user = { id: 'user', email: '', display_name: 'Employee', is_super_admin: false }
beforeEach(() => { mock.calls = []; mock.fail = false; mock.permissions = { grantAllCreators: false, visibleCreatorIds: [], permissions: {}, allCreatorsPermissions: new Set() } })
describe('Challenge data scope', () => {
  it('does not query privileged data with no conversion permissions', async () => {
    const race = await loadRace(user)
    expect(mock.calls).toEqual([])
    expect(race.restricted).toBe(true)
  })
  it('scopes both creator and daily reads to explicitly permitted creator IDs', async () => {
    const [a, b] = PARTICIPANTS[0].creators
    mock.permissions.visibleCreatorIds = [a.id, b.id]
    mock.permissions.permissions = { [a.id]: new Set(['view_conversions']), [b.id]: new Set(['view_social']) }
    await loadRace(user)
    expect(mock.calls).toHaveLength(2)
    for (const call of mock.calls) expect(call.filters.find((f: any) => f.column === (call.table === 'creators' ? 'id' : 'creator_id')).values).toEqual([a.id, b.id])
  })
  it('keeps inactive creators, uses only daily new_subs, and bounds the November read', async () => {
    await loadRace({ ...user, is_super_admin: true }, '2026-11-08')
    expect(mock.calls.map(c => c.table)).toEqual(['creators', 'creator_daily'])
    expect(mock.calls[1].columns).toBe('creator_id, date, new_subs, updated_at')
    expect(mock.calls[0].filters.some((f: any) => f.column === 'is_active')).toBe(false)
    expect(mock.calls[1].filters).toContainEqual({ column: 'date', gte: '2026-11-01' })
    expect(mock.calls[1].filters).toContainEqual({ column: 'date', lte: '2026-11-08' })
  })
  it('shares standings with enrolled employees while redacting every protected creator observation on the server', async () => {
    const employee = PARTICIPANTS[0]
    const allowed = employee.creators[0].id
    mock.permissions.visibleCreatorIds = [allowed]
    mock.permissions.permissions = { [allowed]: new Set(['view_conversions']) }
    const race = await loadRace({ ...user, id: employee.id })
    expect(mock.calls[1].filters.find((f: any) => f.column === 'creator_id').values).toHaveLength(16)
    expect(race.restricted).toBe(false)
    expect(race.racers[0].breakdown[0].access).toBe(true)
    const redacted = race.racers[0].breakdown[1]
    expect(redacted).toMatchObject({ access: false, total: null, percent: null, latestDate: null, missingDates: [], invalidDates: [] })
    expect(race.racers[4].breakdown[0].access).toBe(false)
  })
  it('does not turn a database failure into an empty race', async () => {
    mock.fail = true
    await expect(loadRace({ ...user, is_super_admin: true })).rejects.toThrow('konnten nicht geladen')
  })
})
