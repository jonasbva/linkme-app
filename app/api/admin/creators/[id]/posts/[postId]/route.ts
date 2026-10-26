import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { requireCreatorAccess, guardResponse } from '@/lib/auth'

type Params = { params: { id: string; postId: string } }

// PATCH /api/admin/creators/:id/posts/:postId — currently just the Trial flag
export async function PATCH(req: NextRequest, { params }: Params) {
  const gate = await requireCreatorAccess(params.id, 'edit_social')
  if (!gate.ok) return guardResponse(gate)

  const body = await req.json()
  if (typeof body.is_trial !== 'boolean') {
    return NextResponse.json({ error: 'is_trial must be a boolean' }, { status: 400 })
  }

  const supabase = createServerSupabaseClient()

  // The post must sit on one of this creator's social accounts.
  const { data: post } = await supabase
    .from('social_posts')
    .select('id, social_account_id')
    .eq('id', params.postId)
    .maybeSingle()
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: account } = await supabase
    .from('social_accounts')
    .select('id')
    .eq('id', post.social_account_id)
    .eq('creator_id', params.id)
    .maybeSingle()
  if (!account) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data, error } = await supabase
    .from('social_posts')
    .update({ is_trial: body.is_trial })
    .eq('id', params.postId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
