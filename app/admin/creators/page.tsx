import { createServerSupabaseClient } from '@/lib/supabase'
import CreatorsListClient from '@/components/admin/CreatorsListClient'

export default async function CreatorsPage() {
  const supabase = createServerSupabaseClient()
  const [creatorsRes, tagsRes, creatorTagsRes] = await Promise.all([
    supabase.from('creators').select('*').order('created_at', { ascending: false }),
    supabase.from('tags').select('*').order('name'),
    supabase.from('creator_tags').select('creator_id, tag_id'),
  ])

  const creators = (creatorsRes.data || []).map((c: any) => ({
    ...c,
    tagIds: (creatorTagsRes.data || [])
      .filter((ct: any) => ct.creator_id === c.id)
      .map((ct: any) => ct.tag_id),
  }))

  return (
    <CreatorsListClient
      creators={creators}
      tags={tagsRes.data || []}
    />
  )
}
