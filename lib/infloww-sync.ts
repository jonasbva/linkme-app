// Pull per-link stats from Infloww into infloww_link_snapshots, then derive the
// daily numbers that the Conversions page shows.
//
// Infloww reports CUMULATIVE counters per tracking link (clicks and subs since
// the link was made), so a day's figures are the difference between two
// snapshots. We therefore snapshot once a day and only write a daily row when
// yesterday's snapshot exists — a gap in the series would otherwise be booked
// as one enormous day.

import { createServerSupabaseClient } from './supabase'
import {
  getInflowwConfig, listTrackingLinks, listInflowwCreators, matchScore,
  resolveInflowwCreatorId, type InflowwConfig, type InflowwLink,
} from './infloww'

export interface SyncResult {
  linksConsidered: number
  snapshotsWritten: number
  dailyRowsWritten: number
  creatorsSkipped: string[]
  linksMissing: string[]
  errors: string[]
}

/**
 * Our creator ids → Infloww creator ids, for many creators at once.
 *
 * resolveInflowwCreatorId re-fetches the whole roster every time it falls back
 * to of_handle, so calling it per creator means one full roster pull each. Do
 * the roster once and resolve against it.
 */
async function resolveMany(creatorIds: string[], cfg: InflowwConfig): Promise<Map<string, string>> {
  const supabase = createServerSupabaseClient()
  const out = new Map<string, string>()

  const { data: mapped } = await supabase
    .from('infloww_creator_map')
    .select('creator_id, infloww_creator_id')
    .in('creator_id', creatorIds)
  for (const m of mapped || []) {
    if (m.infloww_creator_id) out.set(m.creator_id, String(m.infloww_creator_id))
  }

  const unresolved = creatorIds.filter(id => !out.has(id))
  if (unresolved.length === 0) return out

  const { data: creators } = await supabase
    .from('creators')
    .select('id, of_handle')
    .in('id', unresolved)
    .not('of_handle', 'is', null)
  if (!creators || creators.length === 0) return out

  const norm = (v: string) => v.toLowerCase().replace(/[^a-z0-9]/g, '')
  const roster = await listInflowwCreators(cfg)
  const byHandle = new Map(roster.map(c => [norm(c.userName), c.id]))
  for (const c of creators) {
    const hit = byHandle.get(norm(c.of_handle as string))
    if (hit) out.set(c.id, hit)
  }
  return out
}

/**
 * How far back discovery looks. A link worth auto-binding was made recently —
 * anything older has either been bound already or is not in use. Keeping this
 * short is what lets discovery and the snapshot pass share one cron run.
 */
const DISCOVERY_LOOKBACK_DAYS = 93

export interface DiscoveryResult {
  creatorsChecked: number
  linksSeen: number
  connected: { creator: string; username: string; link: string }[]
  errors: string[]
}

/**
 * Pull every creator's Infloww tracking links and bind the ones that clearly
 * belong to an account we track, so new links wire themselves up instead of
 * waiting for someone to do it by hand.
 *
 * Deliberately conservative: only an EXACT handle match (score 100) is bound
 * automatically. A 90 (punctuation-stripped) or 75 (near-miss) is a good
 * suggestion for a human in the Links page, but not good enough to write
 * without anyone looking — @sophiaawesst and @sophiaa.wesst are different
 * accounts that differ by one dot.
 */
