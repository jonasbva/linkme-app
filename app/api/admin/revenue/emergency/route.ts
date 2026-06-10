import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { requireUser, guardResponse } from '@/lib/auth'

// GET: Fetch all emergency statuses
export async function GET() {
  const gate = await requireUser()
  if (!gate.ok) return guardResponse(gate)

  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('revenue_emergency_status')
    .select('*')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ emergencies: data || [] })
}

// POST: Set or update emergency status for a creator
export async function POST(req: NextRequest) {
  const gate = await requireUser()
  if (!gate.ok) return guardResponse(gate)

  const body = await req.json()
  const { creator_id, emergency_since, notes } = body

  if (!creator_id) {
    return NextResponse.json({ error: 'creator_id is required' }, { status: 400 })
  }

  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from('revenue_emergency_status')
    .upsert(
      {
        creator_id,
        emergency_since: emergency_since || null,
        notes: notes || '',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'creator_id' }
    )
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ emergency: data })
}
