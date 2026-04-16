import { Suspense } from 'react'
import { createServerSupabaseClient } from '@/lib/supabase'
import ConversionsClient from '@/components/admin/ConversionsClient'

export default async function ConversionsPage() {
  const supabase = createServerSupabaseClient()

  const [creatorsRes, conversionAccountsRes, expectationsRes, dailyRes] = await Promise.all([
    supabase
      .from('creators')
      .select('id, slug, display_name, avatar_url, is_active, of_handle')
      .order('display_name'),
    supabase
      .from('conversion_accounts')
      .select('id, creator_id, handle, display_label, sheet_tab_name, is_active')
      .order('display_label', { ascending: true, nullsFirst: true })
      .order('handle', { ascending: true }),
    supabase
      .from('conversion_expectations')
      .select('id, creator_id, conversion_account_id, daily_sub_target'),
    // Fetch ALL daily rows (no 90-day cap) so "All Time" works.
    supabase
      .from('conversion_daily')
      .select('id, creator_id, conversion_account_id, date, views, profile_views, link_clicks, new_subs')
      .order('date', { ascending: false }),
  ])

  return (
    <Suspense fallback={<div className="text-white/20 text-[13px] py-12 text-center">Loading...</div>}>
      <ConversionsClient
        creators={creatorsRes.data || []}
        conversionAccounts={conversionAccountsRes.data || []}
        expectations={expectationsRes.data || []}
        dailyData={dailyRes.data || []}
      />
    </Suspense>
  )
}
