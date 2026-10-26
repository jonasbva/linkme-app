import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { requireCreatorAccess, childBelongsToCreator, guardResponse } from '@/lib/auth'

type Params = { params: { id: string; linkId: string } }

// PATCH /api/admin/creators/:id/tracking-links/:linkId
export async function PATCH(req: NextRequest, { params }: Params) {
  const gate = await requireCreatorAccess(params.id, 'input_conversions')
  if (!gate.ok) return guardResponse(gate)
  if (!(await childBelongsToCreator('tracking_links', params.linkId, params.id))) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const body = await req.json()
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (typeof body.label === 'string') updates.label = body.label.trim()
  if (typeof body.url === 'string') updates.url = body.url.trim() || null
  if (typeof body.is_active === 'boolean') updates.is_active = body.is_active
  if (typeof body.sort_order === 'number') updates.sort_order = body.sort_order
  if ('social_account_id' in body) updates.social_account_id = body.social_account_id || null
  if ('infloww_link_id' in body) {
    updates.infloww_link_id = body.infloww_link_id ? String(body.infloww_link_id) : null
    updates.infloww_link_name = body.infloww_link_name || null
    updates.infloww_code = body.infloww_code || null
    updates.infloww_synced_at = body.infloww_link_id ? new Date().toISOString() : null
  }

  const supabase = createServerSupabaseClient()

  // Two tracking links must never claim the same Infloww link.
  if (updates.infloww_link_id) {
    const { data: taken } = await supabase
      .from('tracking_links')
      .select('id, label')
      .eq('infloww_link_id', updates.infloww_link_id)
      .neq('id', params.linkId)
      .maybeSingle()
    if (taken) {
      return NextResponse.json(
        { error: `That Infloww link is already connected to "${taken.label}"` },
        { status: 409 },
      )
    }
  }

  if (updates.social_account_id) {
    const { data: acc } = await supabase
      .from('social_accounts')
      .select('id')
      .eq('id', updates.social_account_id)
      .eq('creator_id', params.id)
      .maybeSingle()
    if (!acc) return NextResponse.json({ error: 'Social account not found for this creator' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('tracking_links')
    .update(updates)
    .eq('id', params.linkId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// DELETE /api/admin/creators/:id/tracking-links/:linkId — removes its daily rows too
export async function DELETE(_req: NextRequest, { params }: Params) {
  const gate = await requireCreatorAccess(params.id, 'input_conversions')
  if (!gate.ok) return guardResponse(gate)
  if (!(await childBelongsToCreator('tracking_links', params.linkId, params.id))) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const supabase = createServerSupabaseClient()
  const { error } = await supabase.from('tracking_links').delete().eq('id', params.linkId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
