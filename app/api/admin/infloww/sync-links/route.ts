import { NextRequest, NextResponse } from 'next/server'
import { requireUser, requireCreatorAccess, guardResponse } from '@/lib/auth'
import { runInflowwLinkPass } from '@/lib/infloww-sync'

export const maxDuration = 300

// POST /api/admin/infloww/sync-links  { creator_id?: string }
//
// Runs the same pass the nightly cron runs — bind new exact-match links, then
// refresh every bound link's stats — now rather than waiting for it.
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

  const result = await runInflowwLinkPass(creatorId)
  return NextResponse.json({
    ...result,
    // Names the Links page already reads.
    newlyConnected: result.newlyConnected.length,
    connected: result.newlyConnected,
  })
}
