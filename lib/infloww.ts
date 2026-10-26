// Infloww Open API client — the OnlyFans side of conversion tracking.
//
// Each IG account carries one OF tracking link in its bio. Infloww counts the
// clicks and the subs that link produced, so once a tracking_links row knows its
// infloww_link_id we can read real numbers instead of asking someone to type
// them in. See CONTEXT.md "Tracking links".

import { createServerSupabaseClient } from './supabase'
import { decryptSecret } from './infloww-crypto'
import { rateLimitedFetch } from './infloww-rate-limit'

const BASE = 'https://openapi.infloww.com'

/** Infloww rejects a /v1/links window wider than this. */
const MAX_WINDOW_DAYS = 31

/** How far back to look for a creator's links by default. */
const DEFAULT_LOOKBACK_DAYS = 365

export interface InflowwConfig {
  apiKey: string
  agencyOid: string
}

export interface InflowwCreator {
  id: string
  name: string
  userName: string
  nickName?: string
}

/** A TRACKING link as Infloww reports it. Counters are cumulative, not daily. */
export interface InflowwLink {
  id: string
  name: string
  code: string
  clickCount: number
  subCount: number
  earningsGrossCents: number
  earningsNetCents: number
  payingFansCount: number
  subscriptionCvr: number | null
  spendingCvr: number | null
  createdTime: string | null
}

export class InflowwError extends Error {
  status: number
  constructor(message: string, status = 500) {
    super(message)
    this.status = status
  }
}

/** Read + decrypt the single infloww_config row. */
export async function getInflowwConfig(): Promise<InflowwConfig> {
  const supabase = createServerSupabaseClient()
  const { data } = await supabase
    .from('infloww_config')
    .select('api_key, agency_oid, fetching_enabled')
    .limit(1)
    .maybeSingle()

  const apiKey = await decryptSecret(data?.api_key)
  if (!apiKey || !data?.agency_oid) {
    throw new InflowwError('Infloww API is not configured — set the key in Settings.', 400)
  }
  return { apiKey, agencyOid: data.agency_oid }
}

function toNum(v: unknown): number {
  const n = typeof v === 'string' ? Number(v) : typeof v === 'number' ? v : 0
  return Number.isFinite(n) ? n : 0
}

async function call(cfg: InflowwConfig, path: string, params: Record<string, string>): Promise<any> {
  const url = `${BASE}${path}?${new URLSearchParams(params).toString()}`
  const res = await rateLimitedFetch(url, {
    Accept: 'application/json',
    Authorization: cfg.apiKey,
    'x-oid': cfg.agencyOid,
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new InflowwError(
      `Infloww API error (${res.status}): ${body?.errorMessage || res.statusText}`,
      res.status === 401 || res.status === 403 ? res.status : 502,
    )
  }
  return body
}

/** Every OnlyFans creator on the agency account. */
export async function listInflowwCreators(cfg: InflowwConfig): Promise<InflowwCreator[]> {
  const out: InflowwCreator[] = []
  let cursor: string | undefined
  // Guard against a cursor that never terminates.
  for (let page = 0; page < 20; page++) {
    const params: Record<string, string> = { platformCode: 'OnlyFans', limit: '100' }
    if (cursor) params.cursor = cursor
    const body = await call(cfg, '/v1/creators', params)
    for (const c of body?.data?.list || []) {
      out.push({ id: String(c.id), name: c.name || '', userName: c.userName || '', nickName: c.nickName || '' })
    }
    if (!body?.hasMore || !body?.cursor) break
    cursor = String(body.cursor)
  }
  return out
}

function isoAt(d: Date): string {
  return d.toISOString().replace(/\.\d{3}Z$/, 'Z')
}

/**
 * A creator's TRACKING links.
 *
 * /v1/links filters on creation time and caps the window at 31 days, so a full
 * inventory means walking backwards a month at a time. Links are keyed by id,
 * so an overlap between windows costs nothing.
 */
export async function listTrackingLinks(
  cfg: InflowwConfig,
  inflowwCreatorId: string,
  lookbackDays = DEFAULT_LOOKBACK_DAYS,
): Promise<InflowwLink[]> {
  const byId = new Map<string, InflowwLink>()
  const now = Date.now()
  // A year of history is 12 windows per creator. Across the roster that is
  // hundreds of requests, which does not fit in one cron invocation, so
  // callers that know how far back they need pass a shorter lookback.
  const windows = Math.max(1, Math.ceil(lookbackDays / MAX_WINDOW_DAYS))

  for (let w = 0; w < windows; w++) {
    const end = new Date(now - w * MAX_WINDOW_DAYS * 86400000)
    const start = new Date(end.getTime() - MAX_WINDOW_DAYS * 86400000 + 60000)

    let cursor: string | undefined
    for (let page = 0; page < 20; page++) {
      const params: Record<string, string> = {
        creatorId: inflowwCreatorId,
        linkType: 'TRACKING',
        limit: '100',
        startTime: isoAt(start),
        endTime: isoAt(end),
      }
      if (cursor) params.cursor = cursor
      const body = await call(cfg, '/v1/links', params)
      for (const l of body?.data?.list || []) {
        byId.set(String(l.id), {
          id: String(l.id),
          name: l.name || '',
          code: l.code != null ? String(l.code) : '',
          clickCount: toNum(l.clickCount),
          subCount: toNum(l.subCount),
          earningsGrossCents: toNum(l.earningsGross),
          earningsNetCents: toNum(l.earningsNet),
          payingFansCount: toNum(l.payingFansCount),
          subscriptionCvr: l.subscriptionCVR != null ? toNum(l.subscriptionCVR) : null,
          spendingCvr: l.spendingCVR != null ? toNum(l.spendingCVR) : null,
          createdTime: l.createdTime ? new Date(toNum(l.createdTime)).toISOString() : null,
        })
      }
      if (!body?.hasMore || !body?.cursor) break
      cursor = String(body.cursor)
    }
  }

  return [...byId.values()].sort((a, b) => (b.createdTime || '').localeCompare(a.createdTime || ''))
}

// ─── Matching an Infloww link to one of our IG accounts ─────────────────────
//
// The team names links by hand, e.g. "IG sophiaawesst 11.10" or
// "FB jennasmomdiary 14.10" — platform, then the handle, then the date it was
// made. The convention holds often enough to pre-select the right link, and
// never well enough to trust silently, so a match is only ever a suggestion.

const PLATFORM_WORDS = new Set(['ig', 'instagram', 'fb', 'facebook', 'tt', 'tiktok', 'x', 'twitter', 'yt', 'youtube', 'reddit', 'snap'])

/** Strip the punctuation Instagram allows but link names rarely reproduce. */
function normalizeHandle(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '')
}

