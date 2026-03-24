import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase'

// GET /api/admin/roles — list all roles with their creator access and permissions
export async function GET() {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!user.is_super_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const supabase = createServerSupabaseClient()

  try {
    // Fetch all roles
    const { data: roles, error: rolesError } = await supabase
      .from('admin_roles')
      .select('*')
      .order('name')

    if (rolesError) return NextResponse.json({ error: rolesError.message }, { status: 500 })

    // For each role, fetch creator access and permissions
    const rolesWithAccessAndPermissions = await Promise.all(
      (roles || []).map(async (role) => {
        // Fetch creator access (just creator_ids array)
        const { data: accessData } = await supabase
          .from('admin_creator_access')
          .select('creator_id')
          .eq('role_id', role.id)

        const creator_access = (accessData || []).map(a => a.creator_id)

        // Fetch permissions (array of {creator_id, permission_type})
        const { data: permData } = await supabase
          .from('admin_permissions')
          .select('creator_id, permission_type')
          .eq('role_id', role.id)

        const permissions = (permData || []).map(p => ({
          creator_id: p.creator_id,
          permission_type: p.permission_type,
        }))

        return {
          ...role,
          creator_access,
          permissions,
        }
      })
    )

    return NextResponse.json(rolesWithAccessAndPermissions)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

// POST /api/admin/roles — action-based operations
export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!user.is_super_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const supabase = createServerSupabaseClient()

  try {
    const body = await req.json()
    const { action } = body

    // ── create_role ──
    if (action === 'create_role') {
      const { name, description } = body

      if (!name) {
        return NextResponse.json({ error: 'name is required' }, { status: 400 })
      }

      const { data, error } = await supabase
        .from('admin_roles')
        .insert({
          name: name.trim(),
          description: description ? description.trim() : null,
        })
        .select()
        .single()

      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
      return NextResponse.json(data)
    }

    // ── update_role ──
    if (action === 'update_role') {
      const { role_id, name, description } = body

      if (!role_id) {
        return NextResponse.json({ error: 'role_id is required' }, { status: 400 })
      }

      const updates: any = {}
      if (name !== undefined) updates.name = name.trim()
      if (description !== undefined) updates.description = description ? description.trim() : null

      const { data, error } = await supabase
        .from('admin_roles')
        .update(updates)
        .eq('id', role_id)
        .select()
        .single()

      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
      return NextResponse.json(data)
    }

    // ── delete_role ──
    if (action === 'delete_role') {
      const { role_id } = body

      if (!role_id) {
        return NextResponse.json({ error: 'role_id is required' }, { status: 400 })
      }

      const { error } = await supabase.from('admin_roles').delete().eq('id', role_id)

      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
      return NextResponse.json({ ok: true })
    }

    // ── set_creator_access ──
    if (action === 'set_creator_access') {
      const { role_id, creator_ids } = body

      if (!role_id) {
        return NextResponse.json({ error: 'role_id is required' }, { status: 400 })
      }

      if (!Array.isArray(creator_ids)) {
        return NextResponse.json({ error: 'creator_ids must be an array' }, { status: 400 })
      }

      // Delete all existing access for this role
      const { error: deleteError } = await supabase
        .from('admin_creator_access')
        .delete()
        .eq('role_id', role_id)

      if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 400 })

      // Insert new access rows if creator_ids is not empty
      if (creator_ids.length > 0) {
        const accessRows = creator_ids.map(creator_id => ({
          role_id,
          creator_id,
        }))

        const { error: insertError } = await supabase
          .from('admin_creator_access')
          .insert(accessRows)

        if (insertError) return NextResponse.json({ error: insertError.message }, { status: 400 })
      }

      return NextResponse.json({ ok: true })
    }

    // ── set_permissions ──
    if (action === 'set_permissions') {
      const { role_id, permissions } = body

      if (!role_id) {
        return NextResponse.json({ error: 'role_id is required' }, { status: 400 })
      }

      if (!Array.isArray(permissions)) {
        return NextResponse.json({ error: 'permissions must be an array' }, { status: 400 })
      }

      // Delete all existing permissions for this role
      const { error: deleteError } = await supabase
        .from('admin_permissions')
        .delete()
        .eq('role_id', role_id)

      if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 400 })

      // Insert new permission rows
      const permissionRows: any[] = []
      for (const perm of permissions) {
        const { creator_id, types } = perm

        if (!Array.isArray(types)) {
          return NextResponse.json({ error: 'Each permission entry must have types as an array' }, { status: 400 })
        }

        for (const permissionType of types) {
          permissionRows.push({
            role_id,
            creator_id,
            permission_type: permissionType,
          })
        }
      }

      if (permissionRows.length > 0) {
        const { error: insertError } = await supabase
          .from('admin_permissions')
          .insert(permissionRows)

        if (insertError) return NextResponse.json({ error: insertError.message }, { status: 400 })
      }

      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
