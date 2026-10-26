import { Suspense } from 'react'
import { createServerSupabaseClient } from '@/lib/supabase'
import ConversionsClient from '@/components/admin/ConversionsClient'
import { getSessionUser, getUserPermissions } from '@/lib/auth'
import { PageLoader } from '@/components/admin/ui'

type SupabaseClient = ReturnType<typeof createServerSupabaseClient>

/**
 * How much history to ship with the first render.
 *
 * The table holds a year per creator — paging all of it took eight sequential
 * round trips and sent thousands of rows the page never shows. The tabs only
 * ever look at one day or the last 30, so load a window that covers the date
 * picker's presets; anything older is fetched on demand by the client.
 */
const INITIAL_WINDOW_DAYS = 120

function windowStart(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().split('T')[0]
}

async function fetchSince(
  supabase: SupabaseClient,
  table: 'creator_daily' | 'link_daily',
  columns: string,
  since: string,
  scope: { column: string; ids: string[] } | null,
): Promise<any[]> {
  if (scope && scope.ids.length === 0) return []
  let q = supabase
    .from(table)
    .select(columns)
    .gte('date', since)
    .order('date', { ascending: false })
  if (scope) q = q.in(scope.column, scope.ids)
  const { data, error } = await q
  if (error) return []
  return data || []
}

export default async function ConversionsPage() {
  const supabase = createServerSupabaseClient()

  // Scope to the creators this user may see (super-admins / grant-all see all).
  const user = await getSessionUser()
  let visibleIds: string[] | null = null
  if (user && !user.is_super_admin) {
    const perms = await getUserPermissions(user.id)
    if (!perms.grantAllCreators) visibleIds = perms.visibleCreatorIds
  }

  const creatorsQuery = supabase
    .from('creators')
    .select('id, slug, display_name, avatar_url, is_active, of_handle')
    .eq('is_active', true)
    .order('display_name')
  const linksQuery = supabase
    .from('tracking_links')
    .select('id, creator_id, social_account_id, label, url, sort_order, is_active')
    .eq('is_active', true)
    .order('sort_order')
  const expectationsQuery = supabase
    .from('creator_expectations')
    .select('id, creator_id, daily_sub_target')

  const [creatorsRes, linksRes, expectationsRes] = await Promise.all([
    visibleIds ? creatorsQuery.in('id', visibleIds) : creatorsQuery,
    visibleIds ? linksQuery.in('creator_id', visibleIds) : linksQuery,
    visibleIds ? expectationsQuery.in('creator_id', visibleIds) : expectationsQuery,
  ])

  const links = linksRes.data || []
  const since = windowStart(INITIAL_WINDOW_DAYS)

  const [creatorDaily, linkDaily] = await Promise.all([
    fetchSince(supabase, 'creator_daily', 'id, creator_id, date, new_subs', since,
      visibleIds ? { column: 'creator_id', ids: visibleIds } : null),
    fetchSince(supabase, 'link_daily', 'id, tracking_link_id, date, views, profile_views, link_clicks', since,
      { column: 'tracking_link_id', ids: links.map(l => l.id) }),
  ])

  return (
    <Suspense fallback={<PageLoader label="Loading conversions…" />}>
      <ConversionsClient
        creators={creatorsRes.data || []}
        trackingLinks={links}
        expectations={expectationsRes.data || []}
        creatorDaily={creatorDaily}
        linkDaily={linkDaily}
        loadedSince={since}
      />
    </Suspense>
  )
}