/** Candidate handles inside a link name, best-looking first. */
function handleTokens(linkName: string): string[] {
  return linkName
    .split(/[\s,/|]+/)
    .map(t => t.replace(/^@+/, '').trim())
    .filter(Boolean)
    .filter(t => !PLATFORM_WORDS.has(t.toLowerCase()))
    // Drop date-ish tokens: 11.10, 2025-10-11, 14/10.
    .filter(t => !/^\d{1,4}([.\-/]\d{1,4}){1,2}$/.test(t))
    .filter(t => !/^["']?(account\s*name|datum|date|name)["']?$/i.test(t))
    .filter(t => normalizeHandle(t).length >= 3)
}

/**
 * How close the two strings have to be in length before containment means
 * anything. Without it the creator's first name matches every one of her
 * accounts: "Sophia Tiktok" would claim to be @sophiaawesst.
 */
const CONTAINMENT_RATIO = 0.8

/**
 * 0–100 confidence that `linkName` refers to `username`.
 *
 * 100 the handle is spelled exactly as written
 *  90 same once dots and underscores are dropped
 *  75 a near-miss — one contains the other at nearly the same length
 *   0 unrelated
 *
 * The gap between 100 and 90 matters: Sophia runs both @sophiaawesst and
 * @sophiaa.wesst, which are different Instagram accounts that collapse to the
 * same string once punctuation goes. Exact spelling has to win, or the link for
 * one lands on the other.
 */
export function matchScore(linkName: string, username: string): number {
  const rawTarget = username.trim().toLowerCase().replace(/^@+/, '')
  const target = normalizeHandle(username)
  if (!target) return 0
  let best = 0
  for (const token of handleTokens(linkName)) {
    const raw = token.trim().toLowerCase()
    const t = normalizeHandle(token)
    if (!t) continue
    if (raw === rawTarget) return 100
    if (t === target) { best = Math.max(best, 90); continue }
    if (t.length < 5 || target.length < 5) continue
    if (!t.includes(target) && !target.includes(t)) continue
    const ratio = Math.min(t.length, target.length) / Math.max(t.length, target.length)
    if (ratio >= CONTAINMENT_RATIO) best = Math.max(best, 75)
  }
  return best
}

/** The account a link most likely belongs to, or null below `floor`. */
export function suggestAccountForLink<T extends { id: string; username: string }>(
  linkName: string,
  accounts: T[],
  floor = 75,
): { account: T; score: number } | null {
  let best: { account: T; score: number } | null = null
  for (const account of accounts) {
    const score = matchScore(linkName, account.username)
    if (score >= floor && (!best || score > best.score)) best = { account, score }
  }
  return best
}

/**
 * Our creator → Infloww creator id.
 *
 * infloww_creator_map wins when it is set; otherwise fall back to matching
 * of_handle against Infloww's userName, which covers creators nobody has
 * mapped yet.
 */
export async function resolveInflowwCreatorId(
  creatorId: string,
  cfg: InflowwConfig,
): Promise<string | null> {
  const supabase = createServerSupabaseClient()
  const { data: mapped } = await supabase
    .from('infloww_creator_map')
    .select('infloww_creator_id')
    .eq('creator_id', creatorId)
    .maybeSingle()
  if (mapped?.infloww_creator_id) return String(mapped.infloww_creator_id)

  const { data: creator } = await supabase
    .from('creators')
    .select('of_handle, slug, display_name')
    .eq('id', creatorId)
    .maybeSingle()
  if (!creator?.of_handle) return null

  const handle = normalizeHandle(creator.of_handle)
  const creators = await listInflowwCreators(cfg)
  const hit = creators.find(c => normalizeHandle(c.userName) === handle)
  return hit ? hit.id : null
}
