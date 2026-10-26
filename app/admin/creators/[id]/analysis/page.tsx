import { createServerSupabaseClient } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import SocialClient from '@/components/admin/SocialClient'
import { canViewCreator } from '@/lib/auth'

interface Props {
  params: { id: string }
}

const WINDOW_DAYS = 30

export default async function CreatorAnalysisPage({ params }: Props) {
  if (!(await canViewCreator(params.id))) notFound()

  const supabase = createServerSupabaseClient()
  const since = new Date()
  since.setDate(since.getDate() - WINDOW_DAYS)
  const sinceIso = since.toISOString()

  const [creatorRes, accountsRes] = await Promise.all([
    supabase.from('creators').select('id, display_name, slug, avatar_url, of_handle').eq('id', params.id).single(),
    supabase
      .from('social_accounts')
      .select('id, platform, username, is_active')
      .eq('creator_id', params.id)
      .order('username'),
  ])

  if (!creatorRes.data) notFound()
  const accounts = accountsRes.data || []
  const accountIds = accounts.map(a => a.id)

  // Posts in the window, plus the latest snapshot per account for followers.
  const [postsRes, snapshotsRes] = await Promise.all([
    // post_timestamp was NULL on every row until the scraper's timestamp parsing
    // was fixed, so fall back to first_seen_at for anything still missing it.
    accountIds.length
      ? supabase
          .from('social_posts')
          .select('id, social_account_id, post_short_code, post_type, caption, display_url, post_timestamp, video_view_count, likes_count, comments_count, first_seen_at, is_trial')
          .in('social_account_id', accountIds)
          .or(`post_timestamp.gte.${sinceIso},and(post_timestamp.is.null,first_seen_at.gte.${sinceIso})`)
          .order('post_timestamp', { ascending: false, nullsFirst: false })
      : Promise.resolve({ data: [] as any[] }),
    accountIds.length
      ? supabase
          .from('social_snapshots')
          .select('social_account_id, scraped_at, followers, post_count, total_views, total_likes')
          .in('social_account_id', accountIds)
          .gte('scraped_at', sinceIso)
          .order('scraped_at', { ascending: false })
      : Promise.resolve({ data: [] as any[] }),
  ])

  return (
    <SocialClient
      creator={creatorRes.data}
      accounts={accounts}
      posts={postsRes.data || []}
      snapshots={snapshotsRes.data || []}
      windowDays={WINDOW_DAYS}
    />
  )
}
