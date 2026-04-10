import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase'

function isAdmin() {
  const cookieStore = cookies()
  return cookieStore.get('admin_auth')?.value === 'true'
}

// GET: Fetch Infloww config
export async function GET() {
  if (!isAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('infloww_config')
    .select('*')
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Mask the API key for display (show last 8 chars only)
  if (data && data.api_key) {
    const key = data.api_key
    data.api_key_masked = key.length > 8
      ? '•'.repeat(key.length - 8) + key.slice(-8)
      : key
  }

  return NextResponse.json({ config: data || null })
}

// PUT: Update Infloww config
export async function PUT(req: NextRequest) {
  if (!isAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { api_key, agency_oid, refund_threshold_dollars, fetching_enabled } = body

  const supabase = createServerSupabaseClient()

  // Check if config exists
  const { data: existing } = await supabase
    .from('infloww_config')
    .select('id')
    .limit(1)
    .single()

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (api_key !== undefined) {
    updates.api_key = api_key
    updates.api_key_updated_at = new Date().toISOString()
  }
  if (agency_oid !== undefined) updates.agency_oid = agency_oid
  if (refund_threshold_dollars !== undefined) updates.refund_threshold_dollars = refund_threshold_dollars
  if (fetching_enabled !== undefined) updates.fetching_enabled = fetching_enabled

  let result
  if (existing) {
    result = await supabase
      .from('infloww_config')
      .update(updates)
      .eq('id', existing.id)
      .select()
      .single()
  } else {
    result = await supabase
      .from('infloww_config')
      .insert({
        api_key: api_key || '',
        agency_oid: agency_oid || '',
        refund_threshold_dollars: refund_threshold_dollars || 20,
        api_key_updated_at: new Date().toISOString(),
      })
      .select()
      .single()
  }

  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 500 })
  }

  return NextResponse.json({ config: result.data })
}
