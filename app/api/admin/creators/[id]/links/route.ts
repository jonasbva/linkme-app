import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase'

function isAdmin() {
  return cookies().get('admin_auth')?.value === 'true'
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('links')
    .insert({ ...body, creator_id: params.id })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}
