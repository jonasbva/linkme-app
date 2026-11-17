import { createServerSupabaseClient } from '@/lib/supabase'
import { CHALLENGE, PARTICIPANTS, type Participant } from './config'
import { parseChallengePatch, type ChallengePatch } from './input'

export interface ChallengeConfiguration { revision: number; participants: Participant[] }
export class ChallengeUpdateError extends Error {
  constructor(message: string, public status: 400 | 404 | 409) { super(message) }
}

// One versioned document makes multi-manager reassignments a single DB write.
// Defaults represent the approved November configuration until the first edit.
export async function loadChallengeConfiguration(): Promise<ChallengeConfiguration> {
  const { data, error } = await createServerSupabaseClient().from('challenge_configurations')
    .select('revision, participants').eq('id', CHALLENGE.id).maybeSingle()
  if (error) throw new Error('Challenge-Konfiguration konnte nicht geladen werden.')
  if (!data) return { revision: 0, participants: structuredClone(PARTICIPANTS) }
  const participants = data.participants as Participant[]
  // Fail closed if persisted data is malformed; never silently reset settings.
  if (!Number.isInteger(data.revision) || data.revision < 1 || !Array.isArray(participants)) throw new Error('Invalid challenge configuration')
  const parsed = parseChallengePatch({ expectedRevision: 0, participants: participants.map(p => ({
    id: p.id, target: p.target, baseline: p.baseline, basis: p.basis, provisional: p.provisional ?? false,
    creators: p.creators.map(({ name: _name, ...creator }) => creator),
  })) })
  if (!parsed.ok || participants.length !== PARTICIPANTS.length || participants.some(p =>
    p.name !== PARTICIPANTS.find(defaults => defaults.id === p.id)?.name ||
    p.creators.some(c => typeof c.name !== 'string' || !c.name.trim())
  )) throw new Error('Invalid challenge configuration')
  validateAssignments(participants)
  // Immutable enrollment, order and bonuses always come from the approved config.
  return { revision: data.revision, participants: PARTICIPANTS.map(defaults => {
    const saved = participants.find(p => p.id === defaults.id)!
    return { ...defaults, target: saved.target, baseline: saved.baseline, basis: saved.basis,
      provisional: saved.provisional, creators: saved.creators }
  }) }
}

function validateAssignments(participants: Participant[]) {
  const ids = participants.flatMap(p => p.creators.map(c => c.id))
  if (ids.length > 30) throw new ChallengeUpdateError('Die Challenge unterstützt höchstens 30 Creator.', 400)
  if (new Set(ids).size !== ids.length) throw new ChallengeUpdateError('Ein Creator darf nur einem Manager zugeordnet sein. Verschiebungen gemeinsam per PATCH /challenge speichern.', 400)
  for (const p of participants) {
    const delayedTarget = p.creators.filter(c => c.startDate && c.startDate > CHALLENGE.start).reduce((sum, c) => sum + c.target, 0)
    if (delayedTarget > p.target) throw new ChallengeUpdateError('Zeitlich versetzte Creator-Ziele dürfen das Manager-Gesamtziel nicht überschreiten.', 400)
  }
}

export async function updateChallengeConfiguration(patch: ChallengePatch, userId: string): Promise<ChallengeConfiguration> {
  const current = await loadChallengeConfiguration()
  if (patch.expectedRevision !== current.revision) throw new ChallengeUpdateError('Die Challenge wurde inzwischen geändert. Konfiguration neu laden und Änderungen prüfen.', 409)
  const db = createServerSupabaseClient()
  const creatorIds = [...new Set(patch.participants.flatMap(p => p.creators?.map(c => c.id) || []))]
  const names = new Map<string, string>()
  if (creatorIds.length) {
    // No active-only filter: inactive/banned creators still count in November.
    const { data, error } = await db.from('creators').select('id, display_name').in('id', creatorIds)
    if (error) throw new Error('Creator lookup failed')
    for (const creator of data || []) names.set(creator.id, creator.display_name)
    if (creatorIds.some(id => !names.has(id))) throw new ChallengeUpdateError('Mindestens ein Creator existiert nicht.', 404)
  }
  const participants = current.participants.map(p => {
    const change = patch.participants.find(change => change.id === p.id)
    if (!change) return p
    const { id: _id, creators, ...fields } = change
    return { ...p, ...fields, ...(creators ? { creators: creators.map(c => ({ ...c, name: names.get(c.id)! })) } : {}) }
  })
  validateAssignments(participants)
  const revision = current.revision + 1
  const row = { id: CHALLENGE.id, revision, participants, updated_by: userId, updated_at: new Date().toISOString() }
  // Compare-and-swap also prevents a concurrent first insertion from winning twice.
  const result = current.revision === 0
    ? await db.from('challenge_configurations').insert(row).select('revision').maybeSingle()
    : await db.from('challenge_configurations').update(row).eq('id', CHALLENGE.id).eq('revision', current.revision).select('revision').maybeSingle()
  if (result.error?.code === '23505' || (!result.error && !result.data)) throw new ChallengeUpdateError('Die Challenge wurde inzwischen geändert. Konfiguration neu laden und Änderungen prüfen.', 409)
  if (result.error) throw new Error('Challenge-Konfiguration konnte nicht gespeichert werden.')
  return { revision, participants }
}
