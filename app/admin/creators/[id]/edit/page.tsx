import { createServerSupabaseClient } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import CreatorEditor from '@/components/admin/CreatorEditor'

interface Props {
  params: { id: string }
}

export default async function EditCreatorEditPage({ params }: Props) {
  const isNew = params.id === 'new'
  let creator = null
  let links: any[] = []

  if (!isNew) {
    const supabase = createServerSupabaseClient()
    const [creatorRes, linksRes] = await Promise.all([
      supabase.from('creators').select('*').eq('id', params.id).single(),
      supabase.from('links').select('*').eq('creator_id', params.id).order('sort_order'),
    ])

    if (!creatorRes.data) notFound()
    creator = creatorRes.data
    links = linksRes.data || []
  }

  return (
    <CreatorEditor
      creator={creator}
      links={links}
      analytics={null}
      rawClicks={[]}
      isNew={isNew}
      mode="edit"
    />
  )
}
