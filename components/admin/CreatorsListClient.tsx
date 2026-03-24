'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Tag {
  id: string
  name: string
  color: string
}

interface Creator {
  id: string
  slug: string
  display_name: string
  avatar_url?: string
  is_active: boolean
  custom_domain?: string
  tagIds: string[]
}

interface Props {
  creators: Creator[]
  tags: Tag[]
}

export default function CreatorsListClient({ creators: initial, tags }: Props) {
  const router = useRouter()
  const [creators, setCreators] = useState(initial)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [filterTag, setFilterTag] = useState<string>('all')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    let list = creators
    if (filterTag !== 'all') {
      list = list.filter(c => c.tagIds.includes(filterTag))
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(c =>
        c.display_name.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q)
      )
    }
    return list
  }, [creators, filterTag, search])

  async function deleteCreator(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This removes all their links, clicks, and data permanently.`)) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/admin/creators/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setCreators(prev => prev.filter(c => c.id !== id))
      }
    } finally {
      setDeleting(null)
    }
  }

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

      {/* Filter bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Search creators..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-1.5 text-[13px] text-white/80 placeholder-white/25 outline-none focus:border-white/20 w-48"
        />
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setFilterTag('all')}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
              filterTag === 'all'
                ? 'bg-white/[0.12] text-white/80'
                : 'bg-white/[0.04] text-white/30 hover:text-white/50'
            }`}
          >
            All
          </button>
          {tags.map(tag => (
            <button
              key={tag.id}
              onClick={() => setFilterTag(filterTag === tag.id ? 'all' : tag.id)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors border ${
                filterTag === tag.id ? 'border-current' : 'border-transparent'
              }`}
              style={{
                color: tag.color,
                backgroundColor: filterTag === tag.id ? tag.color + '20' : tag.color + '10',
              }}
            >
              {tag.name}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {filtered.map(creator => {
          const creatorTags = tags.filter(t => creator.tagIds.includes(t.id))
          return (
            <div
              key={creator.id}
              className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] group"
            >
              <div className="flex items-center gap-3 min-w-0">
                {creator.avatar_url ? (
                  <img src={creator.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-white/[0.04] flex items-center justify-center text-[13px] font-medium text-white/25">
                    {creator.display_name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[14px] font-medium text-white/90">{creator.display_name}</p>
                    {creatorTags.map(tag => (
                      <span
                        key={tag.id}
                        className="px-1.5 py-0.5 rounded text-[10px] font-medium flex-shrink-0"
                        style={{ color: tag.color, backgroundColor: tag.color + '18' }}
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
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
                  Preview
                </Link>
                <button
                  onClick={() => deleteCreator(creator.id, creator.display_name)}
                  disabled={deleting === creator.id}
                  className="px-3 py-1 text-[12px] text-red-400/50 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                >
                  {deleting === creator.id ? '...' : 'Delete'}
                </button>
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-white/20 text-[13px]">
            {search || filterTag !== 'all' ? 'No creators match your filter' : 'No creators yet'}
          </div>
        )}
      </div>
    </div>
  )
}
