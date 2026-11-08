import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

const mock = vi.hoisted(() => ({ gate: { ok: true, user: { id: 'employee', is_super_admin: false } } as any, access: true, upsert: vi.fn(), remove: vi.fn(), cells: new Map<string, any>() }))
vi.mock('@/lib/auth', () => ({
  requireUser: async () => mock.gate,
  requireCreatorAccess: async () => mock.access ? mock.gate : { ok: false, status: 403, error: 'Forbidden' },
  canAccessCreator: async () => mock.access,
  getUserPermissions: vi.fn(),
  guardResponse: (r: any) => NextResponse.json({ error: r.error }, { status: r.status }),
}))
vi.mock('@/lib/supabase', () => ({
  createServerSupabaseClient: () => ({ from: () => ({
    upsert: (...args: any[]) => mock.upsert(...args),
    delete: () => mock.remove(),
  }) }),
}))
import { POST } from '@/app/api/admin/conversions/route'
const request = (body: any) => new NextRequest('http://localhost/api/admin/conversions', { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } })
const cell = (value: unknown) => request({ action: 'update_creator_cell', creator_id: 'creator', date: '2026-11-01', value })
beforeEach(() => {
  vi.clearAllMocks(); mock.cells.clear(); mock.access = true
  mock.gate = { ok: true, user: { id: 'employee', is_super_admin: false } }
  mock.upsert.mockImplementation((payload: any) => ({ select: async () => {
    const rows = Array.isArray(payload) ? payload : [payload]
    for (const row of rows) mock.cells.set(row.creator_id + row.date, row)
    return { data: rows, error: null }
  } }))
  mock.remove.mockImplementation(() => {
    const filter: any = {}
    const query: any = { eq: (key: string, value: any) => { filter[key] = value; return query }, select: async () => {
      const key = filter.creator_id + filter.date
      const row = mock.cells.get(key); mock.cells.delete(key)
      return { data: row ? [row] : [], error: null }
    } }
    return query
  })
})
describe('Daily new-sub writes used by the race', () => {
  it('replaces 100 with 120 using creator/date uniqueness, then deletes back to missing', async () => {
    expect((await POST(cell(100))).status).toBe(200)
    expect((await POST(cell(120))).status).toBe(200)
    expect(mock.cells.size).toBe(1)
    expect([...mock.cells.values()][0].new_subs).toBe(120)
    expect(mock.upsert.mock.calls[1][1]).toEqual({ onConflict: 'creator_id,date' })
    expect((await POST(cell(null))).status).toBe(200)
    expect(mock.cells.size).toBe(0)
  })
  it('keeps an explicitly entered zero', async () => {
    await POST(cell(0))
    expect([...mock.cells.values()][0].new_subs).toBe(0)
    expect(mock.remove).not.toHaveBeenCalled()
  })
  it.each([-1, 1.5, '120', '', 2147483648])('rejects invalid new-sub value %s', async value => {
    expect((await POST(cell(value))).status).toBe(400)
    expect(mock.upsert).not.toHaveBeenCalled()
    expect(mock.remove).not.toHaveBeenCalled()
  })
  it('checks input permissions for corrections and deletion', async () => {
    mock.access = false
    expect((await POST(cell(120))).status).toBe(403)
    expect((await POST(cell(null))).status).toBe(403)
    expect(mock.upsert).not.toHaveBeenCalled()
    expect(mock.remove).not.toHaveBeenCalled()
  })
  it('rejects malformed dates and duplicate batch entries before any write', async () => {
    for (const body of [
      { date: '2026-11-31', entries: [{ creator_id: 'creator', new_subs: 5 }] },
      { date: '2026-11-01', entries: [{ creator_id: 'creator', new_subs: 5 }, { creator_id: 'creator', new_subs: 10 }] },
      { date: '2026-11-01', entries: [{ creator_id: 'creator', new_subs: null }] },
    ]) expect((await POST(request({ action: 'set_daily_subs', ...body }))).status).toBe(400)
    expect(mock.upsert).not.toHaveBeenCalled()
  })
})
