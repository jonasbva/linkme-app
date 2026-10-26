import { NextRequest, NextResponse } from 'next/server'
import { verifyCronSecret } from '@/lib/auth'
import { rebuildRevenueCache, resolveRevenueRange } from '@/lib/revenue-cache'

// A full rebuild is a paged Infloww pull per creator, bounded by Infloww's
// 60-requests-per-minute ceiling rather than by our own speed, so it takes a
// while. Without this the cron inherited the default timeout and was killed
// part-way, which is why Revenue so often had no cache to read.
export const maxDuration = 300

// ─── GET Handler (called by Vercel Cron) ────────────────────────────
// Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`. Fails closed if
// CRON_SECRET is not configured.
export async function GET(req: NextRequest) {
  if (!verifyCronSecret(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const { fromMs, toMs } = resolveRevenueRange(searchParams)

  const result = await rebuildRevenueCache(fromMs, toMs)
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }
  return NextResponse.json(result)
}
