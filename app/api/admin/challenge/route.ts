import { NextRequest, NextResponse } from 'next/server'
import { guardResponse } from '@/lib/auth'
import { requireChallengeAccess } from '@/lib/challenge/access'
import { loadRace } from '@/lib/challenge/load'
import { CHALLENGE } from '@/lib/challenge/config'
import { businessDate, validDate } from '@/lib/challenge/dates'

export const dynamic = 'force-dynamic'
export async function GET(req: NextRequest) {
  const gate = await requireChallengeAccess()
  if (!gate.ok) return guardResponse(gate)
  const cutoff = req.nextUrl.searchParams.get('asOf') || undefined
  if (cutoff && (!validDate(cutoff) || cutoff < CHALLENGE.start || cutoff > CHALLENGE.end || cutoff > businessDate())) {
    return NextResponse.json({ error: 'Ungültiger Datenstichtag.' }, { status: 400 })
  }
  try {
    const race = await loadRace(gate.user, cutoff)
    return NextResponse.json({ race, currentUserId: gate.user.id, today: businessDate() }, {
      headers: { 'Cache-Control': 'private, no-store' },
    })
  } catch {
    return NextResponse.json({ error: 'Challenge-Daten konnten nicht geladen werden. Bitte erneut versuchen.' }, { status: 500 })
  }
}
