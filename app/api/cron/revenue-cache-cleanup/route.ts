import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

// Prune stale revenue_cache rows.
//  - `live:*`  rows older than 24h
//  - `rng:*`   rows older than 90 days
// Backward-compat keys ('today', 'YYYY-MM-DD') are left untouched —
// they are idempotently overwritten by the rebuild cron.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServerSupabaseClient()

  const now = Date.now()
  const liveCutoff = new Date(now - 24 * 60 * 60 * 1000).toISOString()
  const rngCutoff = new Date(now - 90 * 24 * 60 * 60 * 1000).toISOString()

  const liveRes = await supabase
    .from('revenue_cache')
    .delete({ count: 'exact' })
    .like('cache_key', 'live:%')
    .lt('fetched_at', liveCutoff)

  const rngRes = await supabase
    .from('revenue_cache')
    .delete({ count: 'exact' })
    .like('cache_key', 'rng:%')
    .lt('fetched_at', rngCutoff)

  if (liveRes.error || rngRes.error) {
    return NextResponse.json(
      {
        error: liveRes.error?.message || rngRes.error?.message,
        liveDeleted: liveRes.count ?? 0,
        rngDeleted: rngRes.count ?? 0,
      },
      { status: 500 }
    )
  }

  return NextResponse.json({
    ok: true,
    liveDeleted: liveRes.count ?? 0,
    rngDeleted: rngRes.count ?? 0,
    liveCutoff,
    rngCutoff,
  })
}
