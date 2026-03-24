import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { getSessionUser } from '@/lib/auth'

// GET /api/admin/tags — list all tags, optionally with creator assignments
export async function GET() {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.from('tags').select('*').order('name')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/admin/tags — create tag, assign/unassign tag, update tag, delete tag
export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = createServerSupabaseClient()
  const body = await req.json()

  if (body.action === 'create_tag') {
    const { name, color } = body
    const { data, error } = await supabase
      .from('tags')
      .insert({ name: name.trim(), color: color || '#3b82f6' })
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data)
  }

  if (body.action === 'update_tag') {
    const { tag_id, name, color } = body
    const updates: any = {}
    if (name !== undefined) updates.name = name.trim()
    if (color !== undefined) updates.color = color
    const { data, error } = await supabase
      .from('tags')
      .update(updates)
      .eq('id', tag_id)
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data)
  }

  if (body.action === 'delete_tag') {
    const { tag_id } = body
    const { error } = await supabase.from('tags').delete().eq('id', tag_id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true })
  }

  if (body.action === 'assign_tag') {
    const { creator_id, tag_id } = body
    const { data, error } = await supabase
      .from('creator_tags')
      .insert({ creator_id, tag_id })
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data)
  }

  if (body.action === 'unassign_tag') {
    const { creator_id, tag_id } = body
    const { error } = await supabase
      .from('creator_tags')
      .delete()
      .eq('creator_id', creator_id)
      .eq('tag_id', tag_id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
