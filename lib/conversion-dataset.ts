/**
 * Read-only conversion dataset + aggregation used by the management MCP server.
 *
 * The logic here is a port of the standalone `boese-subscriber-mcp` server, moved
 * server-side so management can use a *remote* MCP connector (URL only, nothing to
 * install). Everything in this file is read-only — it never writes to the DB.
 */

import { createServerSupabaseClient } from './supabase'

// ── Types (the conversion working set) ──

export interface DsCreator {
  id: string
  display_name: string
  slug: string
  of_handle: string | null
  is_active: boolean | null
}
export interface DsAccount {
  id: string
  creator_id: string
  handle: string
  display_label: string | null
  is_active: boolean | null
}
export interface DsExpectation {
  conversion_account_id: string | null
  creator_id: string
  daily_sub_target: number
}
export interface DsDaily {
  conversion_account_id: string
  creator_id: string
  date: string
  new_subs: number
}
export interface Dataset {
  generated_at: string
  range: { from: string | null; to: string | null }
  creators: DsCreator[]
  accounts: DsAccount[]
  expectations: DsExpectation[]
  daily: DsDaily[]
}

// ── Date helpers ──
//
// The agency operates in Europe/Berlin while Vercel runs in UTC, so "yesterday"
// is resolved in Berlin time. Otherwise a request made at 00:30 Berlin would
// report the wrong day. DB dates are plain YYYY-MM-DD.

const TZ = 'Europe/Berlin'

export function ymdInTz(d: Date): string {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d)
}

export function today(): string {
  return ymdInTz(new Date())
}

export function yesterday(): string {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() - 1)
  return ymdInTz(d)
}

// Step whole days from a YYYY-MM-DD anchored at midday UTC, which keeps the
// arithmetic DST-proof.
function atNoonUtc(ymd: string): Date {
  return new Date(`${ymd}T12:00:00Z`)
}

export function daysAgoFrom(base: string, n: number): string {
  const d = atNoonUtc(base)
  d.setUTCDate(d.getUTCDate() - n)
  return d.toISOString().slice(0, 10)
}