export async function discoverTrackingLinks(creatorId?: string): Promise<DiscoveryResult> {
  const supabase = createServerSupabaseClient()
  const result: DiscoveryResult = { creatorsChecked: 0, linksSeen: 0, connected: [], errors: [] }

  let cfg: InflowwConfig
  try {
    cfg = await getInflowwConfig()
  } catch (e) {
    result.errors.push(e instanceof Error ? e.message : 'Infloww not configured')
    return result
  }

  let creatorQuery = supabase.from('creators').select('id, display_name').eq('is_active', true)
  if (creatorId) creatorQuery = creatorQuery.eq('id', creatorId)
  const { data: creators } = await creatorQuery
  if (!creators || creators.length === 0) return result

  // Only creators that actually have accounts to bind.
  const { data: accounts } = await supabase
    .from('social_accounts')
    .select('id, creator_id, username')
    .eq('is_active', true)
    .in('creator_id', creators.map(c => c.id))
  if (!accounts || accounts.length === 0) return result

  const accountsByCreator = new Map<string, { id: string; username: string }[]>()
  for (const a of accounts) {
    const list = accountsByCreator.get(a.creator_id) || []
    list.push({ id: a.id, username: a.username })
    accountsByCreator.set(a.creator_id, list)
  }

  const resolved = await resolveMany([...accountsByCreator.keys()], cfg)

  for (const creator of creators) {
    const creatorAccounts = accountsByCreator.get(creator.id)
    if (!creatorAccounts) continue
    const inflowwCreatorId = resolved.get(creator.id)
    if (!inflowwCreatorId) continue
    result.creatorsChecked++

    let links: InflowwLink[]
    try {
      links = await listTrackingLinks(cfg, inflowwCreatorId, DISCOVERY_LOOKBACK_DAYS)
    } catch (e) {
      result.errors.push(`${creator.display_name}: ${e instanceof Error ? e.message : 'fetch failed'}`)
      continue
    }
    result.linksSeen += links.length

    const { data: existing } = await supabase
      .from('tracking_links')
      .select('id, social_account_id, infloww_link_id')
      .eq('creator_id', creator.id)

    const rows = existing || []
    const claimed = new Set(rows.map(r => r.infloww_link_id).filter(Boolean) as string[])
    const linkByAccount = new Map(rows.filter(r => r.social_account_id).map(r => [r.social_account_id as string, r]))

    for (const account of creatorAccounts) {
      const current = linkByAccount.get(account.id)
      if (current?.infloww_link_id) continue // already wired

      const match = links.find(l => !claimed.has(l.id) && matchScore(l.name, account.username) === 100)
      if (!match) continue

      const payload = {
        infloww_link_id: match.id,
        infloww_link_name: match.name,
        infloww_code: match.code,
        infloww_created_at: match.createdTime,
        infloww_synced_at: new Date().toISOString(),
        label: match.name,
        updated_at: new Date().toISOString(),
      }

      const { error } = current
        ? await supabase.from('tracking_links').update(payload).eq('id', current.id)
        : await supabase.from('tracking_links').insert({
            ...payload,
            creator_id: creator.id,
            social_account_id: account.id,
            sort_order: rows.length,
          })

      if (error) {
        result.errors.push(`${account.username}: ${error.message}`)
        continue
      }
      claimed.add(match.id)
      result.connected.push({ creator: creator.display_name, username: account.username, link: match.name })
    }
  }

  return result
}

/**
 * How far back /v1/links has to reach for this creator, from the creation dates
 * we already recorded. A link with no recorded date falls back to a year, which
 * is what the first sync after this change will do once, and never again.
 */
function lookbackFor(rows: { infloww_created_at?: string | null }[]): number {
  let oldest: number | null = null
  for (const row of rows) {
    if (!row.infloww_created_at) return 365
    const t = new Date(row.infloww_created_at).getTime()
    if (!Number.isNaN(t) && (oldest === null || t < oldest)) oldest = t
  }
  if (oldest === null) return 365
  // Pad by a window so a link made right on a boundary is still covered.
  return Math.min(365, Math.ceil((Date.now() - oldest) / 86400000) + 31)
}

function dayString(offsetDays = 0): string {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().split('T')[0]
}

/**
 * Refresh stats for every tracking link bound to an Infloww link.
 * Pass `creatorId` to limit the run to one creator.
 */
