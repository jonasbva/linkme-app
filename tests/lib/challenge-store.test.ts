import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CHALLENGE, PARTICIPANTS, type Participant } from '@/lib/challenge/config'
import type { ChallengePatch, CreatorPatch } from '@/lib/challenge/input'

const mock = vi.hoisted(() => ({
  row: null as any,
  readError: null as any,
  creatorError: null as any,
  writeError: null as any,
  conflict: false,
  creators: [] as { id: string; display_name: string }[],
  calls: [] as any[],
}))

vi.mock('@/lib/supabase', () => ({ createServerSupabaseClient: () => ({ from: (table: string) => {
  const call: any = { table, operation: 'select', filters: [] }
  mock.calls.push(call)
  const finish = () => {
    if (table === 'creators') {
      const ids = call.filters.find((filter: any) => filter.column === 'id')?.values || []
      return { data: mock.creators.filter(creator => ids.includes(creator.id)), error: mock.creatorError }
    }
    if (call.operation === 'select') return { data: structuredClone(mock.row), error: mock.readError }
    if (mock.writeError) return { data: null, error: mock.writeError }
    if (mock.conflict) return { data: null, error: null }
    mock.row = structuredClone(call.row)
    return { data: { revision: call.row.revision }, error: null }
  }
  const query: any = {
    select: (columns: string) => { call.columns = columns; return query },
    eq: (column: string, value: unknown) => { call.filters.push({ column, value }); return query },
    in: (column: string, values: string[]) => { call.filters.push({ column, values }); return query },
    insert: (row: unknown) => { call.operation = 'insert'; call.row = row; return query },
    update: (row: unknown) => { call.operation = 'update'; call.row = row; return query },
    maybeSingle: async () => finish(),
    then: (resolve: any) => resolve(finish()),
  }
  return query
} }) }))

import { loadChallengeConfiguration, updateChallengeConfiguration } from '@/lib/challenge/store'

const defaults = () => structuredClone(PARTICIPANTS)
const creatorPatches = (participant: Participant): CreatorPatch[] => participant.creators.map(({ name: _name, ...creator }) => creator)
const writes = () => mock.calls.filter(call => call.table === 'challenge_configurations' && call.operation !== 'select')
const patch = (revision = 0): ChallengePatch => ({
  expectedRevision: revision,
  participants: [{ id: PARTICIPANTS[2].id, target: 18000, basis: 'Updated approved basis.' }],
})

beforeEach(() => {
  mock.row = null
  mock.readError = null
  mock.creatorError = null
  mock.writeError = null
  mock.conflict = false
  mock.creators = PARTICIPANTS.flatMap(participant => participant.creators.map(creator => ({ id: creator.id, display_name: creator.name })))
  mock.calls = []
})

