import { NextRequest, NextResponse } from 'next/server'
import { guardResponse, requireSuperAdmin } from '@/lib/auth'
import { parseChallengePatch } from './input'
import { ChallengeUpdateError, updateChallengeConfiguration } from './store'

export async function patchChallenge(req: NextRequest, participantId?: string) {
  const gate = await requireSuperAdmin()
  if (!gate.ok) return guardResponse(gate)
  let body: unknown
  try { body = await req.json() }
  catch { return NextResponse.json({ error: 'Ungültiger JSON-Body.' }, { status: 400 }) }
  const parsed = parseChallengePatch(body, participantId)
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })
  try {
    const configuration = await updateChallengeConfiguration(parsed.value, gate.user.id)
    return NextResponse.json({ configuration }, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch (error) {
    return NextResponse.json({ error: error instanceof ChallengeUpdateError ? error.message : 'Challenge-Konfiguration konnte nicht gespeichert werden.' }, {
      status: error instanceof ChallengeUpdateError ? error.status : 500,
    })
  }
}
