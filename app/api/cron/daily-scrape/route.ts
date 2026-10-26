import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { scrapeAndSaveAll } from '@/lib/scraper'
import { verifyCronSecret } from '@/lib/auth'

// Scraping is slow (a synchronous Apify run per batch), so give the function
// the longest window Vercel allows. Without this it inherited the default few
// seconds and was killed after one or two accounts — which is why the roster
// was never fully scraped even on the days the cron did fire.
export const maxDuration = 300

/** Stop starting new batches once this much of the window is gone. */
const TIME_BUDGET_MS = 240_000

/** Accounts per run; whatever is left over is picked up by the next run. */
const MAX_ACCOUNTS_PER_RUN = 45

// GET /api/cron/daily-scrape — protected by CRON_SECRET.
//
// Scrapes the STALEST accounts first and stops before the clock runs out, so a
// roster bigger than one invocation can handle still gets covered: each run
// takes whatever has gone longest without a snapshot.
export async function GET(req: NextRequest) {
  if (!verifyCronSecret(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const startedAt = Date.now()
  const supabase = createServerSupabaseClient()

  const { data: accounts } = await supabase
    .from('social_accounts')
    .select('id, creator_id, platform, username')
    .eq('is_active', true)
    .eq('platform', 'instagram')

  if (!accounts || accounts.length === 0) {
    return NextResponse.json({ message: 'No active social accounts', results: [] })
  }

  // Order by staleness: accounts with no snapshot at all first, then the ones
  // scraped longest ago.
  const { data: lastSeen } = await supabase
    .from('social_snapshots')
    .select('social_account_id, scraped_at')
    .in('social_account_id', accounts.map(a => a.id))
    .order('scraped_at', { ascending: false })

  const newestByAccount = new Map<string, string>()
  for (const row of lastSeen || []) {
    if (!newestByAccount.has(row.social_account_id)) {
      newestByAccount.set(row.social_account_id, row.scraped_at)
    }
  }

  const queue = [...accounts].sort((a, b) => {
    const ta = newestByAccount.get(a.id)
    const tb = newestByAccount.get(b.id)
    if (!ta && !tb) return 0
    if (!ta) return -1
    if (!tb) return 1
    return ta.localeCompare(tb)
  })

  const slice = queue.slice(0, MAX_ACCOUNTS_PER_RUN)

  // Walk in chunks and re-check the clock between them, so running out of time
  // ends the run with everything scraped so far still reported (and saved)
  // rather than throwing the results away.
  const CHUNK = 15
  const results = []
  let attempted = 0
  for (let i = 0; i < slice.length; i += CHUNK) {
    if (Date.now() - startedAt > TIME_BUDGET_MS) break
    const chunk = slice.slice(i, i + CHUNK)
    attempted += chunk.length
    results.push(...(await scrapeAndSaveAll(chunk)))
  }

  const scrapeErrors = results.filter(r => r.status === 'error').length

  return NextResponse.json({
    attempted,
    remaining: Math.max(0, queue.length - attempted),
    scraped: results.length - scrapeErrors,
    scrapeErrors,
    elapsedMs: Date.now() - startedAt,
    results: results.map(r => ({ username: r.username, status: r.status, error: r.error })),
  })
}
