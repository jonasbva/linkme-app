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
        <h1 className="text-2xl font-semibold">All Creators</h1>
        <Link
          href="/admin/creators/new"
          className="px-4 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-white/90 transition"
        >
          + Add Creator
        </Link>
      </div>

      <div className="grid gap-4">
        {(creators || []).map(creator => (
          <div key={creator.id} className="bg-[#111] rounded-2xl p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {creator.avatar_url ? (
                <img src={creator.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-[#2a2a2a] flex items-center justify-center text-lg font-bold text-white/40">
                  {creator.display_name.charAt(0)}
                </div>
              )}
              <div>
                <p className="font-medium text-white">{creator.display_name}</p>
                <p className="text-sm text-white/40">/{creator.slug}</p>
                {creator.custom_domain && (
                  <p className="text-xs text-blue-400 mt-0.5">{creator.custom_domain}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-2 py-1 text-xs rounded-full ${creator.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {creator.is_active ? 'Active' : 'Inactive'}
              </span>
              <Link
                href={`/admin/creators/${creator.id}`}
                className="px-3 py-1.5 bg-white/10 text-white text-xs rounded-lg hover:bg-white/20 transition"
              >
                Edit
              </Link>
              <Link
                href={`/${creator.slug}`}
                target="_blank"
                className="px-3 py-1.5 bg-white/10 text-white text-xs rounded-lg hover:bg-white/20 transition"
              >
                View
              </Link>
            </div>
          </div>
        ))}
        {(!creators || creators.length === 0) && (
          <div className="bg-[#111] rounded-2xl p-10 text-center text-white/30">
            No creators yet. Add your first creator!
          </div>
        )}
      </div>
    </div>
  )
}
