import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { requireUser, requireSuperAdmin, guardResponse, getUserPermissions } from '@/lib/auth'
import { parseNewCreator } from '@/lib/creator-input'

// GET /api/admin/creators — list creators (scoped to what the user may see)
//
// Archived creators are left out by default. Archiving is how a creator leaves
// the agency, so they should not keep appearing in the sidebar picker or in the
// access lists. Pass ?include_archived=1 for a view that genuinely needs them.
export async function GET(req: NextRequest) {
  const gate = await requireUser()
  if (!gate.ok) return guardResponse(gate)

  const includeArchived = req.nextUrl.searchParams.get('include_archived') === '1'

  const supabase = createServerSupabaseClient()
  let query = supabase
    .from('creators')
    .select('id, display_name, slug, avatar_url, is_active')
    .order('display_name')

  if (!includeArchived) query = query.eq('is_active', true)

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
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Could not read the creator details. Please try again.' }, { status: 400 })
  }
  const parsed = parseNewCreator(body)
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.from('creators').insert(parsed.data).select().single()
  if (error?.code === '23505') {
    return NextResponse.json({ error: 'A creator with this name or OnlyFans handle already exists. Open their existing profile, or use a different name or handle.' }, { status: 409 })
  }
  if (error) {
    console.error('[creators.create] Save failed:', error.code)
    return NextResponse.json({ error: 'Could not save the creator. Please try again. If this continues, contact an administrator.' }, { status: 500 })
  }
  return NextResponse.json(data)
}
