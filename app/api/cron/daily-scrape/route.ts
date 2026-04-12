import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { scrapeAndSaveAll } from '@/lib/scraper'

// GET /api/cron/daily-scrape
// Protected by CRON_SECRET — called by Vercel Cron daily at 6 AM UTC
// 1. Scrapes all active IG accounts in batches (fast)
// 2. Calculates conversion data for yesterday
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServerSupabaseClient()

  // 1. Get all active social accounts
  const { data: accounts } = await supabase
    .from('social_accounts')
    .select('id, creator_id, platform, username')
    .eq('is_active', true)

  if (!accounts || accounts.length === 0) {
    return NextResponse.json({ message: 'No active social accounts', results: [] })
  }

  // 2. Scrape all accounts in batches (15 per Apify call)
  const results = await scrapeAndSaveAll(accounts)
  const scrapeErrors = results.filter(r => r.status === 'error').length

  // 3. Calculate conversion data for yesterday
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const targetDate = yesterday.toISOString().split('T')[0]
  const dateStart = targetDate + 'T00:00:00.000Z'
  const dateEnd = targetDate + 'T23:59:59.999Z'

  const { data: creators } = await supabase.from('creators').select('id')
  const { data: clicks } = await supabase
    .from('clicks')
    .select('creator_id, type')
    .gte('created_at', dateStart)
    .lte('created_at', dateEnd)

  const clickMap: Record<string, { profile_views: number; link_clicks: number }> = {}
  ;(clicks || []).forEach((c: any) => {
    if (!clickMap[c.creator_id]) clickMap[c.creator_id] = { profile_views: 0, link_clicks: 0 }
    if (c.type === 'page_view') clickMap[c.creator_id].profile_views++
    else if (c.type === 'link_click') clickMap[c.creator_id].link_clicks++
  })

  // Sum social views across ALL accounts per creator (today vs previous day)
  const prevDate = new Date(targetDate)
  prevDate.setDate(prevDate.getDate() - 1)
  const prevDateStr = prevDate.toISOString().split('T')[0]

  const igAccounts = accounts.filter(a => a.platform === 'instagram')
  const viewsMap: Record<string, number> = {}
  for (const acc of igAccounts) {
    const [todaySnap, prevSnap] = await Promise.all([
      supabase
        .from('social_snapshots')
        .select('total_views')
        .eq('social_account_id', acc.id)
        .eq('scrape_date', targetDate)
        .order('scraped_at', { ascending: false })
        .limit(1),
      supabase
        .from('social_snapshots')
        .select('total_views')
        .eq('social_account_id', acc.id)
        .eq('scrape_date', prevDateStr)
        .order('scraped_at', { ascending: false })
        .limit(1),
    ])
    const todayViews = todaySnap.data?.[0]?.total_views || 0
    const prevViews = prevSnap.data?.[0]?.total_views || 0
    const diff = todayViews - prevViews
    if (diff > 0) {
      viewsMap[acc.creator_id] = (viewsMap[acc.creator_id] || 0) + diff
    }
  }

  // Upsert conversion_daily rows
  let calculated = 0
  for (const creator of (creators || [])) {
    const { data: existing } = await supabase
      .from('conversion_daily')
      .select('new_subs')
      .eq('creator_id', creator.id)
      .eq('date', targetDate)
      .single()

    const { error } = await supabase
      .from('conversion_daily')
      .upsert({
        creator_id: creator.id,
        date: targetDate,
        views: viewsMap[creator.id] || 0,
        profile_views: clickMap[creator.id]?.profile_views || 0,
        link_clicks: clickMap[creator.id]?.link_clicks || 0,
        new_subs: existing?.new_subs ?? 0,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'creator_id,date' })

    if (!error) calculated++
  }

  return NextResponse.json({
    scraped: results.length,
    scrapeErrors,
    calculated,
    date: targetDate,
    results: results.map(r => ({ username: r.username, status: r.status, error: r.error })),
  })
}
