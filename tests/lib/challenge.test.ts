import { describe, expect, it } from 'vitest'
import { CHALLENGE, PARTICIPANTS } from '@/lib/challenge/config'
import { calculateRace, DailySub } from '@/lib/challenge/calculate'
import { businessDate, challengeDates, validDate } from '@/lib/challenge/dates'

const creators = PARTICIPANTS.flatMap(p => p.creators)
const now = new Date('2026-11-09T09:00:00Z')
const day = (creator_id: string, date: string, new_subs: number): DailySub => ({ creator_id, date, new_subs })
const run = (rows: DailySub[], options: Partial<Parameters<typeof calculateRace>[0]> = {}) => calculateRace({ creators, rows, now, ...options })
const zerosThrough = (through: string) => creators.flatMap(c => challengeDates(through).map(date => day(c.id, date, 0)))

describe('November Challenge', () => {
  it('uses six stable employee IDs and sixteen unique creator IDs, fixed lane order and explicit employee targets', () => {
    expect(PARTICIPANTS.map(p => p.name)).toEqual(['Felix', 'Tom', 'Jano', 'Luka', 'Devyn', 'Jolena'])
    expect(new Set(PARTICIPANTS.map(p => p.id)).size).toBe(6)
    expect(new Set(creators.map(c => c.id)).size).toBe(16)
    expect(PARTICIPANTS.map(p => p.target)).toEqual([21802, 12265, 12177, 11214, 2986, 7500])
    expect(PARTICIPANTS[0].creators.reduce((s, c) => s + c.target, 0)).toBe(21803)
    expect(creators.find(c => c.name === 'Daisy')?.id).toBe('e18c08da-8925-42db-834e-1fd8d0ee0467')
    expect(PARTICIPANTS[0].provisional).toBe(true)
    expect(PARTICIPANTS[5].creators.every(c => c.minimum)).toBe(true)
    expect(PARTICIPANTS.map(p => p.currency)).toEqual(['EUR', 'EUR', 'EUR', 'EUR', 'USD', 'USD'])
  })
  it('ranks by percentage even when the leader has fewer absolute subs', () => {
    const rows = zerosThrough('2026-11-08')
    rows.find(r => r.creator_id === creators[0].id && r.date === '2026-11-01')!.new_subs = 10901
    rows.find(r => r.creator_id === PARTICIPANTS[4].creators[0].id && r.date === '2026-11-01')!.new_subs = 1792
    const race = run(rows)
    expect(race.racers[4].rank).toBe(1)
    expect(race.racers[0].rank).toBe(2)
    expect(race.racers.map(r => r.name)).toEqual(PARTICIPANTS.map(p => p.name))
  })
  it('a correction from 100 to 120 increases the total by only 20; deletion removes it', () => {
    const rows = [day(creators[0].id, '2026-11-01', 100), day(creators[0].id, '2026-11-02', 50)]
    const before = run(rows).racers[0].total!
    rows[0].new_subs = 120
    expect(run(rows).racers[0].total).toBe(before + 20)
    expect(run(rows.slice(1)).racers[0].total).toBe(50)
  })
  it('distinguishes recorded zero from missing and suppresses unreliable pace', () => {
    const race = run(zerosThrough('2026-11-08'))
    expect(race.provisional).toBe(false)
    expect(race.racers[0]).toMatchObject({ total: 0, complete: true, dailyAverage: 0, rank: 1 })
    const missing = run(zerosThrough('2026-11-08').filter(r => !(r.creator_id === creators[0].id && r.date === '2026-11-02')))
    expect(missing.provisional).toBe(true)
    expect(missing.racers[0].dailyAverage).toBeNull()
    expect(missing.racers[0].requiredDaily).toBeNull()
    expect(missing.racers[0].breakdown[0].missingDates).toEqual(['2026-11-02'])
    expect(missing.racers[0].history[1].actual).toBeNull()
    expect(missing.racers[0].history[2].actual).toBeNull()
    expect(run([]).racers[0].total).toBeNull()
  })
  it('keeps a deleted last day visible as missing rather than shifting the report period backwards', () => {
    const race = run(zerosThrough('2026-11-07'))
    expect(race.asOf).toBe('2026-11-08')
    expect(race.latestDate).toBe('2026-11-07')
    expect(race.elapsedDays).toBe(8)
    expect(race.racers[0].expected).toBe(21802 * 8 / 30)
    expect(race.racers[0].breakdown[0].missingDates).toEqual(['2026-11-08'])
  })
  it('assigns genuine ties the same competition rank without an absolute-count tie breaker', () => {
    const rows = zerosThrough('2026-11-08')
    for (const p of PARTICIPANTS.slice(0, 2)) rows.find(r => r.creator_id === p.creators[0].id && r.date === '2026-11-01')!.new_subs = p.target
    const race = run(rows)
    expect(race.racers.map(r => r.rank)).toEqual([1, 1, 3, 3, 3, 3])
  })
  it('compares unrounded ratios and expands one shared scale beyond 100%', () => {
    const rows = zerosThrough('2026-11-08')
    for (const [i, factor] of [[0, 1.1], [1, 1.25]]) rows.find(r => r.creator_id === PARTICIPANTS[i].creators[0].id && r.date === '2026-11-01')!.new_subs = Math.ceil(PARTICIPANTS[i].target * factor)
    const race = run(rows)
    expect(race.racers[1].rank).toBe(1)
    expect(race.racers[0].percent).toBeLessThan(race.racers[1].percent!)
    expect(race.scaleMax).toBeGreaterThanOrEqual(race.racers[1].percent!)
    expect(race.racers[1].remaining).toBe(0)
    expect(race.racers[1].requiredDaily).toBe(0)
  })
  it('uses employee total for Jolena bonus without inventing a minimum-goal lock', () => {
    const rows = zerosThrough('2026-11-08')
    rows.find(r => r.creator_id === PARTICIPANTS[5].creators[0].id && r.date === '2026-11-01')!.new_subs = 7500
    const jolena = run(rows).racers[5]
    expect(jolena.reached).toBe(true)
    expect(jolena.breakdown[1].total).toBe(0)
    expect(jolena.breakdown.every(c => c.minimum)).toBe(true)
  })
  it('excludes dates outside November and future rows, and handles start/end without division by zero', () => {
    const rows = [day(creators[0].id, '2026-10-31', 999), day(creators[0].id, '2026-11-01', 10), day(creators[0].id, '2026-11-10', 888), day(creators[0].id, '2026-12-01', 999)]
    expect(run(rows).racers[0].total).toBe(10)
    const before = run(rows, { now: new Date('2026-10-31T10:00:00Z') })
    expect(before.elapsedDays).toBe(0)
    expect(before.racers[0].dailyAverage).toBeNull()
    const end = run(zerosThrough('2026-11-30'), { now: new Date('2026-12-01T10:00:00Z') })
    expect(end.elapsedDays).toBe(30)
    expect(end.remainingDays).toBe(0)
    expect(end.racers[0].requiredDaily).toBeNull()
    expect(end.racers[0].expected).toBe(PARTICIPANTS[0].target)
    expect(JSON.stringify(end)).not.toContain('Infinity')
  })
  it('uses Berlin business dates across UTC boundaries and rejects impossible dates', () => {
    expect(businessDate(new Date('2026-11-07T23:30:00Z'))).toBe('2026-11-08')
    expect(validDate('2026-11-31')).toBe(false)
    expect(validDate('2026-11-30')).toBe(true)
    expect(challengeDates('2026-12-05')).toHaveLength(30)
  })
  it('recomputes historical cutoffs from current corrected entries', () => {
    const rows = [day(creators[0].id, '2026-11-08', 100), day(creators[0].id, '2026-11-09', 500)]
    expect(run(rows, { now: new Date('2026-11-17'), cutoff: '2026-11-08' }).racers[0].total).toBe(100)
    expect(CHALLENGE.reports.map(r => r.cutoff)).toEqual(['2026-11-08', '2026-11-15', '2026-11-22', '2026-11-30'])
  })
  it('never exposes partial totals as full totals or counts inaccessible rows', () => {
    const race = run(zerosThrough('2026-11-08'), { visibleIds: [creators[0].id] })
    expect(race.restricted).toBe(true)
    expect(race.racers[0].total).toBeNull()
    expect(race.racers[0].rank).toBeNull()
    expect(race.racers[0].breakdown[1].total).toBeNull()
    expect(race.racers[0].breakdown[1].missingDates).toEqual([])
  })
  it('does not treat invalid/null/negative stored values as captured zero', () => {
    const rows = zerosThrough('2026-11-08')
    rows[0].new_subs = null
    rows[1].new_subs = -5
    const racer = run(rows).racers[0]
    expect(racer.complete).toBe(false)
    expect(racer.breakdown[0].invalidDates).toHaveLength(2)
    expect(racer.total).toBe(0)
  })
  it('detects a missing configured creator without silently reducing target', () => {
    const race = run(zerosThrough('2026-11-08'), { creators: creators.slice(1) })
    expect(race.racers[0].total).toBeNull()
    expect(race.racers[0].target).toBe(21802)
    expect(race.racers[0].breakdown[0].exists).toBe(false)
  })
})