export async function syncInflowwLinkStats(creatorId?: string): Promise<SyncResult> {
  const supabase = createServerSupabaseClient()
  const result: SyncResult = {
    linksConsidered: 0, snapshotsWritten: 0, dailyRowsWritten: 0,
    creatorsSkipped: [], linksMissing: [], errors: [],
  }

  let q = supabase
    .from('tracking_links')
    .select('id, creator_id, infloww_link_id, label, infloww_created_at')
    .not('infloww_link_id', 'is', null)
    .eq('is_active', true)
  if (creatorId) q = q.eq('creator_id', creatorId)

  const { data: bound, error } = await q
  if (error) {
    result.errors.push(error.message)
    return result
  }
  if (!bound || bound.length === 0) return result
  result.linksConsidered = bound.length

  let cfg: InflowwConfig
  try {
    cfg = await getInflowwConfig()
  } catch (e) {
    result.errors.push(e instanceof Error ? e.message : 'Infloww not configured')
    return result
  }

  // One /v1/links walk per creator covers all of that creator's links.
  const byCreator = new Map<string, typeof bound>()
  for (const row of bound) {
    const list = byCreator.get(row.creator_id) || []
    list.push(row)
    byCreator.set(row.creator_id, list)
  }

  const today = dayString()
  const yesterday = dayString(-1)

  for (const [cid, rows] of byCreator) {
    let live: Map<string, InflowwLink>
    try {
      const inflowwCreatorId = await resolveInflowwCreatorId(cid, cfg)
      if (!inflowwCreatorId) {
        result.creatorsSkipped.push(cid)
        continue
      }
      // Only walk back as far as this creator's oldest known link. Infloww
      // filters /v1/links on creation time, so anything older than that is
      // guaranteed to hold nothing of ours.
      live = new Map(
        (await listTrackingLinks(cfg, inflowwCreatorId, lookbackFor(rows))).map(l => [l.id, l])
      )
    } catch (e) {
      result.errors.push(`${cid}: ${e instanceof Error ? e.message : 'fetch failed'}`)
      continue
    }

    const snapshotRows: any[] = []
    const linkIds: string[] = []
    for (const row of rows) {
      const l = live.get(String(row.infloww_link_id))
      if (!l) {
        // The link was deleted in Infloww, or it is older than the lookback.
        result.linksMissing.push(row.id)
        continue
      }
      linkIds.push(row.id)
      snapshotRows.push({
        tracking_link_id: row.id,
        date: today,
        click_count: l.clickCount,
        sub_count: l.subCount,
        earnings_gross_cents: l.earningsGrossCents,
        earnings_net_cents: l.earningsNetCents,
        paying_fans_count: l.payingFansCount,
        subscription_cvr: l.subscriptionCvr,
        spending_cvr: l.spendingCvr,
        captured_at: new Date().toISOString(),
      })

      // Keep the cached name fresh so the UI shows what Infloww shows.
      await supabase
        .from('tracking_links')
        .update({
          infloww_link_name: l.name,
          infloww_code: l.code,
          infloww_created_at: l.createdTime,
          infloww_synced_at: new Date().toISOString(),
        })
        .eq('id', row.id)
    }

    if (snapshotRows.length === 0) continue

    const { error: snapErr } = await supabase
      .from('infloww_link_snapshots')
      .upsert(snapshotRows, { onConflict: 'tracking_link_id,date' })
    if (snapErr) {
      result.errors.push(`${cid}: ${snapErr.message}`)
      continue
    }
    result.snapshotsWritten += snapshotRows.length

    // Yesterday's counters, to turn cumulative totals into a day's numbers.
    const { data: prior } = await supabase
      .from('infloww_link_snapshots')
      .select('tracking_link_id, click_count, sub_count, earnings_net_cents')
      .eq('date', yesterday)
      .in('tracking_link_id', linkIds)

    const priorBy = new Map((prior || []).map(p => [p.tracking_link_id, p]))

    const dailyRows: any[] = []
    for (const snap of snapshotRows) {
      const prev = priorBy.get(snap.tracking_link_id)
      if (!prev) continue // no baseline — leave the day blank rather than guess
      dailyRows.push({
        tracking_link_id: snap.tracking_link_id,
        date: today,
        // A counter that goes backwards means Infloww reset or rebuilt the
        // link; clamp at zero instead of writing a negative day.
        infloww_clicks: Math.max(0, snap.click_count - (prev.click_count || 0)),
        infloww_new_subs: Math.max(0, snap.sub_count - (prev.sub_count || 0)),
        infloww_earnings_net_cents: Math.max(0, snap.earnings_net_cents - (prev.earnings_net_cents || 0)),
      })
    }

    if (dailyRows.length > 0) {
      // onConflict leaves the hand-entered views/profile_views columns alone:
      // only the infloww_* columns named here are written.
      const { error: dailyErr } = await supabase
        .from('link_daily')
        .upsert(dailyRows, { onConflict: 'tracking_link_id,date' })
      if (dailyErr) result.errors.push(`${cid}: ${dailyErr.message}`)
      else result.dailyRowsWritten += dailyRows.length
    }
  }

  return result
}
