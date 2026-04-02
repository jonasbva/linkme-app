import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase'

function isAdmin() {
  const cookieStore = cookies()
  return cookieStore.get('admin_auth')?.value === 'true'
}

// GET: Fetch all emergency statuses
export async function GET() {
  if (!isAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

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
  if (!isAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

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
