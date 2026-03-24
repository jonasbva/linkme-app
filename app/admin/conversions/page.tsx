import { Suspense } from 'react'
import { createServerSupabaseClient } from '@/lib/supabase'
import ConversionsClient from '@/components/admin/ConversionsClient'

export default async function ConversionsPage() {
  const supabase = createServerSupabaseClient()

  const [creatorsRes, expectationsRes, dailyRes] = await Promise.all([
    supabase.from('creators').select('id, slug, display_name, avatar_url, is_active').order('display_name'),
    supabase.from('conversion_expectations').select('*'),
    supabase
      .from('conversion_daily')
      .select('*')
      .gte('date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('date', { ascending: false }),
  ])

  return (
    <Suspense fallback={<div className="text-white/20 text-[13px] py-12 text-center">Loading...</div>}>
      <ConversionsClient
        creators={creatorsRes.data || []}
        expectations={expectationsRes.data || []}
        dailyData={dailyRes.data || []}
      />
    </Suspense>
  )
}
