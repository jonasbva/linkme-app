import { createServerSupabaseClient } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import TrackingLinksClient from '@/components/admin/TrackingLinksClient'
import { canViewCreator } from '@/lib/auth'

interface Props {
  params: { id: string }
}

export default async function CreatorLinksPage({ params }: Props) {
  if (!(await canViewCreator(params.id))) notFound()

  const supabase = createServerSupabaseClient()
  const [creatorRes, linksRes, accountsRes] = await Promise.all([
    supabase.from('creators').select('id, display_name, slug, of_handle').eq('id', params.id).single(),
    supabase
      .from('tracking_links')
      .select('*')
      .eq('creator_id', params.id)
      .order('sort_order')
      .order('label'),
    supabase
      .from('social_accounts')
      .select('id, platform, username, is_active')
      .eq('creator_id', params.id)
      .order('username'),
  ])

  if (!creatorRes.data) notFound()

  return (
    <TrackingLinksClient
      creator={creatorRes.data}
      links={linksRes.data || []}
      socialAccounts={accountsRes.data || []}
    />
  )
}
