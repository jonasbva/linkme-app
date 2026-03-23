import { createServerSupabaseClient } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import LinksManager from '@/components/admin/LinksManager'

interface Props {
  params: { id: string }
}

export default async function CreatorLinksPage({ params }: Props) {
  const supabase = createServerSupabaseClient()
  const [creatorRes, linksRes] = await Promise.all([
    supabase.from('creators').select('*').eq('id', params.id).single(),
    supabase.from('links').select('*').eq('creator_id', params.id).order('sort_order'),
  ])

  if (!creatorRes.data) notFound()

  return (
    <LinksManager
      creator={creatorRes.data}
      initialLinks={linksRes.data || []}
    />
  )
}
