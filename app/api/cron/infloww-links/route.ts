import { NextRequest, NextResponse } from 'next/server'
import { verifyCronSecret } from '@/lib/auth'
import { syncInflowwLinkStats } from '@/lib/infloww-sync'

// Snapshotting is one Infloww call per creator, so it fits comfortably, but
// give it room in case the roster grows.
export const maxDuration = 300

// GET /api/cron/infloww-links — daily tracking-link stats pull.
//
// Runs once a day, late enough that Infloww has settled the previous day (the
// API lags links by up to ~2h). Each run snapshots cumulative counters and
// books yesterday→today as one day's clicks and subs.
export async function GET(req: NextRequest) {
  if (!verifyCronSecret(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const startedAt = Date.now()
  const result = await syncInflowwLinkStats()
  return NextResponse.json({ ...result, elapsedMs: Date.now() - startedAt })
}
