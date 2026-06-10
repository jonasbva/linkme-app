import { describe, it, expect, beforeAll } from 'vitest'
import { encryptSecret, decryptSecret, isEncrypted } from '@/lib/infloww-crypto'

beforeAll(() => {
  process.env.INFLOWW_KEY_ENC_SECRET = 'test-encryption-secret-please-change'
})

describe('infloww-crypto', () => {
  it('round-trips a secret', async () => {
    const plain = 'super-secret-infloww-api-key-1234567890'
    const enc = await encryptSecret(plain)
    expect(enc).not.toBe(plain)
    expect(enc.startsWith('enc:v1:')).toBe(true)
    expect(isEncrypted(enc)).toBe(true)
    expect(await decryptSecret(enc)).toBe(plain)
  })

  it('produces a different ciphertext each time (random IV)', async () => {
    const a = await encryptSecret('same-input')
    const b = await encryptSecret('same-input')
    expect(a).not.toBe(b)
    expect(await decryptSecret(a)).toBe('same-input')
    expect(await decryptSecret(b)).toBe('same-input')
  })

  it('treats unprefixed values as legacy plaintext on decrypt', async () => {
    expect(isEncrypted('plain-legacy-key')).toBe(false)
    expect(await decryptSecret('plain-legacy-key')).toBe('plain-legacy-key')
  })

  it('returns empty string for empty input', async () => {
    expect(await encryptSecret('')).toBe('')
    expect(await decryptSecret('')).toBe('')
    expect(await decryptSecret(null)).toBe('')
  })

  it('returns empty string on a key mismatch (cannot decrypt)', async () => {
    const enc = await encryptSecret('secret')
    process.env.INFLOWW_KEY_ENC_SECRET = 'a-completely-different-secret'
    expect(await decryptSecret(enc)).toBe('')
    process.env.INFLOWW_KEY_ENC_SECRET = 'test-encryption-secret-please-change'
  })
})
