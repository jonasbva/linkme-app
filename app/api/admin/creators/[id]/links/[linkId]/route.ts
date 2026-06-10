import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { requireCreatorAccess, guardResponse, childBelongsToCreator } from '@/lib/auth'

export async function PATCH(req: NextRequest, { params }: { params: { id: string; linkId: string } }) {
  const gate = await requireCreatorAccess(params.id, 'edit_links')
  if (!gate.ok) return guardResponse(gate)
  if (!(await childBelongsToCreator('links', params.linkId, params.id))) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  const body = await req.json()
  // Don't allow the payload to move the link to another creator.
  const { id, creator_id, ...updates } = body
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.from('links').update(updates).eq('id', params.linkId).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string; linkId: string } }) {
  const gate = await requireCreatorAccess(params.id, 'edit_links')
  if (!gate.ok) return guardResponse(gate)
  if (!(await childBelongsToCreator('links', params.linkId, params.id))) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  const supabase = createServerSupabaseClient()
  const { error } = await supabase.from('links').delete().eq('id', params.linkId)
  if (error) {
    console.error('Delete link error:', error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
  return NextResponse.json({ ok: true })
}
