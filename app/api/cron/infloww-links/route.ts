import { NextRequest, NextResponse } from 'next/server'
import { verifyCronSecret } from '@/lib/auth'
import { discoverTrackingLinks, syncInflowwLinkStats } from '@/lib/infloww-sync'

// Discovery is one Infloww walk per creator and the snapshot pass is another,
// so give the function room as the roster grows.
export const maxDuration = 300

// GET /api/cron/infloww-links — the daily tracking-link pass.
//
// Two steps, in this order:
//   1. discover — pull every creator's Infloww tracking links and bind the ones
//      that exactly match an account we track, so new links wire themselves up.
//   2. sync — snapshot cumulative counters and book yesterday→today as a day.
//
// Discovery runs first so a link created today starts collecting from today.
export async function GET(req: NextRequest) {
  if (!verifyCronSecret(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const startedAt = Date.now()
  const discovery = await discoverTrackingLinks()
  const sync = await syncInflowwLinkStats()

  return NextResponse.json({
    discovery: {
      creatorsChecked: discovery.creatorsChecked,
      linksSeen: discovery.linksSeen,
      newlyConnected: discovery.connected.length,
      connected: discovery.connected,
      errors: discovery.errors,
    },
    sync,
    elapsedMs: Date.now() - startedAt,
  })
}
