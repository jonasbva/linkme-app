import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { getSessionUser } from '@/lib/auth'

async function handleUpdate(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { id, created_at, ...updates } = body
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.from('creators').update(updates).eq('id', params.id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

export const PUT = handleUpdate
export const PATCH = handleUpdate

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!user.is_super_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const supabase = createServerSupabaseClient()
  await supabase.from('creators').delete().eq('id', params.id)
  return NextResponse.json({ ok: true })
}
