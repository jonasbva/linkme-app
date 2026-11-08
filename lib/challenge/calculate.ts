import { CHALLENGE, PARTICIPANTS, Participant } from './config'
import { businessDate, challengeDates, offsetDate } from './dates'

export interface DailySub { creator_id: string; date: string; new_subs: number | null; updated_at?: string }
export interface CreatorIdentity { id: string }
export interface CreatorProgress {
  id: string; name: string; target: number; minimum?: boolean
  access: boolean; exists: boolean; total: number | null; percent: number | null
  latestDate: string | null; missingDates: string[]; invalidDates: string[]
}
export interface Racer extends Participant {
  total: number | null; percent: number | null; rank: number | null; complete: boolean
  restricted: boolean; remaining: number | null; expected: number; delta: number | null
  dailyAverage: number | null; requiredDaily: number | null; reached: boolean
  latestDate: string | null; breakdown: CreatorProgress[]
  history: { date: string; actual: number | null; expected: number }[]
}
export interface Race {
  asOf: string | null; latestDate: string | null; updatedAt: string | null
  elapsedDays: number; remainingDays: number; expectedPercent: number
  scaleMax: number; provisional: boolean; restricted: boolean; racers: Racer[]
}
export function calculateRace({ rows, creators, visibleIds = null, now = new Date(), cutoff }: {
  rows: DailySub[]; creators: CreatorIdentity[]; visibleIds?: string[] | null; now?: Date; cutoff?: string
}): Race {
  const today = businessDate(now)
  const lastAllowed = today < CHALLENGE.end ? today : CHALLENGE.end
  const boundedRows = rows.filter(r => r.date >= CHALLENGE.start && r.date <= lastAllowed && (!cutoff || r.date <= cutoff))
  const configuredIds = new Set(PARTICIPANTS.flatMap(p => p.creators.map(c => c.id)))
  const visible = visibleIds === null ? null : new Set(visibleIds)
  const existing = new Set(creators.map(c => c.id))
  const relevant = boundedRows.filter(r => configuredIds.has(r.creator_id) && (!visible || visible.has(r.creator_id)))
  const latestDate = relevant.map(r => r.date).sort().at(-1) ?? null
  const reportThrough = cutoff || (latestDate && latestDate >= offsetDate(today, -1) ? latestDate : offsetDate(today, -1))
  const asOf = reportThrough < CHALLENGE.start ? null : reportThrough > lastAllowed ? lastAllowed : reportThrough
  const dates = challengeDates(asOf)
  const elapsedDays = dates.length
  const requiredDates = dates
  const byCell = new Map(relevant.map(r => [`${r.creator_id}:${r.date}`, r]))
  const racers: Racer[] = PARTICIPANTS.map(p => {
    const breakdown: CreatorProgress[] = p.creators.map(c => {
      const access = !visible || visible.has(c.id)
      const cells = dates.map(d => byCell.get(`${c.id}:${d}`))
      const valid = cells.filter((r): r is DailySub & { new_subs: number } => !!r && Number.isSafeInteger(r.new_subs) && r.new_subs! >= 0)
      const total = access && existing.has(c.id) && valid.length ? valid.reduce((s, r) => s + r.new_subs, 0) : null
      return { ...c, access, exists: existing.has(c.id), total, percent: total === null ? null : total / c.target * 100,
        latestDate: valid.map(r => r.date).sort().at(-1) ?? null,
        missingDates: access ? requiredDates.filter(d => !byCell.has(`${c.id}:${d}`)) : [],
        invalidDates: access ? requiredDates.filter(d => { const r = byCell.get(`${c.id}:${d}`); return !!r && (!Number.isSafeInteger(r.new_subs) || r.new_subs! < 0) }) : [],
      }
    })
    const restricted = breakdown.some(c => !c.access)
    const hasValues = breakdown.some(c => c.total !== null)
    const total = restricted || !hasValues || breakdown.some(c => !c.exists) ? null : breakdown.reduce((s, c) => s + (c.total ?? 0), 0)
    const complete = elapsedDays > 0 && breakdown.every(c => c.access && c.exists && !c.missingDates.length && !c.invalidDates.length && c.total !== null)
    const expected = p.target * elapsedDays / CHALLENGE.days
    const remaining = total === null ? null : Math.max(0, p.target - total)
    let cumulative = 0
    let continuous = true
    const history = dates.map((date, i) => {
      for (const c of breakdown) {
        const cell = byCell.get(`${c.id}:${date}`)
        if (!c.access || !c.exists || !cell || !Number.isSafeInteger(cell.new_subs) || cell.new_subs! < 0) continuous = false
        else cumulative += cell.new_subs!
      }
      return { date, actual: continuous ? cumulative : null, expected: p.target * (i + 1) / CHALLENGE.days }
    })
    return { ...p, total, percent: total === null ? null : total / p.target * 100, rank: null,
      complete, restricted, expected, remaining, delta: total === null ? null : total - expected,
      dailyAverage: complete ? total! / elapsedDays : null,
      requiredDaily: remaining === 0 ? 0 : complete && elapsedDays < CHALLENGE.days ? Math.ceil(remaining! / (CHALLENGE.days - elapsedDays)) : null,
      reached: total !== null && total >= p.target,
      latestDate: breakdown.map(c => c.latestDate).filter((d): d is string => d !== null).sort().at(-1) ?? null,
      breakdown, history,
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
