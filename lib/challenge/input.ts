import { CHALLENGE, PARTICIPANTS } from './config'
import { validDate } from './dates'

export interface CreatorPatch {
  id: string
  target: number
  minimum?: boolean
  startDate?: string
}

export interface ParticipantPatch {
  id: string
  target?: number
  baseline?: number
  basis?: string
  provisional?: boolean
  creators?: CreatorPatch[]
}

export interface ChallengePatch {
  expectedRevision: number
  participants: ParticipantPatch[]
}

type Result<T> = { ok: true; value: T } | { ok: false; error: string }

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const fields = ['target', 'baseline', 'basis', 'provisional', 'creators']
const fail = (error: string): { ok: false; error: string } => ({ ok: false, error })
const uuid = (value: unknown): value is string => typeof value === 'string' && UUID.test(value)
const integer = (value: unknown, minimum: number, maximum = 2147483647): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= minimum && value <= maximum
function object(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const prototype = Object.getPrototypeOf(value)
  return prototype === Object.prototype || prototype === null
}
const allowed = (value: Record<string, unknown>, keys: string[]) => Object.keys(value).every(key => keys.includes(key))

function parseParticipant(value: unknown): Result<ParticipantPatch> {
  if (!object(value) || !allowed(value, ['id', ...fields])) return fail('Unexpected participant fields.')
  if (!uuid(value.id)) return fail('Participant id must be a UUID.')
  const id = value.id.toLowerCase()
  if (!PARTICIPANTS.some(participant => participant.id === id)) return fail('Unknown challenge participant.')
  if (!fields.some(field => Object.hasOwn(value, field))) return fail('Each participant must include at least one change.')

  const participant: ParticipantPatch = { id }
  if (Object.hasOwn(value, 'target')) {
    if (!integer(value.target, 1)) return fail('target must be an integer between 1 and 2147483647.')
    participant.target = value.target
  }
  if (Object.hasOwn(value, 'baseline')) {
    if (!integer(value.baseline, 0)) return fail('baseline must be an integer between 0 and 2147483647.')
    participant.baseline = value.baseline
  }
  if (Object.hasOwn(value, 'basis')) {
    if (typeof value.basis !== 'string' || !value.basis.trim() || value.basis.trim().length > 2000) return fail('basis must contain 1–2000 characters.')
    participant.basis = value.basis.trim()
  }
  if (Object.hasOwn(value, 'provisional')) {
    if (typeof value.provisional !== 'boolean') return fail('provisional must be a boolean.')
    participant.provisional = value.provisional
  }
  if (Object.hasOwn(value, 'creators')) {
    if (!Array.isArray(value.creators) || value.creators.length < 1 || value.creators.length > 100) return fail('creators must contain 1–100 creators.')
    const creators: CreatorPatch[] = []
    const ids = new Set<string>()
    for (const creator of value.creators) {
      if (!object(creator) || !allowed(creator, ['id', 'target', 'minimum', 'startDate'])) return fail('Unexpected creator fields. Creator names are resolved by the dashboard.')
      if (!uuid(creator.id)) return fail('Creator id must be a UUID.')
      const creatorId = creator.id.toLowerCase()
      if (ids.has(creatorId)) return fail('Duplicate creator assignments are not allowed.')
      ids.add(creatorId)
      if (!integer(creator.target, 1)) return fail('Creator target must be an integer between 1 and 2147483647.')
      const result: CreatorPatch = { id: creatorId, target: creator.target }
      if (Object.hasOwn(creator, 'minimum')) {
        if (typeof creator.minimum !== 'boolean') return fail('Creator minimum must be a boolean.')
        result.minimum = creator.minimum
      }
      if (Object.hasOwn(creator, 'startDate')) {
        if (!validDate(creator.startDate) || creator.startDate < CHALLENGE.start || creator.startDate > CHALLENGE.end) return fail('Creator startDate must be a valid date within the challenge.')
        result.startDate = creator.startDate
      }
      creators.push(result)
    }
    participant.creators = creators
  }
  return { ok: true, value: participant }
}

/** Parse either an atomic batch or a single-manager PATCH body. */
export function parseChallengePatch(body: unknown, participantId?: string): Result<ChallengePatch> {
  if (!object(body)) return fail('A JSON object body is required.')
  const single = participantId !== undefined
  if (!allowed(body, single ? ['expectedRevision', ...fields] : ['expectedRevision', 'participants'])) return fail('Unexpected challenge fields.')
  if (!integer(body.expectedRevision, 0, 2147483646)) return fail('expectedRevision must be an integer between 0 and 2147483646.')

  let values: unknown[]
  if (single) {
    const { expectedRevision: _revision, ...changes } = body
    values = [{ id: participantId, ...changes }]
  } else {
    if (!Array.isArray(body.participants) || body.participants.length < 1 || body.participants.length > PARTICIPANTS.length) return fail(`participants must contain 1–${PARTICIPANTS.length} changes.`)
    values = body.participants
  }
  const participants: ParticipantPatch[] = []
  const ids = new Set<string>()
  const creatorIds = new Set<string>()
  for (const value of values) {
    const parsed = parseParticipant(value)
    if (!parsed.ok) return parsed
    if (ids.has(parsed.value.id)) return fail('Duplicate challenge participants are not allowed.')
    ids.add(parsed.value.id)
    for (const creator of parsed.value.creators || []) {
      if (creatorIds.has(creator.id)) return fail('Duplicate creator assignments are not allowed.')
      creatorIds.add(creator.id)
    }
    participants.push(parsed.value)
  }
  return { ok: true, value: { expectedRevision: body.expectedRevision, participants } }
}
