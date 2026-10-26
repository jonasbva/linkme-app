import { NextRequest, NextResponse } from 'next/server'
import { requireUser, requireCreatorAccess, guardResponse } from '@/lib/auth'
import { discoverTrackingLinks, syncInflowwLinkStats } from '@/lib/infloww-sync'

export const maxDuration = 120

// POST /api/admin/infloww/sync-links  { creator_id?: string, discover?: boolean }
// Refreshes tracking-link stats now, rather than waiting for the nightly cron.
// Also binds any new exact-match links first, unless discover is false, so the
// button does the same work the cron does.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const creatorId: string | undefined = body.creator_id || undefined

  if (creatorId) {
    const gate = await requireCreatorAccess(creatorId, 'input_conversions')
    if (!gate.ok) return guardResponse(gate)
  } else {
    const gate = await requireUser()
    if (!gate.ok) return guardResponse(gate)
    if (!gate.user.is_super_admin) {
      return NextResponse.json({ error: 'Super admin required to sync every creator' }, { status: 403 })
    }
  }

  const discovery = body.discover === false ? null : await discoverTrackingLinks(creatorId)
  const result = await syncInflowwLinkStats(creatorId)
  return NextResponse.json({
    ...result,
    newlyConnected: discovery?.connected.length ?? 0,
    connected: discovery?.connected ?? [],
    discoveryErrors: discovery?.errors ?? [],
  })
}
