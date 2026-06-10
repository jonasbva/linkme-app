import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { requireCreatorAccess, guardResponse } from '@/lib/auth'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const gate = await requireCreatorAccess(params.id, 'edit_links')
  if (!gate.ok) return guardResponse(gate)
  const body = await req.json()
  const supabase = createServerSupabaseClient()
  // Force creator_id to the route's creator so a payload can't reassign the link.
  const { id, creator_id, ...rest } = body
  const { data, error } = await supabase
    .from('links')
    .insert({ ...rest, creator_id: params.id })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}
