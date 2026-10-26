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
  getInflowwConfig, listTrackingLinks, resolveInflowwCreatorId,
  type InflowwConfig, type InflowwLink,
} from './infloww'

export interface SyncResult {
  linksConsidered: number
  snapshotsWritten: number
  dailyRowsWritten: number
  creatorsSkipped: string[]
  linksMissing: string[]
  errors: string[]
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
    .select('id, creator_id, infloww_link_id, label')
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
      live = new Map((await listTrackingLinks(cfg, inflowwCreatorId)).map(l => [l.id, l]))
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
