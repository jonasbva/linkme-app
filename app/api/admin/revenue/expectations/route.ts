import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase'

function isAdmin() {
  const cookieStore = cookies()
  return cookieStore.get('admin_auth')?.value === 'true'
}

// GET: Fetch all revenue expectations (joined with creator names)
export async function GET() {
  if (!isAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServerSupabaseClient()

  // Get all creators
  const { data: creators, error: creatorsError } = await supabase
    .from('creators')
    .select('id, display_name, slug, avatar_url')
    .eq('is_active', true)
    .order('display_name')

  if (creatorsError) {
    return NextResponse.json({ error: creatorsError.message }, { status: 500 })
  }

  // Get all expectations
  const { data: expectations, error: expError } = await supabase
    .from('revenue_expectations')
    .select('*')

  if (expError) {
    return NextResponse.json({ error: expError.message }, { status: 500 })
  }

  // Merge creators with their expectations
  const expMap = new Map(expectations?.map(e => [e.creator_id, e]) || [])
  const merged = creators?.map(c => ({
    ...c,
    expectation: expMap.get(c.id) || null,
  })) || []

  return NextResponse.json({ creators: merged })
}

// POST: Create or update a revenue expectation
export async function POST(req: NextRequest) {
  if (!isAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { creator_id, daily_revenue_target, revenue_per_fan_baseline, check_frequency, free_subs } = body

  if (!creator_id) {
    return NextResponse.json({ error: 'creator_id is required' }, { status: 400 })
  }

  const supabase = createServerSupabaseClient()

  // Upsert: insert or update if creator_id already exists
  const { data, error } = await supabase
    .from('revenue_expectations')
    .upsert(
      {
        creator_id,
        daily_revenue_target: daily_revenue_target || 0,
        revenue_per_fan_baseline: revenue_per_fan_baseline || 0,
        check_frequency: check_frequency || 1,
        free_subs: free_subs || false,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'creator_id' }
    )
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ expectation: data })
}
