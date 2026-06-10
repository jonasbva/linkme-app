// AES-GCM encryption for secrets at rest (the Infloww API key in infloww_config).
//
// Defense in depth: even though the config route is super-admin gated, a DB dump
// must not expose the live API key. The key is encrypted before it is written and
// decrypted only server-side when an Infloww API call needs it.
//
// Storage format: `enc:v1:<base64url(iv)>.<base64url(ciphertext+tag)>`
// Values without the `enc:v1:` prefix are treated as legacy plaintext on read,
// so existing rows keep working until they are re-saved (see the migration note
// in supabase/infloww_api_key_encryption_note.md).

const PREFIX = 'enc:v1:'

function getEncSecret(): string {
  const s = process.env.INFLOWW_KEY_ENC_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!s) {
    throw new Error('INFLOWW_KEY_ENC_SECRET (or SUPABASE_SERVICE_ROLE_KEY) must be set to encrypt the Infloww API key')
  }
  return s
}

// Derive a stable 256-bit AES key from the secret string.
async function getAesKey(): Promise<CryptoKey> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(getEncSecret()))
  return crypto.subtle.importKey('raw', digest, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt'])
}

function base64urlFromBytes(bytes: Uint8Array): string {
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64urlToBytes(s: string): Uint8Array {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/')
  const bin = atob(b64)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

export function isEncrypted(value: string | null | undefined): boolean {
  return typeof value === 'string' && value.startsWith(PREFIX)
}

// Encrypt a plaintext secret. Empty/falsy input is returned unchanged so that
// "no key set" stays an empty string rather than an encrypted blob.
export async function encryptSecret(plaintext: string): Promise<string> {
  if (!plaintext) return ''
  const key = await getAesKey()
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const ct = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(plaintext)
  )
  return `${PREFIX}${base64urlFromBytes(iv)}.${base64urlFromBytes(new Uint8Array(ct))}`
}

// Decrypt a stored secret. Legacy plaintext (no prefix) is returned as-is so the
// app keeps working before the one-off re-save. Returns '' on empty/corrupt input
// or a key mismatch.
export async function decryptSecret(stored: string | null | undefined): Promise<string> {
  if (!stored) return ''
  if (!isEncrypted(stored)) return stored // legacy plaintext
  const [ivB64, ctB64] = stored.slice(PREFIX.length).split('.')
  if (!ivB64 || !ctB64) return ''
  try {
    const key = await getAesKey()
    const iv = base64urlToBytes(ivB64) as BufferSource
    const ct = base64urlToBytes(ctB64) as BufferSource
    const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct)
    return new TextDecoder().decode(pt)
  } catch {
    return ''
  }
}
