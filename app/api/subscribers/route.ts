import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { verifySubscriberToken } from '@/lib/auth'

/**
 * Read-only subscriber dataset for the subscriber MCP server.
 *
 * Auth:  Authorization: Bearer <SUBSCRIBER_MCP_TOKEN>   (fails closed)
 * Query: ?from=YYYY-MM-DD&to=YYYY-MM-DD   (defaults: last 180 days)
 *        ?all=1                            (ignore the window, return every daily row)
 *
 * Subscribers now live on the creator layer — one row per creator per day — but
 * the MCP server still speaks the older per-account shape. Rather than redeploy
 * it, we project each creator as a single account whose id IS the creator id, so
 * `conversion_account_id === creator_id` throughout. Aggregation stays in the MCP.
 */

export const dynamic = 'force-dynamic'

function ymd(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export async function GET(req: NextRequest) {
  if (!verifySubscriberToken(req)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const supabase = createServerSupabaseClient()
  const { searchParams } = new URL(req.url)

  const all = searchParams.get('all') === '1'
  const defFrom = new Date()
  defFrom.setDate(defFrom.getDate() - 180)
  const from = (searchParams.get('from') || ymd(defFrom)).slice(0, 10)
  const to = (searchParams.get('to') || ymd(new Date())).slice(0, 10)

  const [creatorsRes, expsRes] = await Promise.all([
    supabase.from('creators').select('id, display_name, slug, of_handle, is_active'),
    supabase.from('creator_expectations').select('creator_id, daily_sub_target'),
  ])

  const metaErr = creatorsRes.error || expsRes.error
  if (metaErr) return NextResponse.json({ error: metaErr.message }, { status: 500 })

  const creators = creatorsRes.data || []

  // One synthetic account per creator, keyed by the creator id.
  const accounts = creators.map(c => ({
    id: c.id,
    creator_id: c.id,
    handle: c.of_handle || c.slug,
    display_label: null,
    is_active: c.is_active,
  }))

  const expectations = (expsRes.data || []).map(e => ({
    conversion_account_id: e.creator_id,
    creator_id: e.creator_id,
    daily_sub_target: e.daily_sub_target,
  }))

  // Supabase caps a single response at 1000 rows — page through.
  const daily: Array<Record<string, unknown>> = []
  const PAGE = 1000
  let offset = 0
  // eslint-disable-next-line no-constant-condition
  while (true) {
    let q = supabase
      .from('creator_daily')
      .select('creator_id, date, new_subs')
      .order('date', { ascending: true })
    if (!all) q = q.gte('date', from).lte('date', to)
    const { data, error } = await q.range(offset, offset + PAGE - 1)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    daily.push(
      ...(data || []).map(r => ({
        conversion_account_id: r.creator_id,
        creator_id: r.creator_id,
        date: r.date,
        new_subs: r.new_subs,
      })),
    )
    if (!data || data.length < PAGE) break
    offset += PAGE
  }

  return NextResponse.json({
    generated_at: new Date().toISOString(),
    range: all ? { from: null, to: null } : { from, to },
    creators,
    accounts,
    expectations,
    daily,
  })
}
