import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase'

function isAdmin() {
  return cookies().get('admin_auth')?.value === 'true'
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string; linkId: string } }) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.from('links').update(body).eq('id', params.linkId).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string; linkId: string } }) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = createServerSupabaseClient()
  await supabase.from('links').delete().eq('id', params.linkId)
  return NextResponse.json({ ok: true })
}
