import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase'
import CreatorPage from '@/components/CreatorPage'
import type { Metadata } from 'next'

interface Props {
  params: { slug: string }
}

async function getCreator(slug: string) {
  const supabase = createServerSupabaseClient()
  const { data: creator } = await supabase
    .from('creators')
    .select('*, links(*)')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()
  return creator
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const creator = await getCreator(params.slug)
  if (!creator) return { title: 'Not Found' }
  return {
    title: creator.display_name,
    description: creator.bio || `${creator.display_name}'s links`,
    openGraph: {
      title: creator.display_name,
      description: creator.bio || '',
      images: creator.avatar_url ? [creator.avatar_url] : [],
    },
  }
}

export default async function CreatorSlugPage({ params }: Props) {
  const creator = await getCreator(params.slug)
  if (!creator) notFound()

  // Sort links by sort_order
  const links = (creator.links || [])
    .filter((l: any) => l.is_active)
    .sort((a: any, b: any) => a.sort_order - b.sort_order)

  return <CreatorPage creator={creator} links={links} />
}
