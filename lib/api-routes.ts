import { NextRequest, NextResponse } from 'next/server'
import { requireCreatorAccess, guardResponse } from './auth'
import { createServerSupabaseClient } from './supabase'
import { validDate } from './challenge/dates'
import { parseNewCreator } from './creator-input'

export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
type RouteModule = Record<string, unknown>
export interface ApiRoute {
  path: string
  methods: Partial<Record<ApiMethod, string>>
  description: string
  warning?: string
  superAdminMethods?: ApiMethod[]
  load: () => Promise<RouteModule>
}

const fullAdmin = 'Active super admin'
const input = 'input_conversions on the affected creator'

// Keep this list explicit. No arbitrary admin route, SQL, table, or module name
// supplied by a caller is ever dispatched.
export const API_ROUTES: ApiRoute[] = [
  { path: 'creators', methods: { GET: 'Creator visibility', POST: fullAdmin }, description: 'List visible creators or create a creator.', load: () => import('@/app/api/admin/creators/route') },
  { path: 'creators/:id', methods: { GET: 'Creator visibility', PUT: 'edit_settings', PATCH: 'edit_settings', DELETE: fullAdmin }, description: 'Read, edit, archive, or permanently delete a creator.', warning: 'DELETE permanently removes the creator and cascading history. Prefer PATCH is_active=false to archive.', load: async () => ({ ...await import('@/app/api/admin/creators/[id]/route'), GET: getCreator }) },
  { path: 'creators/:id/of-handle', methods: { PATCH: 'edit_settings' }, description: 'Set or clear the unique OnlyFans handle.', load: () => import('@/app/api/admin/creators/[id]/of-handle/route') },
  { path: 'creators/:id/tracking-links', methods: { GET: 'view_conversions', POST: input }, description: 'Read or create tracking links.', load: () => import('@/app/api/admin/creators/[id]/tracking-links/route') },
  { path: 'creators/:id/tracking-links/:linkId', methods: { PATCH: input, DELETE: input }, description: 'Edit, disconnect, or delete a tracking link.', warning: 'DELETE permanently removes the link and its daily history.', load: () => import('@/app/api/admin/creators/[id]/tracking-links/[linkId]/route') },
  { path: 'creators/:id/infloww-links', methods: { GET: 'view_conversions' }, description: 'Discover Infloww tracking links and account suggestions.', load: () => import('@/app/api/admin/creators/[id]/infloww-links/route') },
  { path: 'creators/:id/posts', methods: { GET: 'view_social' }, description: 'List social posts, with limit/offset pagination and optional social_account_id.', load: async () => ({ GET: getPosts }) },
  { path: 'creators/:id/posts/:postId', methods: { PATCH: 'edit_social' }, description: 'Set the social post Trial flag.', load: () => import('@/app/api/admin/creators/[id]/posts/[postId]/route') },
  { path: 'social-accounts', methods: { GET: 'Creator visibility; view_social for a specified creator', POST: 'edit_social', PATCH: fullAdmin, DELETE: fullAdmin }, description: 'Read, add, bulk edit, or delete social accounts.', warning: 'DELETE permanently removes accounts and cascading history. POST can partially succeed: inspect warning and account/link.', load: () => import('@/app/api/admin/social-accounts/route') },
  { path: 'social-snapshots', methods: { GET: 'view_social' }, description: 'Read social snapshots for creator_id and optional start/end dates.', load: () => import('@/app/api/admin/social-snapshots/route') },
  { path: 'conversions', methods: { GET: 'Creator visibility', POST: input }, description: 'Read daily subscriber/traffic rows and targets; write/correct/delete counts or set targets.', warning: 'update_creator_cell with value:null deletes that daily observation; zero is a recorded count.', load: () => import('@/app/api/admin/conversions/route') },
  { path: 'tags', methods: { GET: 'Active dashboard user', POST: 'Super admin for catalog; edit_settings for assignment' }, description: 'Read/create/edit/delete tags or assign/unassign creators.', warning: 'delete_tag removes its assignments too.', load: () => import('@/app/api/admin/tags/route') },
  { path: 'revenue/data', methods: { GET: fullAdmin }, superAdminMethods: ['GET'], description: 'Read revenue as JSON using days/date query parameters. Streaming is unavailable through this API.', load: () => import('@/app/api/admin/revenue/data/route') },
  { path: 'revenue/cache', methods: { GET: fullAdmin, POST: fullAdmin }, superAdminMethods: ['GET', 'POST'], description: 'Read cached revenue or rebuild it using from/to timestamps or key=today/YYYY-MM-DD.', warning: 'GET may refresh a stale cache. Refreshes call Infloww and can take several minutes.', load: () => import('@/app/api/admin/revenue/cache/route') },
  { path: 'revenue/emergency', methods: { GET: fullAdmin, POST: 'edit_settings on creator_id' }, superAdminMethods: ['GET'], description: 'Read or update revenue emergency status.', load: async () => ({ ...await import('@/app/api/admin/revenue/emergency/route'), POST: setEmergency }) },
  { path: 'revenue/mapping', methods: { GET: fullAdmin, POST: fullAdmin, DELETE: fullAdmin }, description: 'Read/set/remove creator-to-Infloww mappings.', warning: 'POST replaces any conflicting mapping for either supplied ID.', load: () => import('@/app/api/admin/revenue/mapping/route') },
  { path: 'revenue/infloww-creators', methods: { GET: fullAdmin }, description: 'Read available creators directly from Infloww.', load: () => import('@/app/api/admin/revenue/infloww-creators/route') },
  { path: 'revenue/infloww-creators-cached', methods: { GET: fullAdmin }, superAdminMethods: ['GET'], description: 'Read cached Infloww creator directory.', load: () => import('@/app/api/admin/revenue/infloww-creators-cached/route') },
  { path: 'infloww/sync-links', methods: { POST: 'input_conversions on creator_id; super admin when omitted' }, description: 'Discover/bind exact-match links and sync Infloww counters.', warning: 'Calls Infloww and writes link bindings/snapshots; may take several minutes.', load: () => import('@/app/api/admin/infloww/sync-links/route') },
  { path: 'scrape', methods: { GET: 'view_social', POST: 'edit_social' }, description: 'Read snapshot history or scrape a social account/creator.', warning: 'POST runs the configured paid scraping service.', load: () => import('@/app/api/admin/scrape/route') },
  { path: 'scrape-all', methods: { GET: fullAdmin, POST: fullAdmin }, superAdminMethods: ['GET'], description: 'Start/continue bulk scraping and read job progress.', warning: 'POST runs the configured paid scraping service for active accounts.', load: () => import('@/app/api/admin/scrape-all/route') },
  { path: 'upload', methods: { POST: fullAdmin }, superAdminMethods: ['POST'], description: 'Upload a PNG/JPEG/WebP/GIF image (maximum 10 MB) to creators or images storage.', load: () => import('@/app/api/admin/upload/route') },
  { path: 'challenge', methods: { GET: 'Active dashboard user; creator details retain existing visibility' }, description: 'Read challenge standings with optional asOf cutoff.', load: () => import('@/app/api/admin/challenge/route') },
]

