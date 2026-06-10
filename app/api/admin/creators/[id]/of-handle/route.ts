import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { requireCreatorAccess, guardResponse } from '@/lib/auth'

// PATCH: set/clear the single OF handle on the creator row.
// Body: { of_handle: string | null }
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const gate = await requireCreatorAccess(params.id, 'edit_settings')
  if (!gate.ok) return guardResponse(gate)

  const body = await req.json()
  let next: string | null
  if (body.of_handle === null || body.of_handle === undefined || body.of_handle === '') {
    next = null
  } else {
    const h = String(body.of_handle).trim().replace(/^@/, '').toLowerCase()
    if (!/^[a-z0-9_.-]+$/.test(h)) {
      return NextResponse.json({ error: 'Invalid handle format' }, { status: 400 })
    }
    next = h
  }

  const supabase = createServerSupabaseClient()

  const { data: creator } = await supabase.from('creators').select('id').eq('id', params.id).single()
  if (!creator) return NextResponse.json({ error: 'Creator not found' }, { status: 404 })

  // Enforce uniqueness across creators (handle is stored normalized lowercase).
  if (next) {
    const { data: clash } = await supabase
      .from('creators')
      .select('id')
      .eq('of_handle', next)
      .neq('id', params.id)
      .maybeSingle()
    if (clash) {
      return NextResponse.json({ error: `@${next} is already linked to another creator` }, { status: 409 })
    }
  }

  const { data, error } = await supabase
    .from('creators')
    .update({ of_handle: next, updated_at: new Date().toISOString() })
    .eq('id', params.id)
    .select('id, of_handle')
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: `@${next} is already linked to another creator` }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ creator: data })
}
