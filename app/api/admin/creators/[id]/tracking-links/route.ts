import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { requireCreatorAccess, guardResponse } from '@/lib/auth'

// GET /api/admin/creators/:id/tracking-links — the creator's IG bio links
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const gate = await requireCreatorAccess(params.id, 'view_conversions')
  if (!gate.ok) return guardResponse(gate)

  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('tracking_links')
    .select('*')
    .eq('creator_id', params.id)
    .order('sort_order')
    .order('label')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/admin/creators/:id/tracking-links — add a link
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const gate = await requireCreatorAccess(params.id, 'input_conversions')
  if (!gate.ok) return guardResponse(gate)

  const body = await req.json()
  const label = (body.label || '').trim()
  if (!label) return NextResponse.json({ error: 'label is required' }, { status: 400 })

  const inflowwLinkId = body.infloww_link_id ? String(body.infloww_link_id) : null

  const supabase = createServerSupabaseClient()

  // A social account, when given, must belong to this creator.
  if (body.social_account_id) {
    const { data: acc } = await supabase
      .from('social_accounts')
      .select('id')
      .eq('id', body.social_account_id)
      .eq('creator_id', params.id)
      .maybeSingle()
    if (!acc) return NextResponse.json({ error: 'Social account not found for this creator' }, { status: 400 })
  }

  // An Infloww link belongs to one tracking link only.
  if (inflowwLinkId) {
    const { data: taken } = await supabase
      .from('tracking_links')
      .select('id, label')
      .eq('infloww_link_id', inflowwLinkId)
      .maybeSingle()
    if (taken) {
      return NextResponse.json(
        { error: `That Infloww link is already connected to "${taken.label}"` },
        { status: 409 },
      )
    }
  }

  const { count } = await supabase
    .from('tracking_links')
    .select('id', { count: 'exact', head: true })
    .eq('creator_id', params.id)

  const { data, error } = await supabase
    .from('tracking_links')
    .insert({
      creator_id: params.id,
      social_account_id: body.social_account_id || null,
      label,
      url: (body.url || '').trim() || null,
      infloww_link_id: inflowwLinkId,
      infloww_link_name: body.infloww_link_name || null,
      infloww_code: body.infloww_code || null,
      infloww_synced_at: inflowwLinkId ? new Date().toISOString() : null,
      sort_order: count ?? 0,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