// Discovery includes payload examples so a client handed only its URL and key
// can learn the write contracts without access to the source repository.
export const API_REQUEST_EXAMPLES: Record<string, unknown[]> = {
  creators: [{ method: 'GET', query: { include_archived: '1' } }, { method: 'POST', body: { display_name: 'Creator name', of_handle: '@handle', is_active: true }, note: 'Only display_name is required. Slug is derived. Omit/null of_handle when not available.' }],
  'creators/:id': [{ method: 'PATCH', body: { display_name: 'New name', slug: 'new-slug', username: 'handle', bio: 'Biography', avatar_url: 'https://example.com/avatar.png', is_active: true }, note: 'Any subset; PUT has the same partial-update behavior. Archive with is_active:false.' }, { method: 'DELETE', note: 'No body. Permanent cascading deletion.' }],
  'creators/:id/of-handle': [{ method: 'PATCH', body: { of_handle: 'handle' }, note: 'Use null to clear.' }],
  'creators/:id/tracking-links': [{ method: 'POST', body: { label: '@handle bio', url: 'https://onlyfans.com/handle', social_account_id: 'SOCIAL_ACCOUNT_UUID', infloww_link_id: 'INFLOWW_LINK_ID', infloww_link_name: 'IG handle', infloww_code: 'CODE' }, note: 'Only label is required; omit other fields when not available.' }],
  'creators/:id/tracking-links/:linkId': [{ method: 'PATCH', body: { label: 'New label', url: '', social_account_id: null, is_active: true, sort_order: 0, infloww_link_id: null }, note: 'Any subset. With an Infloww ID, optional infloww_link_name/infloww_code are supported. Empty URL clears; null account/ID detaches.' }, { method: 'DELETE', note: 'No body; permanent link/history deletion.' }],
  'creators/:id/infloww-links': [{ method: 'GET', query: { username: 'handle' }, note: 'username is optional and ranks suggestions; do not silently apply fuzzy matches.' }],
  'creators/:id/posts': [{ method: 'GET', query: { social_account_id: 'SOCIAL_ACCOUNT_UUID', limit: '50', offset: '0' }, note: 'All optional; limit 1–200, default50; offset0–100000.' }],
  'creators/:id/posts/:postId': [{ method: 'PATCH', body: { is_trial: true } }],
  'social-accounts': [{ method: 'GET', query: { creator_id: 'CREATOR_UUID' }, note: 'creator_id optional.' }, { method: 'POST', body: { creator_id: 'CREATOR_UUID', platform: 'instagram', username: 'handle', tracking_link: { label: '@handle bio', url: 'https://onlyfans.com/handle', infloww_link_id: 'INFLOWW_LINK_ID', infloww_link_name: 'IG handle', infloww_code: 'CODE' } }, note: 'tracking_link and its fields are optional. Platform instagram/tiktok. Inspect warning/account/link for partial success.' }, { method: 'PATCH', body: { updates: [{ id: 'SOCIAL_ACCOUNT_UUID', username: 'new.handle', platform: 'instagram', is_active: true }] }, note: '1–500 updates; only id required in each update; result success/errors counts can show partial success.' }, { method: 'DELETE', body: { ids: ['SOCIAL_ACCOUNT_UUID'] }, note: 'Or query id=UUID without a body. Permanent cascading deletion.' }],
  'social-snapshots': [{ method: 'GET', query: { creator_id: 'CREATOR_UUID', start: '2026-11-01', end: '2026-11-14' }, note: 'creator_id required; start/end optional YYYY-MM-DD.' }],
  conversions: [{ method: 'GET', query: { action: 'creator_daily', creator_id: 'CREATOR_UUID', from: '2026-11-01', to: '2026-11-14' }, note: 'action: expectations, creator_daily or link_daily. Daily queries optionally filter creator_id/from/to; link_daily also tracking_link_id.' }, { method: 'POST', body: { action: 'set_expectation', creator_id: 'CREATOR_UUID', daily_sub_target: 100 } }, { method: 'POST', body: { action: 'update_creator_cell', creator_id: 'CREATOR_UUID', date: '2026-11-14', value: 120 }, note: 'value:null deletes the observation. value:0 records zero.' }, { method: 'POST', body: { action: 'set_daily_subs', date: '2026-11-14', entries: [{ creator_id: 'CREATOR_UUID', new_subs: 120 }] } }, { method: 'POST', body: { action: 'update_link_cell', tracking_link_id: 'TRACKING_LINK_UUID', date: '2026-11-14', field: 'views', value: 1000 }, note: 'field:views, profile_views or link_clicks.' }, { method: 'POST', body: { action: 'set_link_daily', date: '2026-11-14', entries: [{ tracking_link_id: 'TRACKING_LINK_UUID', views: 1000, profile_views: 200, link_clicks: 50 }] }, note: 'All three counts required. Up to500 distinct IDs per batch. All counts/targets JSON integers0–2147483647; YYYY-MM-DD dates.' }],
  tags: [{ method: 'POST', body: { action: 'create_tag', name: 'Campaign', color: '#3b82f6' } }, { method: 'POST', body: { action: 'update_tag', tag_id: 'TAG_UUID', name: 'New name', color: '#3b82f6' }, note: 'name/color optional.' }, { method: 'POST', body: { action: 'delete_tag', tag_id: 'TAG_UUID' } }, { method: 'POST', body: { action: 'assign_tag', creator_id: 'CREATOR_UUID', tag_id: 'TAG_UUID' } }, { method: 'POST', body: { action: 'unassign_tag', creator_id: 'CREATOR_UUID', tag_id: 'TAG_UUID' } }],
  'revenue/data': [{ method: 'GET', query: { days: '7', date: '2026-11-14' }, note: 'Both optional. days1–366. JSON only; stream=true is rejected.' }],
  'revenue/cache': [{ method: 'GET', query: { key: 'today' }, note: 'Or key=YYYY-MM-DD, or from/to epoch milliseconds or ISO timestamps.' }, { method: 'POST', query: { from: '2026-11-01T00:00:00Z', to: '2026-11-14T23:59:59Z' }, note: 'No body required. Long-running refresh; uses the dashboard range resolver.' }],
  'revenue/emergency': [{ method: 'POST', body: { creator_id: 'CREATOR_UUID', emergency_since: '2026-11-14', notes: 'Reason and next action' }, note: 'Set emergency_since:null to clear; optional notes default empty.' }],
  'revenue/mapping': [{ method: 'POST', body: { creator_id: 'CREATOR_UUID', infloww_creator_id: 'INFLOWW_CREATOR_ID', infloww_creator_name: 'Creator name' }, note: 'Name optional. Replaces conflicting mappings.' }, { method: 'DELETE', query: { creator_id: 'CREATOR_UUID' } }],
  scrape: [{ method: 'POST', body: { social_account_id: 'SOCIAL_ACCOUNT_UUID' }, note: 'Or creator_id to scrape the creator’s active accounts. Calls paid service.' }, { method: 'GET', query: { social_account_id: 'SOCIAL_ACCOUNT_UUID', limit: '30' }, note: 'limit optional1–200.' }],
  'scrape-all': [{ method: 'POST', body: { jobId: 'NEW_CLIENT_GENERATED_UUID' } }, { method: 'GET', query: { jobId: 'SAME_UUID' } }],
  'infloww/sync-links': [{ method: 'POST', body: { creator_id: 'CREATOR_UUID' }, note: 'Optional. Omit to sync all creators (super admin). Can take several minutes.' }],
  upload: [{ method: 'POST', multipart: { file: 'PNG/JPEG/WebP/GIF image; maximum10MB', bucket: 'creators' }, note: 'bucket optional:creators(default) or images. Returns public url; assign avatar_url separately.' }],
  challenge: [{ method: 'GET', query: { asOf: '2026-11-14' }, note: 'Optional; must fall in configured challenge dates, no later than today.' }],
}

