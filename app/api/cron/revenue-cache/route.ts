import { NextRequest, NextResponse } from 'next/server'
import { verifyCronSecret } from '@/lib/auth'
import { rebuildRevenueCache, resolveRevenueRange } from '@/lib/revenue-cache'

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
