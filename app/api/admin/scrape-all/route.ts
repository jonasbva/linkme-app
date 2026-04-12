import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { getSessionUser } from '@/lib/auth'

const APIFY_TOKEN = process.env.APIFY_API_TOKEN

async function scrapeInstagram(username: string, retries = 2) {
  if (!APIFY_TOKEN) throw new Error('APIFY_API_TOKEN is not set')

  let lastError: Error | null = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(
        `https://api.apify.com/v2/acts/apify~instagram-profile-scraper/run-sync-get-dataset-items?token=${APIFY_TOKEN}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ usernames: [username], resultsLimit: 1 }), cache: 'no-store' }
      )
      if (!res.ok) {
        const body = await res.text().catch(() => '')
        throw new Error(`Apify ${res.status} for @${username}: ${body.slice(0, 200)}`)
      }
      const items = await res.json()
      const profile = items?.[0]
      if (!profile) throw new Error(`No data for @${username} — account may be private or username incorrect`)

      if (profile.followersCount === undefined && profile.postsCount === undefined) {
        throw new Error(`Empty profile for @${username} — account may be private or restricted`)
      }

      const posts: any[] = profile.latestPosts ?? []
      let totalViews = 0, totalLikes = 0, totalComments = 0
      for (const post of posts) {
        totalViews += post.videoViewCount ?? 0
        totalLikes += post.likesCount ?? 0
        totalComments += post.commentsCount ?? 0
      }

      return {
        followers: profile.followersCount ?? null,
        following: profile.followsCount ?? null,
        post_count: profile.postsCount ?? null,
        total_views: totalViews,
        total_likes: totalLikes,
        total_comments: totalComments,
        raw_data: profile,
      }
    } catch (err: any) {
      lastError = err
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, (attempt + 1) * 2000))
      }
    }
  }

  throw lastError ?? new Error(`Failed to scrape @${username} after ${retries + 1} attempts`)
}

export const maxDuration = 300 // 5 min for scraping all accounts

// POST /api/admin/scrape-all — streams SSE progress
export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      function send(data: any) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      const supabase = createServerSupabaseClient()
      const { data: accounts } = await supabase
        .from('social_accounts')
        .select('id, creator_id, platform, username')
        .eq('is_active', true)

      const igAccounts = (accounts || []).filter(a => a.platform === 'instagram')

      if (igAccounts.length === 0) {
        send({ type: 'done', total: 0, success: 0, errors: 0 })
        controller.close()
        return
      }

      send({ type: 'start', total: igAccounts.length })

      let success = 0, errors = 0

      for (let i = 0; i < igAccounts.length; i++) {
        const account = igAccounts[i]
        send({ type: 'progress', index: i + 1, total: igAccounts.length, username: account.username })

        try {
          const metrics = await scrapeInstagram(account.username)
          await supabase.from('social_snapshots').insert({
            social_account_id: account.id,
            followers: metrics.followers,
            following: metrics.following,
            post_count: metrics.post_count,
            total_views: metrics.total_views,
            total_likes: metrics.total_likes,
            total_comments: metrics.total_comments,
            raw_data: metrics.raw_data,
          })
          success++
          send({ type: 'scraped', index: i + 1, total: igAccounts.length, username: account.username, status: 'ok' })
        } catch (err: any) {
          errors++
          send({ type: 'scraped', index: i + 1, total: igAccounts.length, username: account.username, status: 'error', error: err.message })
        }
      }

      // Calculate conversion data for yesterday
      send({ type: 'calculating' })

      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const targetDate = yesterday.toISOString().split('T')[0]
      const dateStart = targetDate + 'T00:00:00.000Z'
      const dateEnd = targetDate + 'T23:59:59.999Z'

      const { data: creators } = await supabase.from('creators').select('id')
      const { data: clicks } = await supabase.from('clicks').select('creator_id, type').gte('created_at', dateStart).lte('created_at', dateEnd)

      const clickMap: Record<string, { profile_views: number; link_clicks: number }> = {}
      ;(clicks || []).forEach((c: any) => {
        if (!clickMap[c.creator_id]) clickMap[c.creator_id] = { profile_views: 0, link_clicks: 0 }
        if (c.type === 'page_view') clickMap[c.creator_id].profile_views++
        else if (c.type === 'link_click') clickMap[c.creator_id].link_clicks++
      })

      const prevDate = new Date(targetDate)
      prevDate.setDate(prevDate.getDate() - 1)
      const prevDateStr = prevDate.toISOString().split('T')[0]

      const viewsMap: Record<string, number> = {}
      for (const acc of igAccounts) {
        const [todaySnap, prevSnap] = await Promise.all([
          supabase.from('social_snapshots').select('total_views').eq('social_account_id', acc.id)
            .gte('scraped_at', dateStart).lte('scraped_at', dateEnd).order('scraped_at', { ascending: false }).limit(1),
          supabase.from('social_snapshots').select('total_views').eq('social_account_id', acc.id)
            .gte('scraped_at', prevDateStr + 'T00:00:00.000Z').lte('scraped_at', prevDateStr + 'T23:59:59.999Z')
            .order('scraped_at', { ascending: false }).limit(1),
        ])
        const diff = (todaySnap.data?.[0]?.total_views || 0) - (prevSnap.data?.[0]?.total_views || 0)
        if (diff > 0) viewsMap[acc.creator_id] = (viewsMap[acc.creator_id] || 0) + diff
      }

      let calculated = 0
      for (const creator of (creators || [])) {
        const { data: existing } = await supabase.from('conversion_daily').select('new_subs').eq('creator_id', creator.id).eq('date', targetDate).single()
        const { error } = await supabase.from('conversion_daily').upsert({
          creator_id: creator.id, date: targetDate,
          views: viewsMap[creator.id] || 0,
          profile_views: clickMap[creator.id]?.profile_views || 0,
          link_clicks: clickMap[creator.id]?.link_clicks || 0,
          new_subs: existing?.new_subs ?? 0,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'creator_id,date' })
        if (!error) calculated++
      }

      send({ type: 'done', total: igAccounts.length, success, errors, calculated, date: targetDate })
      controller.close()
    }
  })

  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' },
  })
}
