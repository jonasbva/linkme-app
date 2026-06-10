import { Suspense } from 'react'
import { createServerSupabaseClient } from '@/lib/supabase'
import ConversionsClient from '@/components/admin/ConversionsClient'
import { getSessionUser, getUserPermissions } from '@/lib/auth'

type SupabaseClient = ReturnType<typeof createServerSupabaseClient>

// Fetch ALL conversion_daily rows. A plain select is silently capped at 1000
// rows by Supabase, which would truncate "All Time"; paginate to be correct.
async function fetchAllDaily(supabase: SupabaseClient, visibleIds: string[] | null): Promise<any[]> {
  const PAGE = 1000
  const rows: any[] = []
  for (let from = 0; ; from += PAGE) {
    let q = supabase
      .from('conversion_daily')
      .select('id, creator_id, conversion_account_id, date, views, profile_views, link_clicks, new_subs')
      .order('date', { ascending: false })
      .range(from, from + PAGE - 1)
    if (visibleIds) q = q.in('creator_id', visibleIds)
    const { data, error } = await q
    if (error || !data || data.length === 0) break
    rows.push(...data)
    if (data.length < PAGE) break
  }
  return rows
}

export default async function ConversionsPage() {
  const supabase = createServerSupabaseClient()

  // Scope to creators the user may see (super-admins / grant-all see everything).
  const user = await getSessionUser()
  let visibleIds: string[] | null = null
  if (user && !user.is_super_admin) {
    const perms = await getUserPermissions(user.id)
    if (!perms.grantAllCreators) visibleIds = perms.visibleCreatorIds
  }

  const creatorsQuery = supabase
    .from('creators')
    .select('id, slug, display_name, avatar_url, is_active, of_handle')
    .order('display_name')
  const accountsQuery = supabase
    .from('conversion_accounts')
    .select('id, creator_id, handle, display_label, sheet_tab_name, is_active')
    .order('display_label', { ascending: true, nullsFirst: true })
    .order('handle', { ascending: true })
  const expectationsQuery = supabase
    .from('conversion_expectations')
    .select('id, creator_id, conversion_account_id, daily_sub_target')

  const [creatorsRes, conversionAccountsRes, expectationsRes, dailyRows] = await Promise.all([
    visibleIds ? creatorsQuery.in('id', visibleIds) : creatorsQuery,
    visibleIds ? accountsQuery.in('creator_id', visibleIds) : accountsQuery,
    visibleIds ? expectationsQuery.in('creator_id', visibleIds) : expectationsQuery,
    fetchAllDaily(supabase, visibleIds),
  ])

  return (
    <Suspense fallback={<div className="text-white/20 text-[13px] py-12 text-center">Loading...</div>}>
      <ConversionsClient
        creators={creatorsRes.data || []}
        conversionAccounts={conversionAccountsRes.data || []}
        expectations={expectationsRes.data || []}
        dailyData={dailyRows}
      />
    </Suspense>
  )
}
