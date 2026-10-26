import { NextRequest, NextResponse } from 'next/server'
import { verifyCronSecret } from '@/lib/auth'
import { runInflowwLinkPass } from '@/lib/infloww-sync'

// One Infloww walk per creator, bounded by Infloww's 60-requests-per-minute
// ceiling rather than by our own speed, so give it room as the roster grows.
export const maxDuration = 300

// GET /api/cron/infloww-links — the daily tracking-link pass.
//
// Binds any new exact-match links, then snapshots every bound link's
// cumulative counters and books yesterday→today as one day's clicks and subs.
// Both halves share a single fetch per creator; see runInflowwLinkPass.
export async function GET(req: NextRequest) {
  if (!verifyCronSecret(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const startedAt = Date.now()
  const result = await runInflowwLinkPass()
  return NextResponse.json({ ...result, elapsedMs: Date.now() - startedAt })
}
