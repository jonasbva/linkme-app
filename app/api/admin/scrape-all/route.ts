import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { getSessionUser } from '@/lib/auth'
import { scrapeAndSaveAll } from '@/lib/scraper'

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

      let success = 0
      let errors = 0

      // Use batched scraping with progress callback
      const results = await scrapeAndSaveAll(
        accounts || [],
        (done, total, username, status, error) => {
          if (status === 'ok') success++
          else errors++
          send({
            type: 'scraped',
            index: done,
            total,
            username,
            status,
            ...(error ? { error } : {}),
          })
        },
      )

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
            .eq('scrape_date', targetDate).order('scraped_at', { ascending: false }).limit(1),
          supabase.from('social_snapshots').select('total_views').eq('social_account_id', acc.id)
            .eq('scrape_date', prevDateStr).order('scraped_at', { ascending: false }).limit(1),
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
