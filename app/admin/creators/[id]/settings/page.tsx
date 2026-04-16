import { createServerSupabaseClient } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import SettingsClient from '@/components/admin/SettingsClient'
import { getSessionUser } from '@/lib/auth'

interface Props {
  params: { id: string }
}

export default async function CreatorSettingsPage({ params }: Props) {
  const supabase = createServerSupabaseClient()
  const user = await getSessionUser()

  const [creatorRes, conversionAccountsRes, inflowwCacheRes, inflowwMapRes] = await Promise.all([
    supabase.from('creators').select('*').eq('id', params.id).single(),
    supabase
      .from('conversion_accounts')
      .select('id, handle, display_label, sheet_tab_name, is_active, created_at')
      .eq('creator_id', params.id)
      .order('display_label', { ascending: true, nullsFirst: true })
      .order('handle', { ascending: true }),
    supabase.from('infloww_creators_cache').select('infloww_id, name, user_name'),
    supabase
      .from('infloww_creator_map')
      .select('creator_id, infloww_creator_id, infloww_creator_name')
      .eq('creator_id', params.id),
  ])

  if (!creatorRes.data) notFound()
  const creator = creatorRes.data
  const conversionAccounts = conversionAccountsRes.data || []
  const inflowwCreators = inflowwCacheRes.data || []
  const currentMapping = (inflowwMapRes.data || [])[0] || null

  return (
    <SettingsClient
      creator={creator}
      conversionAccounts={conversionAccounts}
      inflowwCreators={inflowwCreators}
      currentMapping={currentMapping}
      isSuperAdmin={user?.is_super_admin || false}
    />
  )
}
