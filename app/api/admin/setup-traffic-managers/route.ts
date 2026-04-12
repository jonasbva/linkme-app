import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { hashPassword, getSessionUser } from '@/lib/auth'

// ONE-TIME SETUP: Create Traffic Manager role and assign creators to users
// DELETE THIS FILE AFTER RUNNING
export async function POST() {
  const user = await getSessionUser()
  if (!user?.is_super_admin) return NextResponse.json({ error: 'Super admin only' }, { status: 403 })

  const supabase = createServerSupabaseClient()
  const results: string[] = []

  try {
    // 1. Create Traffic Manager role
    const { data: role, error: roleError } = await supabase
      .from('admin_roles')
      .insert({
        name: 'Traffic Manager',
        description: 'View social media & conversions, manage Instagram accounts. No settings access.',
        grant_all_creators: true,
        all_creators_permissions: ['view_social', 'view_conversions', 'edit_social', 'input_conversions'],
      })
      .select()
      .single()

    if (roleError) {
      results.push(`Role creation error: ${roleError.message}`)
      // Try to fetch existing role
      const { data: existingRole } = await supabase
        .from('admin_roles')
        .select('id')
        .eq('name', 'Traffic Manager')
        .single()
      if (!existingRole) return NextResponse.json({ error: 'Failed to create or find role', results }, { status: 500 })
      results.push(`Using existing Traffic Manager role: ${existingRole.id}`)
    } else {
      results.push(`Created Traffic Manager role: ${role.id}`)
    }

    const roleId = role?.id || (await supabase.from('admin_roles').select('id').eq('name', 'Traffic Manager').single()).data?.id

    // 2. Get all creators (to find IDs by name)
    const { data: allCreators } = await supabase
      .from('creators')
      .select('id, display_name, slug')

    if (!allCreators || allCreators.length === 0) {
      return NextResponse.json({ error: 'No creators found', results }, { status: 500 })
    }

    function findCreator(name: string) {
      const lowerName = name.toLowerCase()
      return allCreators!.find(c =>
        c.display_name.toLowerCase() === lowerName ||
        c.slug.toLowerCase() === lowerName ||
        c.display_name.toLowerCase().includes(lowerName) ||
        c.slug.toLowerCase().includes(lowerName)
      )
    }

    // 3. Define user assignments
    const userSetups = [
      {
        display_name: 'Jano',
        email: 'jano.lampe18@gmail.com',
        password: '12Jano34!',
        creators: ['Elena', 'Mary', 'Skye', 'Alina', 'Sophie', 'Mila', 'Chloe'],
      },
      {
        display_name: 'Tom',
        email: 'tomrichter52@gmail.com',
        password: '45Tom33?',
        creators: ['Hailey', 'Daisy', 'Mia', 'Emma'],
      },
      {
        display_name: 'Felix',
        email: 'researchman187@gmail.com',
        password: 'Felix12!3',
        creators: ['Amber', 'Daisy', 'Sophia', 'Mila', 'Alice', 'Anna'],
      },
      {
        display_name: 'Luka',
        email: 'markanovic141@gmail.com',
        password: '23Luka32!',
        creators: ['Celine', 'Jessy', 'Alice'],
      },
    ]

    for (const setup of userSetups) {
      // Find or get user
      const { data: existingUser } = await supabase
        .from('admin_users')
        .select('id')
        .eq('email', setup.email)
        .single()

      let userId: string

      if (existingUser) {
        // Update password
        const password_hash = await hashPassword(setup.password)
        await supabase.from('admin_users').update({ password_hash }).eq('id', existingUser.id)
        userId = existingUser.id
        results.push(`Updated password for ${setup.display_name} (${setup.email})`)
      } else {
        // Create user
        const password_hash = await hashPassword(setup.password)
        const { data: newUser, error: userError } = await supabase
          .from('admin_users')
          .insert({
            email: setup.email,
            display_name: setup.display_name,
            password_hash,
            is_active: true,
            is_super_admin: false,
          })
          .select()
          .single()

        if (userError) {
          results.push(`Failed to create ${setup.display_name}: ${userError.message}`)
          continue
        }
        userId = newUser.id
        results.push(`Created user ${setup.display_name}`)
      }

      // Assign Traffic Manager role
      if (roleId) {
        await supabase.from('admin_user_roles').delete().eq('user_id', userId)
        const { error: roleAssignErr } = await supabase
          .from('admin_user_roles')
          .insert({ user_id: userId, role_id: roleId })
        if (roleAssignErr) {
          results.push(`  Role assign error for ${setup.display_name}: ${roleAssignErr.message}`)
        } else {
          results.push(`  Assigned Traffic Manager role to ${setup.display_name}`)
        }
      }

      // Assign creators
      const creatorIds: string[] = []
      const notFound: string[] = []
      for (const creatorName of setup.creators) {
        const found = findCreator(creatorName)
        if (found) {
          creatorIds.push(found.id)
        } else {
          notFound.push(creatorName)
        }
      }

      if (notFound.length > 0) {
        results.push(`  ⚠ Creators not found for ${setup.display_name}: ${notFound.join(', ')}`)
      }

      // Clear existing creator access and set new ones
      await supabase.from('admin_creator_access').delete().eq('user_id', userId)
      if (creatorIds.length > 0) {
        const { error: accessError } = await supabase
          .from('admin_creator_access')
          .insert(creatorIds.map(creator_id => ({ user_id: userId, creator_id })))
        if (accessError) {
          results.push(`  Creator access error for ${setup.display_name}: ${accessError.message}`)
        } else {
          results.push(`  Assigned ${creatorIds.length} creators to ${setup.display_name}`)
        }
      }
    }

    results.push('', 'Available creators for reference:')
    allCreators.forEach(c => results.push(`  ${c.display_name} (@${c.slug})`))

    return NextResponse.json({ ok: true, results })
  } catch (err: any) {
    return NextResponse.json({ error: err.message, results }, { status: 500 })
  }
}
