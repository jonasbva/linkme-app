import { CHALLENGE } from './config'

export function businessDate(now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: CHALLENGE.timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now)
  const part = (type: string) => parts.find(p => p.type === type)!.value
  return `${part('year')}-${part('month')}-${part('day')}`
}
export function offsetDate(date: string, days: number): string {
  return new Date(Date.parse(`${date}T12:00:00Z`) + days * 86400000).toISOString().slice(0, 10)
}
export function validDate(date: unknown): date is string {
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return false
  const time = Date.parse(`${date}T12:00:00Z`)
  return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === date
}
// Daily entries describe completed days. A persisted entry for today is still
// counted if present; default reporting otherwise ends yesterday, in Berlin.
export function challengeDates(through: string | null): string[] {
  if (!through || through < CHALLENGE.start) return []
  const end = through > CHALLENGE.end ? CHALLENGE.end : through
  const result: string[] = []
  for (let d: string = CHALLENGE.start; d <= end; d = offsetDate(d, 1)) result.push(d)
  return result
}
