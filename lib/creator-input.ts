type NewCreator = {
  display_name: string
  slug: string
  of_handle: string | null
  is_active: boolean
}

type CreatorInputResult =
  | { ok: true; data: NewCreator }
  | { ok: false; error: string }

// Shared by the form and API so a pasted profile link is saved as a handle,
// and creators can be added before their OnlyFans account is available.
export function parseNewCreator(input: unknown): CreatorInputResult {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { ok: false, error: 'Enter the creator name and, if available, their OnlyFans handle.' }
  }
  const body = input as Record<string, unknown>
  const name = typeof body.display_name === 'string' ? body.display_name.trim() : ''
  if (!name || name.length > 255) {
    return { ok: false, error: 'Enter a creator name of up to 255 characters.' }
  }
  if (body.of_handle != null && typeof body.of_handle !== 'string') {
    return { ok: false, error: 'Enter an OnlyFans handle or profile link, or leave it blank.' }
  }
  let handle = typeof body.of_handle === 'string' ? body.of_handle.trim() : ''
  const suppliedHandle = handle.length > 0
  if (/^(?:https?:\/\/|(?:www\.)?onlyfans\.com\/)/i.test(handle)) {
    try {
      const url = new URL(/^https?:\/\//i.test(handle) ? handle : `https://${handle}`)
      if (!['onlyfans.com', 'www.onlyfans.com'].includes(url.hostname.toLowerCase()) || url.username || url.password || url.port) {
        return { ok: false, error: 'Use an onlyfans.com profile link or enter just the handle.' }
      }
      handle = url.pathname.replace(/^\//, '').replace(/\/$/, '')
    } catch {
      return { ok: false, error: 'Use an onlyfans.com profile link or enter just the handle.' }
    }
  }
  handle = handle.replace(/^@/, '').toLowerCase()
  if ((suppliedHandle && !handle) || (handle && !/^[a-z0-9_.-]+$/.test(handle))) {
    return { ok: false, error: 'Enter the OnlyFans handle without spaces, or paste the full profile link.' }
  }
  const slug = handle || name.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  if (!slug) {
    return { ok: false, error: 'Add an OnlyFans handle to create a profile for this name.' }
  }
  if (body.is_active !== undefined && typeof body.is_active !== 'boolean') {
    return { ok: false, error: 'Choose whether the creator is active.' }
  }
  return { ok: true, data: { display_name: name, slug, of_handle: handle || null, is_active: body.is_active ?? true } }
}
