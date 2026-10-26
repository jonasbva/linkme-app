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
 * How far back discovery looks when a creator has nothing bound yet. A link
 * worth auto-binding is recent; once something IS bound, the lookback comes
 * from that link's age instead (see lookbackFor).
 */
const DISCOVERY_LOOKBACK_DAYS = 93

export interface LinkPassResult {
  creatorsChecked: number
  linksSeen: number
  /** Links bound to an account during this pass. */
  newlyConnected: { creator: string; username: string; link: string }[]
  snapshotsWritten: number
  dailyRowsWritten: number
  /** Bound links Infloww no longer returns — deleted, or older than the lookback. */
  linksMissing: string[]
  /** Creators with no resolvable Infloww counterpart. */
  creatorsSkipped: string[]
  errors: string[]
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
 * The daily tracking-link pass: bind new links, then snapshot every bound one.
 *
 * Both halves need the same thing — this creator's list of Infloww tracking
 * links — so they share one fetch. Done separately it was two walks per
 * creator, and /v1/links costs one request per 31 days of lookback, so the
 * saving is most of the run.
 *
 * Binding is deliberately conservative: only an EXACT handle match (score 100)
 * is written without a human. A 90 (equal once punctuation is dropped) or a 75
 * (near-miss) is a good suggestion for the Links page, but not good enough to
 * write unattended — @sophiaawesst and @sophiaa.wesst are different accounts
 * that differ by one dot. Where several links match, the newest wins, because
 * listTrackingLinks returns them newest-first.
 *
 * Pass `creatorId` to limit the pass to one creator.
 */
export async function runInflowwLinkPass(creatorId?: string): Promise<LinkPassResult> {
  const supabase = createServerSupabaseClient()
  const result: LinkPassResult = {
    creatorsChecked: 0, linksSeen: 0, newlyConnected: [],
    snapshotsWritten: 0, dailyRowsWritten: 0,
    linksMissing: [], creatorsSkipped: [], errors: [],
  }

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

  const creatorIds = creators.map(c => c.id)

  const [{ data: accounts }, { data: allLinks }] = await Promise.all([
    supabase.from('social_accounts')
      .select('id, creator_id, username')
      .eq('is_active', true)
      .in('creator_id', creatorIds),
    supabase.from('tracking_links')
      .select('id, creator_id, social_account_id, label, infloww_link_id, infloww_created_at')
      .eq('is_active', true)
      .in('creator_id', creatorIds),
  ])

  const accountsByCreator = new Map<string, { id: string; username: string }[]>()
  for (const a of accounts || []) {
    const list = accountsByCreator.get(a.creator_id) || []
    list.push({ id: a.id, username: a.username })
    accountsByCreator.set(a.creator_id, list)
  }
  const linksByCreator = new Map<string, NonNullable<typeof allLinks>>()
  for (const l of allLinks || []) {
    const list = linksByCreator.get(l.creator_id) || []
    list.push(l)
    linksByCreator.set(l.creator_id, list)
  }

  // Resolve every creator against one roster fetch rather than one each.
  const resolved = await resolveMany(creatorIds, cfg)

  const today = dayString()
  const yesterday = dayString(-1)

  for (const creator of creators) {
    const creatorAccounts = accountsByCreator.get(creator.id) || []
    const creatorLinks = linksByCreator.get(creator.id) || []
    const bound = creatorLinks.filter(l => l.infloww_link_id)
    // Nothing to bind and nothing to refresh.
    if (creatorAccounts.length === 0 && bound.length === 0) continue

    const inflowwCreatorId = resolved.get(creator.id)
    if (!inflowwCreatorId) {
      result.creatorsSkipped.push(creator.display_name)
      continue
    }
    result.creatorsChecked++

    // One fetch, wide enough for both halves: back to the oldest link we
    // already track, or the discovery window when we track none yet.
    const lookback = bound.length > 0 ? lookbackFor(bound) : DISCOVERY_LOOKBACK_DAYS
    let links: InflowwLink[]
    try {
      links = await listTrackingLinks(cfg, inflowwCreatorId, lookback)
    } catch (e) {
      result.errors.push(`${creator.display_name}: ${e instanceof Error ? e.message : 'fetch failed'}`)
      continue
    }
    result.linksSeen += links.length
    const liveById = new Map(links.map(l => [l.id, l]))

    // ── 1. Bind anything new ──
    const claimed = new Set(bound.map(l => String(l.infloww_link_id)))
    const linkByAccount = new Map(
      creatorLinks.filter(l => l.social_account_id).map(l => [l.social_account_id as string, l])
    )

    for (const account of creatorAccounts) {
      const current = linkByAccount.get(account.id)
      if (current?.infloww_link_id) continue

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

      if (current) {
        const { error } = await supabase.from('tracking_links').update(payload).eq('id', current.id)
        if (error) { result.errors.push(`${account.username}: ${error.message}`); continue }
        bound.push({ ...current, ...payload })
      } else {
        const { data: created, error } = await supabase.from('tracking_links').insert({
          ...payload,
          creator_id: creator.id,
          social_account_id: account.id,
          sort_order: creatorLinks.length,
        }).select('id, creator_id, social_account_id, label, infloww_link_id, infloww_created_at').single()
        if (error || !created) { result.errors.push(`${account.username}: ${error?.message || 'insert failed'}`); continue }
        bound.push(created)
      }

      claimed.add(match.id)
      result.newlyConnected.push({ creator: creator.display_name, username: account.username, link: match.name })
    }

    // ── 2. Snapshot every bound link, including the ones just bound ──
    if (bound.length === 0) continue

    const snapshotRows: Record<string, unknown>[] = []
    const linkIds: string[] = []
    for (const row of bound) {
      const l = liveById.get(String(row.infloww_link_id))
      if (!l) {
        // Deleted in Infloww, or created before the lookback reaches.
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

      // Keep the cached name and creation date current for the UI and for the
      // next pass's lookback.
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
      result.errors.push(`${creator.display_name}: ${snapErr.message}`)
      continue
    }
    result.snapshotsWritten += snapshotRows.length

    // Yesterday's counters turn cumulative totals into a day's numbers.
    const { data: prior } = await supabase
      .from('infloww_link_snapshots')
      .select('tracking_link_id, click_count, sub_count, earnings_net_cents')
      .eq('date', yesterday)
      .in('tracking_link_id', linkIds)

    const priorBy = new Map((prior || []).map(p => [p.tracking_link_id, p]))

    const dailyRows: Record<string, unknown>[] = []
    for (const snap of snapshotRows) {
      const prev = priorBy.get(snap.tracking_link_id as string)
      if (!prev) continue // no baseline — leave the day blank rather than guess
      dailyRows.push({
        tracking_link_id: snap.tracking_link_id,
        date: today,
        // A counter going backwards means Infloww reset or rebuilt the link;
        // clamp at zero instead of writing a negative day.
        infloww_clicks: Math.max(0, (snap.click_count as number) - (prev.click_count || 0)),
        infloww_new_subs: Math.max(0, (snap.sub_count as number) - (prev.sub_count || 0)),
        infloww_earnings_net_cents: Math.max(0, (snap.earnings_net_cents as number) - (prev.earnings_net_cents || 0)),
      })
    }

    if (dailyRows.length > 0) {
      // onConflict names only the infloww_* columns, so hand-entered views /
      // profile_views / link_clicks survive a sync untouched.
      const { error: dailyErr } = await supabase
        .from('link_daily')
        .upsert(dailyRows, { onConflict: 'tracking_link_id,date' })
      if (dailyErr) result.errors.push(`${creator.display_name}: ${dailyErr.message}`)
      else result.dailyRowsWritten += dailyRows.length
    }
  }

  return result
}
