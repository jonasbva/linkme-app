import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { getSessionUser } from '@/lib/auth'

// PATCH: update a conversion account
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; accountId: string } }
) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const updates: Record<string, any> = {}

  if (body.handle !== undefined) {
    const h = String(body.handle).trim().replace(/^@/, '').toLowerCase()
    if (!h || !/^[a-z0-9_.-]+$/.test(h)) {
      return NextResponse.json({ error: 'Invalid handle format' }, { status: 400 })
    }
    updates.handle = h
  }
  if (body.display_label !== undefined) {
    const v = body.display_label === null ? null : String(body.display_label).trim() || null
    updates.display_label = v
  }
  if (body.sheet_tab_name !== undefined) {
    const v = body.sheet_tab_name === null ? null : String(body.sheet_tab_name).trim() || null
    updates.sheet_tab_name = v
  }
  if (body.is_active !== undefined) {
    updates.is_active = !!body.is_active
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No updates provided' }, { status: 400 })
  }
  updates.updated_at = new Date().toISOString()

  const supabase = createServerSupabaseClient()

  const { data: existing } = await supabase
    .from('conversion_accounts')
    .select('id, creator_id')
    .eq('id', params.accountId)
    .single()

  if (!existing) return NextResponse.json({ error: 'Account not found' }, { status: 404 })
  if (existing.creator_id !== params.id) {
    return NextResponse.json({ error: 'Account does not belong to this creator' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('conversion_accounts')
    .update(updates)
    .eq('id', params.accountId)
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: `@${updates.handle} is already used by another conversion account` }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ account: data })
}

// DELETE: remove a conversion account
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string; accountId: string } }
) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!user.is_super_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const supabase = createServerSupabaseClient()

  const { data: existing } = await supabase
    .from('conversion_accounts')
    .select('id, creator_id')
    .eq('id', params.accountId)
    .single()

  if (!existing) return NextResponse.json({ error: 'Account not found' }, { status: 404 })
  if (existing.creator_id !== params.id) {
    return NextResponse.json({ error: 'Account does not belong to this creator' }, { status: 403 })
  }

  const { error } = await supabase.from('conversion_accounts').delete().eq('id', params.accountId)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ ok: true })
}
