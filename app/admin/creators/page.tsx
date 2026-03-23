import { createServerSupabaseClient } from '@/lib/supabase'
import Link from 'next/link'

export default async function CreatorsPage() {
  const supabase = createServerSupabaseClient()
  const { data: creators } = await supabase
    .from('creators')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Creators</h1>
        <Link
          href="/admin/creators/new"
          className="px-4 py-1.5 bg-white text-black text-[12px] font-medium rounded-lg hover:bg-white/90 transition-colors"
        >
          Add creator
        </Link>
      </div>

      <div className="space-y-2">
        {(creators || []).map(creator => (
          <div
            key={creator.id}
            className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]"
          >
            <div className="flex items-center gap-3">
              {creator.avatar_url ? (
                <img src={creator.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-white/[0.04] flex items-center justify-center text-[13px] font-medium text-white/25">
                  {creator.display_name.charAt(0)}
                </div>
              )}
              <div>
                <p className="text-[14px] font-medium text-white/90">{creator.display_name}</p>
                <p className="text-[12px] text-white/25">/{creator.slug}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 text-[11px] rounded-full ${
                creator.is_active ? 'bg-white/[0.04] text-white/40' : 'bg-red-500/10 text-red-400/60'
              }`}>
                {creator.is_active ? 'Active' : 'Inactive'}
              </span>
              <Link
                href={`/admin/creators/${creator.id}/edit`}
                className="px-3 py-1 text-[12px] text-white/30 border border-white/[0.06] rounded-lg hover:bg-white/[0.03] transition-colors"
              >
                Edit
              </Link>
              <Link
                href={`/admin/creators/${creator.id}/links`}
                className="px-3 py-1 text-[12px] text-white/30 border border-white/[0.06] rounded-lg hover:bg-white/[0.03] transition-colors"
              >
                Links
              </Link>
              <Link
                href={`/admin/creators/${creator.id}/analysis`}
                className="px-3 py-1 text-[12px] text-white/30 border border-white/[0.06] rounded-lg hover:bg-white/[0.03] transition-colors"
              >
                Analysis
              </Link>
              <Link
                href={creator.custom_domain ? `https://${creator.custom_domain}` : `/${creator.slug}`}
                target="_blank"
                className="px-3 py-1 text-[12px] text-white/30 border border-white/[0.06] rounded-lg hover:bg-white/[0.03] transition-colors"
              >
                Preview ↗
              </Link>
            </div>
          </div>
        ))}
        {(!creators || creators.length === 0) && (
          <div className="text-center py-12 text-white/20 text-[13px]">
            No creators yet
          </div>
        )}
      </div>
    </div>
  )
}