export function findApiRoute(segments: string[]) {
  for (const route of API_ROUTES) {
    const parts = route.path.split('/')
    if (parts.length !== segments.length) continue
    const params: Record<string, string> = {}
    if (parts.every((part, index) => {
      if (part.startsWith(':')) { params[part.slice(1)] = segments[index]; return true }
      return part === segments[index]
    })) return { route, params }
  }
  return null
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const count = (value: unknown) => typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 2147483647
const uuid = (value: unknown) => typeof value === 'string' && UUID.test(value)
const text = (value: unknown) => typeof value === 'string' && value.trim().length > 0
function allowedKeys(body: Record<string, unknown>, keys: string[]) { return Object.keys(body).every(key => keys.includes(key)) }
const creatorFields = ['display_name', 'slug', 'username', 'bio', 'avatar_url', 'is_active', 'of_handle']

/** API-only validation complements the reused dashboard handlers. */
export function validateApiRequest(path: string, method: string, params: Record<string, string>, query: URLSearchParams, body?: Record<string, any>): string | null {
  if (Object.values(params).some(value => !uuid(value))) return 'Path IDs must be UUIDs.'
  for (const key of ['creator_id', 'social_account_id', 'tracking_link_id', 'id', 'jobId']) {
    const value = query.get(key)
    if (value !== null && !uuid(value)) return `${key} must be a UUID.`
  }
  for (const key of ['date', 'start', 'end', 'asOf']) {
    const value = query.get(key)
    if (value !== null && !validDate(value)) return `${key} must be a valid YYYY-MM-DD date.`
  }
  if (path === 'conversions') {
    for (const key of ['from', 'to']) if (query.has(key) && !validDate(query.get(key)!)) return `${key} must be a valid YYYY-MM-DD date.`
  }
  if (path === 'revenue/data' && query.get('stream') === 'true') return 'Streaming is unavailable through the API; request the normal JSON response.'
  for (const key of ['limit', 'offset', 'days']) {
    const value = query.get(key)
    if (value !== null && (!/^\d+$/.test(value) || Number(value) > (key === 'offset' ? 100000 : key === 'days' ? 366 : 200) || (key !== 'offset' && Number(value) < 1))) return `${key} is outside the supported range.`
  }
  if (!body) return null
  for (const key of ['creator_id', 'social_account_id', 'tracking_link_id', 'tag_id', 'jobId']) {
    if (key in body && body[key] !== null && !uuid(body[key])) return `${key} must be a UUID.`
  }
  if (path === 'creators' || path === 'creators/:id') {
    if (method === 'POST') {
      if (!allowedKeys(body, ['display_name', 'of_handle', 'is_active'])) return 'Create fields: display_name, of_handle, is_active.'
      const parsed = parseNewCreator(body)
      return parsed.ok ? null : parsed.error
    }
    if (!allowedKeys(body, creatorFields)) return `Editable creator fields: ${creatorFields.join(', ')}.`
    if (Object.keys(body).length === 0) return 'At least one editable field is required.'
    for (const key of creatorFields.filter(key => !['is_active'].includes(key))) if (key in body && body[key] !== null && typeof body[key] !== 'string') return `${key} must be a string or null.`
    if ('is_active' in body && typeof body.is_active !== 'boolean') return 'is_active must be boolean.'
    if ('slug' in body && (typeof body.slug !== 'string' || !/^[a-z0-9][a-z0-9_-]{0,99}$/.test(body.slug))) return 'slug must use lowercase letters, numbers, underscores or hyphens.'
    if ('display_name' in body && !text(body.display_name)) return 'display_name cannot be empty.'
    // The dedicated handle route performs normalization and uniqueness checks.
    if ('of_handle' in body) return 'Use PATCH creators/:id/of-handle to change the OnlyFans handle.'
  }
  if (path === 'creators/:id/of-handle' && (!allowedKeys(body, ['of_handle']) || !('of_handle' in body) || (body.of_handle !== null && typeof body.of_handle !== 'string'))) return 'Supply of_handle as a string or null.'
  if (path === 'creators/:id/posts/:postId' && (!allowedKeys(body, ['is_trial']) || typeof body.is_trial !== 'boolean')) return 'Supply is_trial as boolean.'
  if (path === 'conversions') {
    const action = body.action
    if (!['set_expectation', 'set_daily_subs', 'update_creator_cell', 'update_link_cell', 'set_link_daily'].includes(action)) return 'Unknown conversion action.'
    if (action === 'set_expectation' && (!uuid(body.creator_id) || !count(body.daily_sub_target))) return 'creator_id and a non-negative whole daily_sub_target are required.'
    if (action !== 'set_expectation' && !validDate(body.date)) return 'date must be a valid YYYY-MM-DD date.'
    if (action === 'update_creator_cell' && (!uuid(body.creator_id) || (body.value !== null && !count(body.value)))) return 'creator_id and non-negative whole value (or null to delete) are required.'
    if (action === 'update_link_cell' && (!uuid(body.tracking_link_id) || !['views', 'profile_views', 'link_clicks'].includes(body.field) || !count(body.value))) return 'tracking_link_id, traffic field, and non-negative whole value are required.'
    if (action === 'set_daily_subs' || action === 'set_link_daily') {
      const key = action === 'set_daily_subs' ? 'creator_id' : 'tracking_link_id'
      if (!Array.isArray(body.entries) || body.entries.length > 500 || body.entries.some((e: any) => !e || !uuid(e[key]) || (action === 'set_daily_subs' ? !count(e.new_subs) : ['views', 'profile_views', 'link_clicks'].some(field => !count(e[field]))))) return 'entries must contain up to 500 valid IDs and non-negative whole counts.'
      if (new Set(body.entries.map((e: any) => e[key])).size !== body.entries.length) return 'Duplicate entries are not allowed.'
    }
  }
  if (path === 'social-accounts') {
    if (method === 'POST' && (!uuid(body.creator_id) || !['instagram', 'tiktok'].includes(body.platform) || !text(body.username))) return 'creator_id, platform (instagram/tiktok), and username are required.'
    if (method === 'POST') {
      if (!allowedKeys(body, ['creator_id', 'platform', 'username', 'tracking_link'])) return 'Unexpected social account fields.'
      if (body.tracking_link !== undefined && body.tracking_link !== null) {
        const link = body.tracking_link
        if (typeof link !== 'object' || Array.isArray(link) || !allowedKeys(link, ['label', 'url', 'infloww_link_id', 'infloww_link_name', 'infloww_code'])) return 'tracking_link must be an object with the documented fields.'
        for (const key of ['label', 'url', 'infloww_link_id', 'infloww_link_name', 'infloww_code']) if (key in link && link[key] !== null && typeof link[key] !== 'string') return `tracking_link.${key} must be a string or null.`
      }
    }
    if (method === 'PATCH' && (!Array.isArray(body.updates) || body.updates.length < 1 || body.updates.length > 500 || body.updates.some((u: any) => !u || !uuid(u.id) || !allowedKeys(u, ['id', 'username', 'platform', 'is_active']) || ('username' in u && !text(u.username)) || ('platform' in u && !['instagram', 'tiktok'].includes(u.platform)) || ('is_active' in u && typeof u.is_active !== 'boolean')))) return 'updates must contain 1–500 valid account updates.'
    if (method === 'DELETE' && !query.has('id') && (!Array.isArray(body.ids) || body.ids.length < 1 || body.ids.length > 500 || body.ids.some((id: unknown) => !uuid(id)))) return 'Supply an id query parameter or 1–500 UUIDs in ids.'
  }
  if (path.includes('tracking-links')) {
    if (!allowedKeys(body, ['label', 'url', 'social_account_id', 'is_active', 'sort_order', 'infloww_link_id', 'infloww_link_name', 'infloww_code'])) return 'Unexpected tracking link fields.'
    for (const key of ['infloww_link_id', 'infloww_link_name', 'infloww_code']) if (key in body && body[key] !== null && typeof body[key] !== 'string') return `${key} must be a string or null.`
    if ('label' in body && !text(body.label)) return 'label must be a non-empty string.'
    if (method === 'POST' && !text(body.label)) return 'label is required.'
    if ('sort_order' in body && !count(body.sort_order)) return 'sort_order must be a non-negative integer.'
    if ('is_active' in body && typeof body.is_active !== 'boolean') return 'is_active must be boolean.'
    if ('url' in body && typeof body.url !== 'string') return 'url must be a string (empty to clear).'
  }
  if (path === 'revenue/emergency' && (!uuid(body.creator_id) || (body.emergency_since !== null && body.emergency_since !== undefined && !validDate(body.emergency_since)) || ('notes' in body && typeof body.notes !== 'string'))) return 'Supply creator_id, optional emergency_since (YYYY-MM-DD or null), and optional notes string.'
  if (path === 'revenue/mapping' && (!uuid(body.creator_id) || !/^[a-zA-Z0-9_-]+$/.test(String(body.infloww_creator_id || '')) || ('infloww_creator_name' in body && typeof body.infloww_creator_name !== 'string'))) return 'creator_id and a valid infloww_creator_id are required.'
  if (path === 'tags') {
    if (!['create_tag', 'update_tag', 'delete_tag', 'assign_tag', 'unassign_tag'].includes(body.action)) return 'Unknown tag action.'
    if (['create_tag', 'update_tag'].includes(body.action) && ('name' in body ? !text(body.name) : body.action === 'create_tag')) return 'name must be a non-empty string.'
    if (body.action !== 'create_tag' && !uuid(body.tag_id)) return 'tag_id must be a UUID.'
    if (['assign_tag', 'unassign_tag'].includes(body.action) && !uuid(body.creator_id)) return 'creator_id must be a UUID.'
    if ('color' in body && (typeof body.color !== 'string' || !/^#[0-9a-f]{6}$/i.test(body.color))) return 'color must be a six-digit hex color.'
  }
  if (path === 'scrape' && !uuid(body.creator_id) && !uuid(body.social_account_id)) return 'creator_id or social_account_id is required.'
  return null
}

export async function validateRelatedRows(path: string, body: Record<string, any> | undefined): Promise<Response | null> {
  // The older batch handler silently skips unknown links; the public API must
  // reject the entire request instead of reporting a partial save as success.
  if (path !== 'conversions' || body?.action !== 'set_link_daily' || !body.entries.length) return null
  const ids = body.entries.map((entry: any) => entry.tracking_link_id)
  const { data, error } = await createServerSupabaseClient().from('tracking_links').select('id').in('id', ids)
  if (error) throw new Error('Link validation failed')
  if ((data || []).length !== ids.length) return NextResponse.json({ error: 'One or more tracking links do not exist.' }, { status: 404 })
  return null
}

async function getCreator(_request: NextRequest, { params }: { params: Record<string, string> }) {
  const gate = await requireCreatorAccess(params.id)
  if (!gate.ok) return guardResponse(gate)
  const { data, error } = await createServerSupabaseClient().from('creators').select('id, display_name, slug, username, bio, avatar_url, of_handle, is_active, created_at, creator_tags(tag_id, tags(id, name, color))').eq('id', params.id).maybeSingle()
  if (error) throw new Error('Creator lookup failed')
  return data ? NextResponse.json(data) : NextResponse.json({ error: 'Creator not found' }, { status: 404 })
}

async function getPosts(request: NextRequest, { params }: { params: Record<string, string> }) {
  const gate = await requireCreatorAccess(params.id, 'view_social')
  if (!gate.ok) return guardResponse(gate)
  const supabase = createServerSupabaseClient()
  let accounts = supabase.from('social_accounts').select('id').eq('creator_id', params.id)
  const accountId = request.nextUrl.searchParams.get('social_account_id')
  if (accountId) accounts = accounts.eq('id', accountId)
  const { data, error } = await accounts
  if (error) throw new Error('Account lookup failed')
  if (!data?.length) return NextResponse.json([])
  const limit = Number(request.nextUrl.searchParams.get('limit') || 50)
  const offset = Number(request.nextUrl.searchParams.get('offset') || 0)
  const posts = await supabase.from('social_posts').select('*').in('social_account_id', data.map(row => row.id)).order('post_timestamp', { ascending: false }).order('id').range(offset, offset + limit - 1)
  if (posts.error) throw new Error('Post lookup failed')
  return NextResponse.json(posts.data || [])
}

async function setEmergency(request: NextRequest) {
  const body = await request.clone().json()
  const gate = await requireCreatorAccess(body.creator_id, 'edit_settings')
  if (!gate.ok) return guardResponse(gate)
  return (await import('@/app/api/admin/revenue/emergency/route')).POST(request)
}
