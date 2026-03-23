import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase'

function isAdmin() {
  return cookies().get('admin_auth')?.value === 'true'
}

// GET /api/admin/social-accounts?creator_id=xxx
export async function GET(req: NextRequest) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const creatorId = req.nextUrl.searchParams.get('creator_id')
  if (!creatorId) return NextResponse.json({ error: 'creator_id required' }, { status: 400 })

  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('social_accounts')
    .select('*')
    .eq('creator_id', creatorId)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

// POST /api/admin/social-accounts — add a social account to track
export async function POST(req: NextRequest) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { creator_id, platform, username } = await req.json()

  if (!creator_id || !platform || !username) {
    return NextResponse.json({ error: 'creator_id, platform, and username are required' }, { status: 400 })
  }

  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('social_accounts')
    .insert({ creator_id, platform, username: username.replace('@', '').trim() })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

// DELETE /api/admin/social-accounts?id=xxx
export async function DELETE(req: NextRequest) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const supabase = createServerSupabaseClient()
  const { error } = await supabase.from('social_accounts').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
