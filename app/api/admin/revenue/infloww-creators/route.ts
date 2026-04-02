import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase'

function isAdmin() {
  const cookieStore = cookies()
  return cookieStore.get('admin_auth')?.value === 'true'
}

const INFLOWW_BASE = 'https://openapi.infloww.com'

// GET: Fetch creators list directly from Infloww API
export async function GET() {
  if (!isAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServerSupabaseClient()

  const { data: config } = await supabase
    .from('infloww_config')
    .select('api_key, agency_oid')
    .limit(1)
    .single()

  if (!config?.api_key || !config?.agency_oid) {
    return NextResponse.json(
      { error: 'Infloww API not configured. Set your API key in Settings first.' },
      { status: 400 }
    )
  }

  const headers = {
    Accept: 'application/json',
    Authorization: config.api_key,
    'x-oid': config.agency_oid,
  }

  try {
    const allCreators: unknown[] = []
    let hasMore = true
    const params = new URLSearchParams({ platformCode: 'OnlyFans', limit: '100' })

    while (hasMore) {
      const url = `${INFLOWW_BASE}/v1/creators?${params.toString()}`
      const response = await fetch(url, { headers, cache: 'no-store' })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(`Infloww API error (${response.status}): ${err.errorMessage || response.statusText}`)
      }

      const body = await response.json()
      const items = body?.data?.list || []
      allCreators.push(...items)

      hasMore = body?.hasMore === true
      const cursor = body?.cursor
      if (hasMore && cursor) {
        params.set('cursor', cursor)
      } else {
        break
      }
    }

    return NextResponse.json({ creators: allCreators })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
