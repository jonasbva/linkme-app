import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

// Called by middleware to resolve a custom domain → creator slug
export async function GET(req: NextRequest) {
  const domain = req.nextUrl.searchParams.get('domain')
  if (!domain) return NextResponse.json({ slug: null })

  const supabase = createServerSupabaseClient()
  const { data } = await supabase
    .from('creators')
    .select('slug')
    .eq('custom_domain', domain)
    .eq('is_active', true)
    .single()

  return NextResponse.json({ slug: data?.slug || null })
}
