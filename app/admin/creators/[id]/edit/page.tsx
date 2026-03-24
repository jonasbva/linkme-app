import { createServerSupabaseClient } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import CreatorEditor from '@/components/admin/CreatorEditor'
import TagManager from '@/components/admin/TagManager'

interface Props {
  params: { id: string }
}

export default async function EditCreatorEditPage({ params }: Props) {
  const isNew = params.id === 'new'
  let creator = null
  let links: any[] = []
  let allTags: any[] = []
  let assignedTagIds: string[] = []

  const supabase = createServerSupabaseClient()

  if (!isNew) {
    const [creatorRes, linksRes, tagsRes, creatorTagsRes] = await Promise.all([
      supabase.from('creators').select('*').eq('id', params.id).single(),
      supabase.from('links').select('*').eq('creator_id', params.id).order('sort_order'),
      supabase.from('tags').select('*').order('name'),
      supabase.from('creator_tags').select('tag_id').eq('creator_id', params.id),
    ])

    if (!creatorRes.data) notFound()
    creator = creatorRes.data
    links = linksRes.data || []
    allTags = tagsRes.data || []
    assignedTagIds = (creatorTagsRes.data || []).map((ct: any) => ct.tag_id)
  }

  return (
    <>
      <CreatorEditor
        creator={creator}
        links={links}
        analytics={null}
        rawClicks={[]}
        isNew={isNew}
        mode="edit"
      />
      {!isNew && creator && (
        <div className="mt-6">
          <TagManager
            creatorId={creator.id}
            allTags={allTags}
            assignedTagIds={assignedTagIds}
          />
        </div>
      )}
    </>
  )
}
