import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { requireSuperAdmin, guardResponse } from '@/lib/auth'

// GET: Fetch all creator mappings
export async function GET() {
  const gate = await requireSuperAdmin()
  if (!gate.ok) return guardResponse(gate)

  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from('infloww_creator_map')
    .select('*')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ mappings: data || [] })
}

// POST: Create or update a mapping
export async function POST(req: NextRequest) {
  const gate = await requireSuperAdmin()
  if (!gate.ok) return guardResponse(gate)

  const body = await req.json()
  const { creator_id, infloww_creator_id, infloww_creator_name } = body

  if (!creator_id || !infloww_creator_id) {
    return NextResponse.json(
      { error: 'creator_id and infloww_creator_id are required' },
      { status: 400 }
    )
  }

  const supabase = createServerSupabaseClient()

  // Delete any existing mapping for this Supabase creator or Infloww ID
  await supabase
    .from('infloww_creator_map')
    .delete()
    .or(`creator_id.eq.${creator_id},infloww_creator_id.eq.${infloww_creator_id}`)

  const { data, error } = await supabase
    .from('infloww_creator_map')
    .insert({
      creator_id,
      infloww_creator_id,
      infloww_creator_name: infloww_creator_name || '',
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ mapping: data })
}

// DELETE: Remove a mapping
export async function DELETE(req: NextRequest) {
  const gate = await requireSuperAdmin()
  if (!gate.ok) return guardResponse(gate)

  const { searchParams } = new URL(req.url)
  const creatorId = searchParams.get('creator_id')

  if (!creatorId) {
    return NextResponse.json({ error: 'creator_id is required' }, { status: 400 })
  }

  const supabase = createServerSupabaseClient()

  const { error } = await supabase
    .from('infloww_creator_map')
    .delete()
    .eq('creator_id', creatorId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
