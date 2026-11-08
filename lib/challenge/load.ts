import { createServerSupabaseClient } from '@/lib/supabase'
import { getUserPermissions, SessionUser } from '@/lib/auth'
import { CHALLENGE, PARTICIPANTS } from './config'
import { calculateRace } from './calculate'

export async function loadRace(user: SessionUser, cutoff?: string) {
  const db = createServerSupabaseClient()
  let visibleIds: string[] | null = null
  if (!user.is_super_admin) {
    const permissions = await getUserPermissions(user.id)
    // Same read scope as the existing Conversions / Expectations endpoint.
    visibleIds = permissions.grantAllCreators ? null : permissions.visibleCreatorIds
  }
  // Jonas explicitly approved shared aggregate standings for these six
  // enrolled employees. This capability does not grant creator-level access.
  // Nonparticipants retain their existing conversion read scope.
  const sharedStandings = PARTICIPANTS.some(p => p.id === user.id)
  const allIds = PARTICIPANTS.flatMap(p => p.creators.map(c => c.id))
  const ids = allIds.filter(id => sharedStandings || visibleIds === null || visibleIds.includes(id))
  if (!ids.length) return calculateRace({ rows: [], creators: [], visibleIds, cutoff })
  // No active-only filter: banned/deactivated creators keep counting. At most
  // 16 × 30 daily rows, below the existing Data API page limit.
  const [creators, daily] = await Promise.all([
    db.from('creators').select('id').in('id', ids),
    db.from('creator_daily').select('creator_id, date, new_subs, updated_at')
      .in('creator_id', ids).gte('date', CHALLENGE.start).lte('date', cutoff || CHALLENGE.end),
  ])
  if (creators.error || daily.error) throw new Error('Challenge-Daten konnten nicht geladen werden.')
  const race = calculateRace({ rows: daily.data || [], creators: creators.data || [], visibleIds: sharedStandings ? null : visibleIds, cutoff })
  // Redact on the server, never just in the UI. Shared race totals/ranks and
  // aggregate history remain available; protected per-creator observations,
  // dates and data gaps never reach an unauthorized client.
  if (sharedStandings && visibleIds !== null) {
    const visible = new Set(visibleIds)
    for (const racer of race.racers) {
      racer.breakdown = racer.breakdown.map(c => visible.has(c.id) ? c : {
        ...c, access: false, exists: true, total: null, percent: null,
        latestDate: null, missingDates: [], invalidDates: [],
      })
    }
  }
  return race
}
