import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { requireCreatorAccess, guardResponse } from '@/lib/auth'
import {
  getInflowwConfig, listTrackingLinks, resolveInflowwCreatorId,
  suggestAccountForLink, matchScore, InflowwError,
} from '@/lib/infloww'

// GET /api/admin/creators/:id/infloww-links[?username=handle]
//
// The creator's OF tracking links straight from Infloww, so adding an IG
// account can offer a real list instead of a free-text URL box. Each link says
// which of our accounts it looks like it belongs to and whether another
// tracking link already claims it.
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const gate = await requireCreatorAccess(params.id, 'view_conversions')
  if (!gate.ok) return guardResponse(gate)

  const supabase = createServerSupabaseClient()
  const username = (req.nextUrl.searchParams.get('username') || '').replace('@', '').trim()

  try {
    const cfg = await getInflowwConfig()
    const inflowwCreatorId = await resolveInflowwCreatorId(params.id, cfg)
    if (!inflowwCreatorId) {
      return NextResponse.json({
        links: [],
        unmapped: true,
        message: 'This creator is not matched to an Infloww account yet — set the OF handle or map them on the Creators page.',
      })
    }

    const [links, accountsRes, takenRes] = await Promise.all([
      listTrackingLinks(cfg, inflowwCreatorId),
      supabase.from('social_accounts').select('id, username').eq('creator_id', params.id).eq('is_active', true),
      supabase.from('tracking_links').select('id, label, infloww_link_id').eq('creator_id', params.id).not('infloww_link_id', 'is', null),
    ])

    const accounts = accountsRes.data || []
    const takenBy = new Map<string, { id: string; label: string }>()
    for (const t of takenRes.data || []) {
      if (t.infloww_link_id) takenBy.set(String(t.infloww_link_id), { id: t.id, label: t.label })
    }

    const enriched = links.map(l => {
      const suggestion = suggestAccountForLink(l.name, accounts)
      return {
        ...l,
        taken_by: takenBy.get(l.id) || null,
        suggested_account_id: suggestion?.account.id || null,
        suggested_username: suggestion?.account.username || null,
        // Exposed so a caller holding several links that point at the same
        // account can keep the strongest one.
        suggested_score: suggestion?.score || null,
        // When the caller is adding a specific handle, score against that too so
        // the picker can pre-select before the account row exists.
        score_for_username: username ? matchScore(l.name, username) : null,
      }
    })

    // Best candidate for the handle being added floats to the top.
    if (username) {
      enriched.sort((a, b) => (b.score_for_username || 0) - (a.score_for_username || 0))
    }

    return NextResponse.json({ links: enriched, unmapped: false })
  } catch (err) {
    const status = err instanceof InflowwError ? err.status : 500
    const message = err instanceof Error ? err.message : 'Failed to reach Infloww'
    return NextResponse.json({ error: message, links: [] }, { status })
  }
}
