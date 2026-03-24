import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { hashPassword, getSessionUser } from '@/lib/auth'

// GET /api/admin/team — list all admin users with roles
export async function GET() {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServerSupabaseClient()

  // Get all admin users
  const { data: users, error: usersError } = await supabase
    .from('admin_users')
    .select('id, email, display_name, is_super_admin, is_active, created_at')
    .order('created_at', { ascending: true })

  if (usersError) return NextResponse.json({ error: usersError.message }, { status: 500 })

  // For each user, fetch their roles
  const usersWithRoles = await Promise.all(
    (users || []).map(async user => {
      const { data: userRoles, error: rolesError } = await supabase
        .from('admin_user_roles')
        .select('role_id')
        .eq('user_id', user.id)

      if (rolesError) {
        return { ...user, roles: [] }
      }

      // Fetch role details for each role_id
      const roleIds = (userRoles || []).map(ur => ur.role_id)
      let roles: any[] = []

      if (roleIds.length > 0) {
        const { data: roleDetails } = await supabase
          .from('admin_roles')
          .select('id, name')
          .in('id', roleIds)

        roles = roleDetails || []
      }

      return { ...user, roles }
    })
  )

  return NextResponse.json(usersWithRoles)
}

// POST /api/admin/team — action-based operations on admin users
export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServerSupabaseClient()
  const body = await req.json()

  // ── create_user ──
  if (body.action === 'create_user') {
    const { email, display_name, password } = body

    if (!email || !display_name || !password) {
      return NextResponse.json({ error: 'Missing required fields: email, display_name, password' }, { status: 400 })
    }

    const password_hash = await hashPassword(password)

    const { data, error } = await supabase
      .from('admin_users')
      .insert({
        email: email.toLowerCase().trim(),
        display_name,
        password_hash,
        is_active: true,
        is_super_admin: false,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data)
  }

  // ── update_user ──
  if (body.action === 'update_user') {
    const { user_id, display_name, email, is_active, password } = body

    if (!user_id) {
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 })
    }

    const updates: any = {}
    if (display_name !== undefined) updates.display_name = display_name
    if (email !== undefined) updates.email = email.toLowerCase().trim()
    if (is_active !== undefined) updates.is_active = is_active
    if (password !== undefined) {
      updates.password_hash = await hashPassword(password)
    }

    const { data, error } = await supabase
      .from('admin_users')
      .update(updates)
      .eq('id', user_id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data)
  }

  // ── delete_user ──
  if (body.action === 'delete_user') {
    const { user_id } = body

    if (!user_id) {
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 })
    }

    const { error } = await supabase.from('admin_users').delete().eq('id', user_id)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true })
  }

  // ── set_roles ──
  if (body.action === 'set_roles') {
    const { user_id, role_ids } = body

    if (!user_id || !Array.isArray(role_ids)) {
      return NextResponse.json({ error: 'Missing user_id or role_ids (must be array)' }, { status: 400 })
    }

    // Delete all existing roles for user
    const { error: deleteError } = await supabase
      .from('admin_user_roles')
      .delete()
      .eq('user_id', user_id)

    if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 400 })

    // Insert new roles
    if (role_ids.length > 0) {
      const { error: insertError } = await supabase
        .from('admin_user_roles')
        .insert(role_ids.map(role_id => ({ user_id, role_id })))

      if (insertError) return NextResponse.json({ error: insertError.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  }

  // ── set_creator_access ──
  if (body.action === 'set_creator_access') {
    const { user_id, creator_ids } = body

    if (!user_id || !Array.isArray(creator_ids)) {
      return NextResponse.json({ error: 'Missing user_id or creator_ids (must be array)' }, { status: 400 })
    }

    // Delete all existing creator access for user
    const { error: deleteError } = await supabase
      .from('admin_creator_access')
      .delete()
      .eq('user_id', user_id)

    if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 400 })

    // Insert new creator access
    if (creator_ids.length > 0) {
      const { error: insertError } = await supabase
        .from('admin_creator_access')
        .insert(creator_ids.map(creator_id => ({ user_id, creator_id })))

      if (insertError) return NextResponse.json({ error: insertError.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  }

  // ── set_permissions ──
  if (body.action === 'set_permissions') {
    const { user_id, permissions } = body

    if (!user_id || !Array.isArray(permissions)) {
      return NextResponse.json({ error: 'Missing user_id or permissions (must be array)' }, { status: 400 })
    }

    // Delete all existing permissions for user
    const { error: deleteError } = await supabase
      .from('admin_permissions')
      .delete()
      .eq('user_id', user_id)

    if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 400 })

    // Insert new permissions
    const permissionRows = permissions.flatMap(p => {
      const { creator_id, types } = p
      if (!creator_id || !Array.isArray(types)) return []
      return types.map(permission_type => ({ user_id, creator_id, permission_type }))
    })

    if (permissionRows.length > 0) {
      const { error: insertError } = await supabase
        .from('admin_permissions')
        .insert(permissionRows)

      if (insertError) return NextResponse.json({ error: insertError.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
