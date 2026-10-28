import { describe, it, expect } from 'vitest'
import { savedRows } from '@/lib/conversion-save'

describe('conversion save feedback', () => {
  it('accepts confirmed rows from the server', async () => {
    const rows = [{ creator_id: 'creator', new_subs: 12 }]
    expect(await savedRows(Response.json(rows))).toEqual(rows)
  })
  it('explains expired sessions', async () => {
    await expect(savedRows(new Response('', { status: 401 }))).rejects.toThrow('sign in again')
  })
  it('explains missing permissions', async () => {
    await expect(savedRows(new Response('', { status: 403 }))).rejects.toThrow('permission')
  })
  it('handles non-JSON server failures without leaking internal errors', async () => {
    await expect(savedRows(new Response('internal database details', { status: 500 }))).rejects.toThrow('Please try again')
  })
  it('does not report success for an unexpected response', async () => {
    await expect(savedRows(Response.json({ error: 'unexpected' }))).rejects.toThrow('Could not confirm')
  })
})
