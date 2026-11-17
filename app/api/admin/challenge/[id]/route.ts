import { NextRequest, NextResponse } from 'next/server'
import { guardResponse, requireSuperAdmin } from '@/lib/auth'
import { loadChallengeConfiguration } from '@/lib/challenge/store'
import { patchChallenge } from '@/lib/challenge/update'

export const dynamic = 'force-dynamic'
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const gate = await requireSuperAdmin()
  if (!gate.ok) return guardResponse(gate)
  try {
    const { revision, participants } = await loadChallengeConfiguration()
    const participant = participants.find(p => p.id === params.id.toLowerCase())
    return participant
      ? NextResponse.json({ revision, participant }, { headers: { 'Cache-Control': 'private, no-store' } })
      : NextResponse.json({ error: 'Challenge-Manager nicht gefunden.' }, { status: 404 })
  } catch {
    return NextResponse.json({ error: 'Challenge-Konfiguration konnte nicht geladen werden.' }, { status: 500 })
  }
}
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  return patchChallenge(req, params.id)
}
