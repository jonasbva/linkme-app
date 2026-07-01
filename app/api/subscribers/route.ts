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
 * Returns the raw conversion working set (creators, accounts, expectations, daily
 * rows). All aggregation — totals, streaks, missing-data — is done client-side in
 * the MCP server, so tools can evolve without redeploying the app.
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

  const [creatorsRes, accountsRes, expsRes] = await Promise.all([
    supabase.from('creators').select('id, display_name, slug, of_handle, is_active'),
    supabase.from('conversion_accounts').select('id, creator_id, handle, display_label, is_active'),
    supabase.from('conversion_expectations').select('conversion_account_id, creator_id, daily_sub_target'),
  ])

  const metaErr = creatorsRes.error || accountsRes.error || expsRes.error
  if (metaErr) return NextResponse.json({ error: metaErr.message }, { status: 500 })

  // Supabase caps a single response at 1000 rows — page through.
  const daily: Array<Record<string, unknown>> = []
  const PAGE = 1000
  let offset = 0
  // eslint-disable-next-line no-constant-condition
  while (true) {
    let q = supabase
      .from('conversion_daily')
      .select('conversion_account_id, creator_id, date, new_subs')
      .not('conversion_account_id', 'is', null)
      .order('date', { ascending: true })
    if (!all) q = q.gte('date', from).lte('date', to)
    const { data, error } = await q.range(offset, offset + PAGE - 1)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    daily.push(...(data || []))
    if (!data || data.length < PAGE) break
    offset += PAGE
  }

  return NextResponse.json({
    generated_at: new Date().toISOString(),
    range: all ? { from: null, to: null } : { from, to },
    creators: creatorsRes.data || [],
    accounts: accountsRes.data || [],
    expectations: expsRes.data || [],
    daily,
  })
}
