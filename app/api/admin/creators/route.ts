import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { requireUser, requireSuperAdmin, guardResponse, getUserPermissions } from '@/lib/auth'

// GET /api/admin/creators — list creators (scoped to what the user may see)
export async function GET() {
  const gate = await requireUser()
  if (!gate.ok) return guardResponse(gate)

  const supabase = createServerSupabaseClient()
  let query = supabase
    .from('creators')
    .select('id, display_name, slug, avatar_url, is_active')
    .order('display_name')

  // Non-super-admins only see creators they've been granted access to.
  if (!gate.user.is_super_admin) {
    const perms = await getUserPermissions(gate.user.id)
    if (!perms.grantAllCreators) {
      if (perms.visibleCreatorIds.length === 0) return NextResponse.json([])
      query = query.in('id', perms.visibleCreatorIds)
    }
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data || [])
}

// POST /api/admin/creators — create a creator (super-admin only)
export async function POST(req: NextRequest) {
  const gate = await requireSuperAdmin()
  if (!gate.ok) return guardResponse(gate)
  const body = await req.json()
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.from('creators').insert(body).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}