describe('Persistent challenge configuration', () => {
  it('uses the corrected approved defaults at revision zero until the first edit', async () => {
    const configuration = await loadChallengeConfiguration()
    expect(configuration.revision).toBe(0)
    expect(configuration.participants[2]).toMatchObject({ name: 'Jano', target: 17895, baseline: 14912 })
    expect(configuration.participants[2].creators.some(creator => creator.name === 'Lily Brown')).toBe(true)
    expect(configuration.participants[3]).toMatchObject({ name: 'Luka', target: 7096, baseline: 4580 })
    expect(configuration.participants[3].creators.find(creator => creator.name === 'Fernanda')).toMatchObject({ target: 1600, startDate: '2026-11-15' })
    configuration.participants[0].target = 1
    expect(PARTICIPANTS[0].target).toBe(21802)
    expect(writes()).toEqual([])
  })

  it('never turns a failed configuration read into a silent defaults reset', async () => {
    mock.readError = { message: 'database unavailable' }
    await expect(loadChallengeConfiguration()).rejects.toThrow('nicht geladen')
    await expect(updateChallengeConfiguration(patch(), 'operator')).rejects.toThrow('nicht geladen')
    expect(writes()).toEqual([])
  })

  it('loads edited targets while preserving enrollment order and approved bonuses', async () => {
    const participants = defaults().reverse()
    const jano = participants.find(participant => participant.name === 'Jano')!
    jano.target = 19000
    jano.bonus = 9999
    jano.currency = 'USD'
    mock.row = { revision: 3, participants }
    const configuration = await loadChallengeConfiguration()
    expect(configuration.revision).toBe(3)
    expect(configuration.participants.map(participant => participant.id)).toEqual(PARTICIPANTS.map(participant => participant.id))
    expect(configuration.participants[2]).toMatchObject({ target: 19000, bonus: 250, currency: 'EUR' })
  })

  it.each([
    { revision: 0, participants: defaults() },
    { revision: 1, participants: [] },
    { revision: 1, participants: defaults().slice(1) },
    { revision: 1, participants: defaults().map((participant, index) => index === 0 ? { ...participant, target: 0 } : participant) },
  ])('rejects malformed persisted configuration %#', async row => {
    mock.row = row
    await expect(loadChallengeConfiguration()).rejects.toThrow()
    expect(writes()).toEqual([])
  })

  it('rejects a stale expected revision before resolving creators or writing', async () => {
    mock.row = { revision: 4, participants: defaults() }
    await expect(updateChallengeConfiguration(patch(3), 'operator')).rejects.toMatchObject({ status: 409 })
    expect(mock.calls.map(call => call.table)).toEqual(['challenge_configurations'])
    expect(writes()).toEqual([])
  })

  it('saves a multi-manager reassignment atomically and reloads the same configuration', async () => {
    const participants = defaults()
    const [jano, luka] = [participants[2], participants[3]]
    const lily = jano.creators.find(creator => creator.name === 'Lily Brown')!
    const change: ChallengePatch = {
      expectedRevision: 0,
      participants: [
        { id: jano.id, target: jano.target - lily.target, creators: creatorPatches(jano).filter(creator => creator.id !== lily.id) },
        { id: luka.id, target: luka.target + lily.target, creators: [...creatorPatches(luka), { id: lily.id, target: lily.target }] },
      ],
    }
    const saved = await updateChallengeConfiguration(change, 'operator')
    expect(saved.revision).toBe(1)
    expect(saved.participants[2].creators.some(creator => creator.id === lily.id)).toBe(false)
    expect(saved.participants[3].creators.find(creator => creator.id === lily.id)).toMatchObject({ name: 'Lily Brown', target: 5718 })
    expect(writes()).toHaveLength(1)
    expect(writes()[0]).toMatchObject({ operation: 'insert', row: { id: CHALLENGE.id, revision: 1, updated_by: 'operator' } })
    expect(writes()[0].row.participants).toHaveLength(PARTICIPANTS.length)
    expect(await loadChallengeConfiguration()).toEqual(saved)
    expect(mock.calls.find(call => call.table === 'creators').filters).toEqual([
      { column: 'id', values: expect.arrayContaining([lily.id]) },
    ])
  })

  it('does not allow one manager patch to double-count a creator still assigned elsewhere', async () => {
    const change: ChallengePatch = {
      expectedRevision: 0,
      participants: [{ id: PARTICIPANTS[3].id, creators: [...creatorPatches(PARTICIPANTS[3]), creatorPatches(PARTICIPANTS[2])[0]] }],
    }
    await expect(updateChallengeConfiguration(change, 'operator')).rejects.toMatchObject({ status: 400 })
    expect(writes()).toEqual([])
  })

  it('rejects delayed creator targets exceeding the manager total', async () => {
    const change: ChallengePatch = { expectedRevision: 0, participants: [{ id: PARTICIPANTS[3].id, target: 1599 }] }
    await expect(updateChallengeConfiguration(change, 'operator')).rejects.toMatchObject({ status: 400 })
    expect(writes()).toEqual([])
  })

  it('rejects an unknown creator before saving any portion of the batch', async () => {
    const change: ChallengePatch = {
      expectedRevision: 0,
      participants: [{ id: PARTICIPANTS[2].id, creators: [{ id: '11111111-1111-4111-8111-111111111111', target: 100 }] }],
    }
    await expect(updateChallengeConfiguration(change, 'operator')).rejects.toMatchObject({ status: 404 })
    expect(writes()).toEqual([])
  })

  it('fails closed on creator lookup errors', async () => {
    mock.creatorError = { message: 'private database details' }
    const change: ChallengePatch = { expectedRevision: 0, participants: [{ id: PARTICIPANTS[2].id, creators: creatorPatches(PARTICIPANTS[2]) }] }
    await expect(updateChallengeConfiguration(change, 'operator')).rejects.toThrow('Creator lookup failed')
    expect(writes()).toEqual([])
  })

  it('requires the stored revision in the atomic update filter', async () => {
    mock.row = { revision: 3, participants: defaults() }
    const saved = await updateChallengeConfiguration(patch(3), 'operator')
    expect(saved.revision).toBe(4)
    expect(writes()).toHaveLength(1)
    expect(writes()[0]).toMatchObject({ operation: 'update', filters: [{ column: 'id', value: CHALLENGE.id }, { column: 'revision', value: 3 }] })
    expect(await loadChallengeConfiguration()).toEqual(saved)
  })

  it('reports a concurrent first insertion as a version conflict', async () => {
    mock.writeError = { code: '23505' }
    await expect(updateChallengeConfiguration(patch(), 'operator')).rejects.toMatchObject({ status: 409 })
    expect(mock.row).toBeNull()
  })

  it('reports an update lost to another writer as a version conflict', async () => {
    mock.row = { revision: 3, participants: defaults() }
    mock.conflict = true
    await expect(updateChallengeConfiguration(patch(3), 'operator')).rejects.toMatchObject({ status: 409 })
    expect(mock.row.revision).toBe(3)
  })

  it('does not claim success when the database rejects a save', async () => {
    mock.writeError = { code: 'XX000', message: 'private database failure' }
    await expect(updateChallengeConfiguration(patch(), 'operator')).rejects.toThrow('nicht gespeichert')
    expect(mock.row).toBeNull()
  })
})
