import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { getSessionUser } from '@/lib/auth'

// PATCH: toggle linkme_enabled on a creator
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!user.is_super_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  if (typeof body.linkme_enabled !== 'boolean') {
    return NextResponse.json({ error: 'linkme_enabled (boolean) is required' }, { status: 400 })
  }

  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('creators')
    .update({ linkme_enabled: body.linkme_enabled })
    .eq('id', params.id)
    .select('id, linkme_enabled')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ creator: data })
}
