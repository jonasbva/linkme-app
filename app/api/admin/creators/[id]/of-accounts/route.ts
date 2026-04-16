import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { getSessionUser } from '@/lib/auth'

// GET: list OF accounts for a creator
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('of_accounts')
    .select('id, creator_id, handle, display_label, is_active, created_at')
    .eq('creator_id', params.id)
    .order('display_label', { ascending: true, nullsFirst: true })
    .order('handle', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ accounts: data || [] })
}

// POST: create a new OF account
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const handle = String(body.handle || '').trim().replace(/^@/, '').toLowerCase()
  const display_label = body.display_label ? String(body.display_label).trim() : null
  const is_active = body.is_active !== false

  if (!handle) {
    return NextResponse.json({ error: 'handle is required' }, { status: 400 })
  }
  if (!/^[a-z0-9_.-]+$/.test(handle)) {
    return NextResponse.json({ error: 'Invalid handle format' }, { status: 400 })
  }

  const supabase = createServerSupabaseClient()

  // Confirm creator exists
  const { data: creator } = await supabase.from('creators').select('id').eq('id', params.id).single()
  if (!creator) return NextResponse.json({ error: 'Creator not found' }, { status: 404 })

  const { data, error } = await supabase
    .from('of_accounts')
    .insert({ creator_id: params.id, handle, display_label, is_active })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: `@${handle} is already linked to another creator` }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ account: data })
}
