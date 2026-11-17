import { CHALLENGE, PARTICIPANTS, Participant } from './config'
import { businessDate, challengeDates, offsetDate } from './dates'

export interface DailySub { creator_id: string; date: string; new_subs: number | null; updated_at?: string }
export interface CreatorIdentity { id: string }
export interface CreatorProgress {
  id: string; name: string; target: number; minimum?: boolean; startDate?: string
  access: boolean; exists: boolean; total: number | null; percent: number | null
  latestDate: string | null; missingDates: string[]; invalidDates: string[]
}
export interface Racer extends Participant {
  total: number | null; percent: number | null; rank: number | null; complete: boolean
  restricted: boolean; remaining: number | null; expected: number; delta: number | null
  dailyAverage: number | null; requiredDaily: number | null; reached: boolean
  latestDate: string | null; breakdown: CreatorProgress[]
  history: { date: string; actual: number | null; expected: number }[]
  expectedHistory: { date: string; expected: number }[]
}
export interface Race {
  asOf: string | null; latestDate: string | null; updatedAt: string | null
  elapsedDays: number; remainingDays: number; expectedPercent: number
  scaleMax: number; provisional: boolean; restricted: boolean; racers: Racer[]
}
export function calculateRace({ rows, creators, visibleIds = null, now = new Date(), cutoff, participants = PARTICIPANTS }: {
  rows: DailySub[]; creators: CreatorIdentity[]; visibleIds?: string[] | null; now?: Date; cutoff?: string; participants?: Participant[]
}): Race {
  const today = businessDate(now)
  const lastAllowed = today < CHALLENGE.end ? today : CHALLENGE.end
  const boundedRows = rows.filter(r => r.date >= CHALLENGE.start && r.date <= lastAllowed && (!cutoff || r.date <= cutoff))
  const configuredCreators = new Map(participants.flatMap(p => p.creators.map(c => [c.id, c] as const)))
  const visible = visibleIds === null ? null : new Set(visibleIds)
  const existing = new Set(creators.map(c => c.id))
  const relevant = boundedRows.filter(r => {
    const creator = configuredCreators.get(r.creator_id)
    return creator && r.date >= (creator.startDate || CHALLENGE.start) && (!visible || visible.has(r.creator_id))
  })
  const latestDate = relevant.map(r => r.date).sort().at(-1) ?? null
  const reportThrough = cutoff || (latestDate && latestDate >= offsetDate(today, -1) ? latestDate : offsetDate(today, -1))
  const asOf = reportThrough < CHALLENGE.start ? null : reportThrough > lastAllowed ? lastAllowed : reportThrough
  const dates = challengeDates(asOf)
  const elapsedDays = dates.length
  const allDates = challengeDates(CHALLENGE.end)
  const byCell = new Map(relevant.map(r => [`${r.creator_id}:${r.date}`, r]))
  const racers: Racer[] = participants.map(p => {
    const delayedCreators = p.creators.filter(c => c.startDate && c.startDate > CHALLENGE.start)
    const fullMonthTarget = p.target - delayedCreators.reduce((sum, c) => sum + c.target, 0)
    // Keep the explicit manager goal (including its original rounding). Only
    // later additions earn their share of the expected total after they start.
    const expectedHistory = allDates.map((date, index) => ({ date,
      expected: fullMonthTarget * (index + 1) / CHALLENGE.days + delayedCreators.reduce((sum, c) => {
        const activeDates = allDates.filter(d => d >= c.startDate!)
        return sum + (activeDates.length ? c.target * activeDates.filter(d => d <= date).length / activeDates.length : 0)
      }, 0),
    }))
    const breakdown: CreatorProgress[] = p.creators.map(c => {
      const access = !visible || visible.has(c.id)
      const requiredDates = dates.filter(d => d >= (c.startDate || CHALLENGE.start))
      const notStarted = !!c.startDate && (!asOf || asOf < c.startDate)
      const cells = requiredDates.map(d => byCell.get(`${c.id}:${d}`))
      const valid = cells.filter((r): r is DailySub & { new_subs: number } => !!r && Number.isSafeInteger(r.new_subs) && r.new_subs! >= 0)
      const total = !access ? null : notStarted ? 0 : existing.has(c.id) && valid.length ? valid.reduce((s, r) => s + r.new_subs, 0) : null
      return { ...c, access, exists: existing.has(c.id), total, percent: total === null ? null : total / c.target * 100,
        latestDate: valid.map(r => r.date).sort().at(-1) ?? null,
        missingDates: access ? requiredDates.filter(d => !byCell.has(`${c.id}:${d}`)) : [],
        invalidDates: access ? requiredDates.filter(d => { const r = byCell.get(`${c.id}:${d}`); return !!r && (!Number.isSafeInteger(r.new_subs) || r.new_subs! < 0) }) : [],
      }
    })
    const restricted = breakdown.some(c => !c.access)
    const notStarted = (c: CreatorProgress) => !!c.startDate && (!asOf || asOf < c.startDate)
    const hasValues = breakdown.some(c => !notStarted(c) && c.total !== null)
    const total = restricted || !hasValues || breakdown.some(c => !notStarted(c) && !c.exists) ? null : breakdown.reduce((s, c) => s + (c.total ?? 0), 0)
    const complete = elapsedDays > 0 && breakdown.every(c => c.access && (notStarted(c) || (c.exists && !c.missingDates.length && !c.invalidDates.length && c.total !== null)))
    const expected = expectedHistory[elapsedDays - 1]?.expected ?? 0
    const remaining = total === null ? null : Math.max(0, p.target - total)
    let cumulative = 0
    let continuous = true
    const history = dates.map((date, i) => {
      for (const c of breakdown) {
        if (c.startDate && date < c.startDate) continue
        const cell = byCell.get(`${c.id}:${date}`)
        if (!c.access || !c.exists || !cell || !Number.isSafeInteger(cell.new_subs) || cell.new_subs! < 0) continuous = false
        else cumulative += cell.new_subs!
      }
      return { date, actual: continuous ? cumulative : null, expected: expectedHistory[i].expected }
    })
    return { ...p, total, percent: total === null ? null : total / p.target * 100, rank: null,
      complete, restricted, expected, remaining, delta: total === null ? null : total - expected,
      dailyAverage: complete ? total! / elapsedDays : null,
      requiredDaily: remaining === 0 ? 0 : complete && elapsedDays < CHALLENGE.days ? Math.ceil(remaining! / (CHALLENGE.days - elapsedDays)) : null,
      reached: total !== null && total >= p.target,
      latestDate: breakdown.map(c => c.latestDate).filter((d): d is string => d !== null).sort().at(-1) ?? null,
      breakdown, history, expectedHistory,
    }
  })
  // Cross multiplication preserves real ties (and never uses absolute subs as
  // a tie breaker). Fixed config order is the lane order, independently of rank.
  for (const racer of racers) {
    if (racer.total !== null) racer.rank = 1 + racers.filter(other => other.total !== null && other.total * racer.target > racer.total! * other.target).length
  }
  const max = Math.max(100, ...racers.map(r => r.percent ?? 0))
  return {
    asOf, latestDate, elapsedDays, remainingDays: CHALLENGE.days - elapsedDays,
    expectedPercent: elapsedDays / CHALLENGE.days * 100,
    updatedAt: relevant.map(r => r.updated_at).filter((d): d is string => !!d).sort().at(-1) ?? null,
    scaleMax: max <= 100 ? 100 : Math.ceil(max / 25) * 25,
    restricted: racers.some(r => r.restricted), provisional: racers.some(r => !r.complete), racers,
  }
}
