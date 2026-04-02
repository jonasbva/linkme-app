import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase'

function isAdmin() {
  const cookieStore = cookies()
  return cookieStore.get('admin_auth')?.value === 'true'
}

// GET — read from cache (instant, no Infloww API calls)
export async function GET(req: NextRequest) {
  if (!isAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const key = searchParams.get('key') || 'today'

  const supabase = createServerSupabaseClient()
  const { data } = await supabase
    .from('revenue_cache')
    .select('data, fetched_at')
    .eq('cache_key', key)
    .single()

  if (!data) {
    return NextResponse.json({ error: 'No cached data. Click refresh to fetch.', totals: null, fetchedAt: null })
  }

  return NextResponse.json({
    ...data.data,
    fetchedAt: data.fetched_at,
  })
}

// POST — trigger a manual cache refresh (calls the cron endpoint internally)
export async function POST(req: NextRequest) {
  if (!isAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Call the cron endpoint directly via internal fetch
  const baseUrl = req.nextUrl.origin
  const cronSecret = process.env.CRON_SECRET || ''

  const res = await fetch(`${baseUrl}/api/cron/revenue-cache`, {
    headers: {
      Authorization: `Bearer ${cronSecret}`,
    },
  })

  const result = await res.json()

  if (!res.ok) {
    return NextResponse.json({ error: result.error || 'Failed to refresh' }, { status: 500 })
  }

  return NextResponse.json(result)
}
