import { describe, expect, it } from 'vitest'
import { PARTICIPANTS } from '@/lib/challenge/config'
import { parseChallengePatch } from '@/lib/challenge/input'

const [first, second] = PARTICIPANTS
const creator = { id: first.creators[0].id, target: 1600, startDate: '2026-11-15' }
const single = (changes: Record<string, unknown>) => parseChallengePatch({ expectedRevision: 0, ...changes }, first.id)
const batch = (participants: unknown[]) => parseChallengePatch({ expectedRevision: 2, participants })
const invalid = { ok: false, error: expect.any(String) }

describe('challenge PATCH input', () => {
  it('accepts one manager, preserves false and zero, and normalizes text and UUIDs', () => {
    expect(parseChallengePatch({
      expectedRevision: 0, target: 7096, baseline: 0, basis: ' Updated basis ', provisional: false,
      creators: [{ ...creator, id: creator.id.toUpperCase(), minimum: false }],
    }, first.id.toUpperCase())).toEqual({
      ok: true,
      value: {
        expectedRevision: 0,
        participants: [{ id: first.id, target: 7096, baseline: 0, basis: 'Updated basis', provisional: false, creators: [{ ...creator, minimum: false }] }],
      },
    })
  })

  it('accepts multiple manager changes atomically without deriving targets from creator sums', () => {
    expect(batch([
      { id: first.id, target: 17895, creators: [{ id: creator.id, target: 5718 }] },
      { id: second.id, baseline: 4580, basis: 'New baseline' },
    ])).toEqual({
      ok: true,
      value: {
        expectedRevision: 2,
        participants: [
          { id: first.id, target: 17895, creators: [{ id: creator.id, target: 5718 }] },
          { id: second.id, baseline: 4580, basis: 'New baseline' },
        ],
      },
    })
  })

  it.each([null, [], '', new Date(), Object.create({ expectedRevision: 0 })])('rejects non-object JSON input %j', value => {
    expect(parseChallengePatch(value)).toEqual(invalid)
  })

  it.each([undefined, null, -1, 0.1, '0', NaN, Infinity, 2147483647, Number.MAX_SAFE_INTEGER])('rejects invalid revisions %j', expectedRevision => {
    expect(parseChallengePatch({ expectedRevision, target: 1 }, first.id)).toEqual(invalid)
  })

  it('accepts the largest supported revision and numeric fields', () => {
    expect(parseChallengePatch({ expectedRevision: 2147483646, target: 2147483647, baseline: 2147483647 }, first.id).ok).toBe(true)
  })

  it.each([
    { bonus: 500 }, { name: 'Someone else' }, { id: second.id }, { is_super_admin: true },
    { participants: [] }, { target: 1, extra: true },
  ])('rejects unsupported single-manager fields %j', changes => {
    expect(single(changes)).toEqual(invalid)
  })

  it('rejects unknown fields at each nesting level, including caller-provided creator names', () => {
    expect(parseChallengePatch({ expectedRevision: 0, participants: [{ id: first.id, target: 1 }], target: 2 })).toEqual(invalid)
    expect(batch([{ id: first.id, target: 1, bonus: 100 }])).toEqual(invalid)
    expect(single({ creators: [{ ...creator, name: 'Forged name' }] })).toEqual(invalid)
    expect(single({ creators: [{ ...creator, arbitrary: true }] })).toEqual(invalid)
  })

  it.each([0, -1, 0.5, null, '100', true, NaN, Infinity, 2147483648])('rejects invalid positive targets %j', target => {
    expect(single({ target })).toEqual(invalid)
    expect(single({ creators: [{ ...creator, target }] })).toEqual(invalid)
  })

  it.each([-1, 0.5, null, '0', true, NaN, Infinity, 2147483648])('rejects invalid baselines %j', baseline => {
    expect(single({ baseline })).toEqual(invalid)
  })

  it.each(['', '  ', null, 123, 'x'.repeat(2001)])('rejects invalid basis text %j', basis => {
    expect(single({ basis })).toEqual(invalid)
  })

  it.each(['false', 0, null])('requires actual booleans %j', value => {
    expect(single({ provisional: value })).toEqual(invalid)
    expect(single({ creators: [{ ...creator, minimum: value }] })).toEqual(invalid)
  })

  it('requires at least one editable field per participant', () => {
    expect(single({})).toEqual(invalid)
    expect(batch([{ id: first.id }])).toEqual(invalid)
  })

  it.each([undefined, null, [], {}, Array.from({ length: 7 }, () => ({ id: first.id, target: 1 }))])('rejects absent, empty, or oversized batches %j', participants => {
    expect(parseChallengePatch({ expectedRevision: 0, participants })).toEqual(invalid)
  })

  it('rejects unknown, malformed, and duplicate manager IDs', () => {
    expect(batch([{ id: '00000000-0000-0000-0000-000000000000', target: 1 }])).toEqual(invalid)
    expect(batch([{ id: 'not-a-uuid', target: 1 }])).toEqual(invalid)
    expect(batch([{ id: first.id, target: 1 }, { id: first.id.toUpperCase(), basis: 'Another' }])).toEqual(invalid)
    expect(parseChallengePatch({ expectedRevision: 0, target: 1 }, '')).toEqual(invalid)
  })

  it.each([null, [], {}, Array.from({ length: 101 }, () => creator), [null], [{}], [{ id: 'not-a-uuid', target: 1 }]])('rejects invalid creator collections %j', creators => {
    expect(single({ creators })).toEqual(invalid)
  })

  it('rejects duplicate creators in one manager or across the same batch', () => {
    expect(single({ creators: [creator, { ...creator, id: creator.id.toUpperCase() }] })).toEqual(invalid)
    expect(batch([
      { id: first.id, creators: [creator] },
      { id: second.id, creators: [creator] },
    ])).toEqual(invalid)
  })

  it.each(['2026-10-31', '2026-12-01', '2026-11-31', '2026-11-5', '2026-11-15T00:00:00Z', '', null, 15])('rejects invalid start dates %j', startDate => {
    expect(single({ creators: [{ ...creator, startDate }] })).toEqual(invalid)
  })

  it.each(['2026-11-01', '2026-11-30'])('includes both challenge date boundaries %s', startDate => {
    expect(single({ creators: [{ ...creator, startDate }] }).ok).toBe(true)
  })

  it('does not mutate or retain mutable creator arrays from the request', () => {
    const input = { expectedRevision: 0, creators: [{ ...creator }] }
    const parsed = parseChallengePatch(input, first.id)
    expect(input).toEqual({ expectedRevision: 0, creators: [creator] })
    if (!parsed.ok) throw new Error(parsed.error)
    input.creators[0].target = 999
    expect(parsed.value.participants[0].creators![0].target).toBe(1600)
  })
})