export function datesBetween(from: string, to: string): string[] {
  const out: string[] = []
  const end = atNoonUtc(to)
  const d = atNoonUtc(from)
  while (d <= end) {
    out.push(d.toISOString().slice(0, 10))
    d.setUTCDate(d.getUTCDate() + 1)
  }
  return out
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
export function assertYmd(label: string, value: string | undefined): void {
  if (value !== undefined && !DATE_RE.test(value)) {
    throw new Error(`${label} must be a date in YYYY-MM-DD format (got "${value}").`)
  }
}

// ── Fetch ──

export async function fetchConversionDataset(opts: {
  from?: string
  to?: string
  all?: boolean
}): Promise<Dataset> {
  const supabase = createServerSupabaseClient()

  const defFrom = new Date()
  defFrom.setUTCDate(defFrom.getUTCDate() - 180)
  const from = (opts.from || ymdInTz(defFrom)).slice(0, 10)
  const to = (opts.to || today()).slice(0, 10)

  const [creatorsRes, accountsRes, expsRes] = await Promise.all([
    supabase.from('creators').select('id, display_name, slug, of_handle, is_active'),
    supabase.from('conversion_accounts').select('id, creator_id, handle, display_label, is_active'),
    supabase
      .from('conversion_expectations')
      .select('conversion_account_id, creator_id, daily_sub_target'),
  ])

  const metaErr = creatorsRes.error || accountsRes.error || expsRes.error
  if (metaErr) throw new Error(metaErr.message)

  // Supabase caps a single response at 1000 rows — page through.
  const daily: DsDaily[] = []
  const PAGE = 1000
  let offset = 0
  // eslint-disable-next-line no-constant-condition
  while (true) {
    let q = supabase
      .from('conversion_daily')
      .select('conversion_account_id, creator_id, date, new_subs')
      .not('conversion_account_id', 'is', null)
      .order('date', { ascending: true })
    if (!opts.all) q = q.gte('date', from).lte('date', to)
    const { data, error } = await q.range(offset, offset + PAGE - 1)
    if (error) throw new Error(error.message)
    daily.push(...((data || []) as DsDaily[]))
    if (!data || data.length < PAGE) break
    offset += PAGE
  }

  return {
    generated_at: new Date().toISOString(),
    range: opts.all ? { from: null, to: null } : { from, to },
    creators: (creatorsRes.data || []) as DsCreator[],
    accounts: (accountsRes.data || []) as DsAccount[],
    expectations: (expsRes.data || []) as DsExpectation[],
    daily,
  }
}

// ── Lookup helpers ──

function norm(s: string | null | undefined): string {
  return (s || '').toLowerCase().trim()
}
function accountLabel(a: DsAccount): string {
  return a.display_label || a.handle
}

export interface Index {
  ds: Dataset
  creatorById: Map<string, DsCreator>
  accountById: Map<string, DsAccount>
  targetByAccount: Map<string, number>
}

export function indexDataset(ds: Dataset): Index {
  const creatorById = new Map(ds.creators.map(c => [c.id, c]))
  const accountById = new Map(ds.accounts.map(a => [a.id, a]))
  const targetByAccount = new Map<string, number>()
  for (const e of ds.expectations) {
    if (e.conversion_account_id) targetByAccount.set(e.conversion_account_id, e.daily_sub_target)
  }
  return { ds, creatorById, accountById, targetByAccount }
}

function fullLabel(idx: Index, accountId: string): string {
  const a = idx.accountById.get(accountId)
  if (!a) return accountId
  const c = idx.creatorById.get(a.creator_id)
  const cn = c?.display_name || 'Unknown'
  const al = accountLabel(a)
  return al.toLowerCase() === cn.toLowerCase() ? cn : `${cn} (${al})`
}

/** Resolve a free-text creator/handle query to a set of account ids. null = all accounts. */
function resolveAccountIds(query: string | undefined, idx: Index): Set<string> | null {
  const q = norm(query)
  if (!q) return null
  const matchedCreators = new Set(
    idx.ds.creators
      .filter(c => norm(c.display_name).includes(q) || norm(c.slug).includes(q) || norm(c.of_handle).includes(q))
      .map(c => c.id),
  )
  const ids = new Set<string>()
  for (const a of idx.ds.accounts) {
    if (matchedCreators.has(a.creator_id) || norm(a.handle).includes(q) || norm(a.display_label).includes(q)) {
      ids.add(a.id)
    }
  }
  return ids
}

// ── Tools ──

export async function listCreators(args: { active_only?: boolean }) {
  const idx = indexDataset(await fetchConversionDataset({ from: today(), to: today() }))
  const activeOnly = args.active_only !== false
  const byCreator = idx.ds.creators
    .map(c => {
      const accts = idx.ds.accounts
        .filter(a => a.creator_id === c.id && (!activeOnly || a.is_active !== false))
        .map(a => ({
          handle: a.handle,
          label: accountLabel(a),
          daily_target: idx.targetByAccount.get(a.id) ?? null,
        }))
      return { creator: c.display_name, slug: c.slug, of_handle: c.of_handle, accounts: accts }
    })
    .filter(c => c.accounts.length > 0)
    .sort((a, b) => a.creator.localeCompare(b.creator))
  return { creator_count: byCreator.length, creators: byCreator }
}

export async function getDailySubscribers(args: {
  date?: string
  from?: string
  to?: string
  creator?: string
}) {
  assertYmd('date', args.date)
  assertYmd('from', args.from)
  assertYmd('to', args.to)

  let rFrom: string
  let rTo: string
  if (args.date) {
    rFrom = rTo = args.date
  } else if (args.from || args.to) {
    rFrom = args.from || args.to!
    rTo = args.to || args.from!
  } else {
    rFrom = rTo = yesterday()
  }

  const idx = indexDataset(await fetchConversionDataset({ from: rFrom, to: rTo }))
  const allow = resolveAccountIds(args.creator, idx)
  if (allow && allow.size === 0) throw new Error(`No accounts matched creator "${args.creator}".`)

  const rows = idx.ds.daily
    .filter(d => !allow || allow.has(d.conversion_account_id))
    .map(d => ({
      date: d.date,
      account: fullLabel(idx, d.conversion_account_id),
      handle: idx.accountById.get(d.conversion_account_id)?.handle ?? null,
      new_subs: d.new_subs,
      target: idx.targetByAccount.get(d.conversion_account_id) ?? null,
    }))
    .sort((a, b) => a.date.localeCompare(b.date) || a.account.localeCompare(b.account))

  const perDay: Record<string, number> = {}
  for (const r of rows) perDay[r.date] = (perDay[r.date] || 0) + r.new_subs
  const total = rows.reduce((s, r) => s + r.new_subs, 0)

  return {
    range: { from: rFrom, to: rTo },
    creator_filter: args.creator || null,
    total_new_subs: total,
    per_day_totals: perDay,
    rows,
  }
}

export async function getSubscriberSummary(args: { from?: string; to?: string; creator?: string }) {
  assertYmd('from', args.from)
  assertYmd('to', args.to)

  const rTo = args.to || yesterday()
  const rFrom = args.from || daysAgoFrom(rTo, 29)
  const idx = indexDataset(await fetchConversionDataset({ from: rFrom, to: rTo }))
  const allow = resolveAccountIds(args.creator, idx)
  if (allow && allow.size === 0) throw new Error(`No accounts matched creator "${args.creator}".`)

  const rows = idx.ds.daily.filter(d => !allow || allow.has(d.conversion_account_id))
  const dayCount = datesBetween(rFrom, rTo).length

  const perAccount = new Map<string, { total: number; days: number }>()
  const perDay: Record<string, number> = {}
  for (const d of rows) {
    const a = perAccount.get(d.conversion_account_id) || { total: 0, days: 0 }
    a.total += d.new_subs
    a.days += 1
    perAccount.set(d.conversion_account_id, a)
    perDay[d.date] = (perDay[d.date] || 0) + d.new_subs
  }

  const perCreator = new Map<string, { total: number; accounts: Array<Record<string, unknown>> }>()
  for (const [accId, agg] of perAccount) {
    const acc = idx.accountById.get(accId)
    if (!acc) continue
    const cId = acc.creator_id || 'unknown'
    const c = perCreator.get(cId) || { total: 0, accounts: [] }
    c.total += agg.total
    c.accounts.push({
      account: accountLabel(acc),
      total: agg.total,
      days_with_data: agg.days,
      avg_per_day: +(agg.total / Math.max(1, agg.days)).toFixed(1),
    })
    perCreator.set(cId, c)
  }

  const creators = [...perCreator.entries()]
    .map(([cId, agg]) => ({
      creator: idx.creatorById.get(cId)?.display_name || 'Unknown',
      total_new_subs: agg.total,
      accounts: agg.accounts.sort((a, b) => (b.total as number) - (a.total as number)),
    }))
    .sort((a, b) => b.total_new_subs - a.total_new_subs)

  const overall = rows.reduce((s, d) => s + d.new_subs, 0)
  const dayEntries = Object.entries(perDay).sort((a, b) => b[1] - a[1])
  const best = dayEntries[0] ? { date: dayEntries[0][0], total: dayEntries[0][1] } : null
  const worst = dayEntries.length
    ? { date: dayEntries[dayEntries.length - 1][0], total: dayEntries[dayEntries.length - 1][1] }
    : null

  return {
    range: { from: rFrom, to: rTo, calendar_days: dayCount },
    creator_filter: args.creator || null,
    overall_total_new_subs: overall,
    avg_per_calendar_day: +(overall / Math.max(1, dayCount)).toFixed(1),
    best_day: best,
    worst_day: worst,
    per_day_totals: perDay,
    creators,
  }
}

export async function getTargetsAndStreaks(args: {
  as_of?: string
  lookback_days?: number
  creator?: string
}) {
  assertYmd('as_of', args.as_of)

  const asOf = args.as_of || yesterday()
  const look = Math.max(1, Math.min(365, args.lookback_days || 30))
  const rFrom = daysAgoFrom(asOf, look - 1)
  const idx = indexDataset(await fetchConversionDataset({ from: rFrom, to: asOf }))
  const allow = resolveAccountIds(args.creator, idx)
  if (allow && allow.size === 0) throw new Error(`No accounts matched creator "${args.creator}".`)
  const dates = datesBetween(rFrom, asOf)

  const results: Array<Record<string, unknown>> = []
  for (const [accId, target] of idx.targetByAccount) {
    if (target <= 0) continue
    if (allow && !allow.has(accId)) continue
    const acc = idx.accountById.get(accId)
    if (!acc || acc.is_active === false) continue

    const map = new Map<string, number>()
    for (const d of idx.ds.daily) if (d.conversion_account_id === accId) map.set(d.date, d.new_subs)

    // Streak from as_of backwards; a day with no entry breaks it.
    let streakLen = 0
    let streakType: 'green' | 'red' | null = null
    for (let i = dates.length - 1; i >= 0; i--) {
      const v = map.get(dates[i])
      if (v === undefined) break
      const met = v >= target
      if (streakType === null) {
        streakType = met ? 'green' : 'red'
        streakLen = 1
      } else if ((streakType === 'green') === met) streakLen++
      else break
    }

    const entried = dates.filter(d => map.has(d))
    const last7 = entried.slice(-7)
    const last7avg = last7.length
      ? +(last7.reduce((s, d) => s + (map.get(d) || 0), 0) / last7.length).toFixed(1)
      : null
    const latest = map.has(asOf) ? map.get(asOf)! : null

    results.push({
      creator: idx.creatorById.get(acc.creator_id)?.display_name || 'Unknown',
      account: accountLabel(acc),
      daily_target: target,
      latest_actual: latest,
      latest_meets_target: latest === null ? null : latest >= target,
      missing_on_as_of: latest === null,
      streak_type: streakType,
      streak_days: streakLen,
      last7_avg: last7avg,
    })
  }

  // Red streaks first (they need attention), longest first; greens last.
  results.sort((a, b) => {
    const rank = (x: Record<string, unknown>) =>
      x.streak_type === 'red' ? 0 : x.streak_type === 'green' ? 2 : 1
    if (rank(a) !== rank(b)) return rank(a) - rank(b)
    return (b.streak_days as number) - (a.streak_days as number)
  })

  return {
    as_of: asOf,
    lookback_days: look,
    creator_filter: args.creator || null,
    account_count: results.length,
    accounts: results,
  }
}

export async function findMissingEntries(args: { date?: string; from?: string; to?: string }) {
  assertYmd('date', args.date)
  assertYmd('from', args.from)
  assertYmd('to', args.to)

  let rFrom: string
  let rTo: string
  if (args.date) {
    rFrom = rTo = args.date
  } else if (args.from || args.to) {
    rFrom = args.from || args.to!
    rTo = args.to || args.from!
  } else {
    rFrom = rTo = yesterday()
  }

  const idx = indexDataset(await fetchConversionDataset({ from: rFrom, to: rTo }))
  const dates = datesBetween(rFrom, rTo)
  const activeAccounts = idx.ds.accounts.filter(a => a.is_active !== false)

  const have = new Set<string>() // `${accId}|${date}`
  for (const d of idx.ds.daily) have.add(`${d.conversion_account_id}|${d.date}`)

  const perDate = dates.map(dt => {
    const missing = activeAccounts
      .filter(a => !have.has(`${a.id}|${dt}`))
      .map(a => ({
        creator: idx.creatorById.get(a.creator_id)?.display_name || 'Unknown',
        account: accountLabel(a),
        handle: a.handle,
      }))
      .sort((x, y) => x.creator.localeCompare(y.creator))
    return { date: dt, missing_count: missing.length, missing }
  })

  const totalMissing = perDate.reduce((s, d) => s + d.missing_count, 0)
  return {
    range: { from: rFrom, to: rTo },
    active_account_count: activeAccounts.length,
    total_missing: totalMissing,
    by_date: perDate,
  }
}

// ── MCP tool registry ──

const YMD_DESC = 'Date in YYYY-MM-DD format.'

export const TOOL_DEFS = [
  {
    name: 'list_creators',
    title: 'List creators & accounts',
    description:
      'List all creators and their tracked accounts (handle, label, and current daily new-subscriber target). ' +
      'Use this first to learn the exact names/handles to pass to the other tools.',
    inputSchema: {
      type: 'object',
      properties: {
        active_only: { type: 'boolean', description: 'Only include active accounts (default true).' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'get_daily_subscribers',
    title: 'Daily new subscribers (fan counts)',
    description:
      'New-subscriber / fan counts per account for a specific day or date range, as entered in the dashboard. ' +
      'Defaults to yesterday if no date is given. Optionally filter to one creator/handle.',
    inputSchema: {
      type: 'object',
      properties: {
        date: { type: 'string', description: `Single day. ${YMD_DESC} Overrides from/to.` },
        from: { type: 'string', description: `Range start. ${YMD_DESC}` },
        to: { type: 'string', description: `Range end. ${YMD_DESC}` },
        creator: { type: 'string', description: 'Filter by creator name, slug, or account handle.' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'get_subscriber_summary',
    title: 'Subscriber summary / totals',
    description:
      'Aggregated new-subscriber totals over a date range: per-creator and per-account totals, overall total, ' +
      'daily grand totals, and best/worst day. Defaults to the last 30 days ending yesterday.',
    inputSchema: {
      type: 'object',
      properties: {
        from: { type: 'string', description: `Range start. ${YMD_DESC} Default: 29 days before "to".` },
        to: { type: 'string', description: `Range end. ${YMD_DESC} Default: yesterday.` },
        creator: { type: 'string', description: 'Filter by creator name, slug, or account handle.' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'get_targets_and_streaks',
    title: 'Targets vs actuals & streaks',
    description:
      'For each account that has a daily new-subscriber target, compares recent actuals to the target and reports the ' +
      'current streak (consecutive days meeting = green, missing = red). Defaults to yesterday, 30-day lookback. ' +
      'A day with no entry breaks the streak.',
    inputSchema: {
      type: 'object',
      properties: {
        as_of: { type: 'string', description: `Most recent day to evaluate. ${YMD_DESC} Default: yesterday.` },
        lookback_days: { type: 'number', description: 'How many days of history to consider (default 30, max 365).' },
        creator: { type: 'string', description: 'Filter by creator name, slug, or account handle.' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'find_missing_entries',
    title: 'Find missing daily entries',
    description:
      'Lists active accounts that have NO new-subscriber entry for the given day (or each day in a range) — the gaps ' +
      'the Overviews team still needs to fill. Defaults to yesterday.',
    inputSchema: {
      type: 'object',
      properties: {
        date: { type: 'string', description: `Single day. ${YMD_DESC} Overrides from/to.` },
        from: { type: 'string', description: `Range start. ${YMD_DESC}` },
        to: { type: 'string', description: `Range end. ${YMD_DESC}` },
      },
      additionalProperties: false,
    },
  },
] as const

export async function callConversionTool(name: string, args: Record<string, any>): Promise<unknown> {
  switch (name) {
    case 'list_creators':
      return listCreators(args)
    case 'get_daily_subscribers':
      return getDailySubscribers(args)
    case 'get_subscriber_summary':
      return getSubscriberSummary(args)
    case 'get_targets_and_streaks':
      return getTargetsAndStreaks(args)
    case 'find_missing_entries':
      return findMissingEntries(args)
    default:
      throw new Error(`Unknown tool "${name}".`)
  }
}
