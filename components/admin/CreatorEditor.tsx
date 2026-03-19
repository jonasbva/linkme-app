'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

const ICON_OPTIONS = ['onlyfans', 'fansly', 'instagram', 'twitter', 'tiktok', 'link']

interface Props {
  creator: any
  links: any[]
  analytics: any
  isNew: boolean
}

export default function CreatorEditor({ creator: initialCreator, links: initialLinks, analytics, isNew }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'links' | 'analytics'>('profile')

  const [creator, setCreator] = useState(initialCreator || {
    slug: '',
    display_name: '',
    username: '',
    bio: '',
    avatar_url: '',
    background_color: '#080808',
    button_color: '#1a1a1a',
    text_color: '#ffffff',
    button_style: 'rounded',
    show_verified: true,
    custom_domain: '',
    avatar_position: 'top',
    hero_height: 'large',
    is_active: true,
  })
  const [linkSaveStatus, setLinkSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')

  const [links, setLinks] = useState<any[]>(initialLinks || [])
  const [newLink, setNewLink] = useState({ title: '', url: '', icon: 'link', thumbnail_url: '', thumbnail_position: 'center' })
  const [addLinkStatus, setAddLinkStatus] = useState<'idle' | 'saving' | 'saved'>('idle')

  function updateCreator(field: string, value: any) {
    setCreator((prev: any) => ({ ...prev, [field]: value }))
  }

  async function saveCreator() {
    setSaving(true)
    const method = isNew ? 'POST' : 'PUT'
    const url = isNew ? '/api/admin/creators' : `/api/admin/creators/${creator.id}`
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(creator),
    })
    if (res.ok) {
      const data = await res.json()
      if (isNew) router.push(`/admin/creators/${data.id}`)
      else router.refresh()
    }
    setSaving(false)
  }

  async function addLink() {
    if (!newLink.title || !newLink.url) return
    setAddLinkStatus('saving')
    const res = await fetch(`/api/admin/creators/${creator.id}/links`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newLink, sort_order: links.length }),
    })
    if (res.ok) {
      const data = await res.json()
      setLinks(prev => [...prev, data])
      setNewLink({ title: '', url: '', icon: 'link', thumbnail_url: '', thumbnail_position: 'center' })
      setAddLinkStatus('saved')
      setTimeout(() => setAddLinkStatus('idle'), 2500)
    } else {
      setAddLinkStatus('idle')
      alert('Failed to add link.')
    }
  }

  async function deleteLink(id: string) {
    // Optimistic update — remove from UI immediately
    const removed = links.find(l => l.id === id)
    setLinks(prev => prev.filter(l => l.id !== id))
    setLinkSaveStatus('saving')
    const res = await fetch(`/api/admin/creators/${creator.id}/links/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      // Restore the link if the API failed
      if (removed) setLinks(prev => [...prev, removed].sort((a, b) => a.sort_order - b.sort_order))
      setLinkSaveStatus('idle')
      alert('Delete failed — check that SUPABASE_SERVICE_ROLE_KEY is set in Vercel environment variables.')
      return
    }
    setLinkSaveStatus('saved')
    setTimeout(() => setLinkSaveStatus('idle'), 2000)
  }

  async function saveLinksOrder() {
    setLinkSaveStatus('saving')
    // Re-save all links with updated sort_order
    await Promise.all(
      links.map((l, i) =>
        fetch(`/api/admin/creators/${creator.id}/links/${l.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sort_order: i }),
        })
      )
    )
    setLinkSaveStatus('saved')
    setTimeout(() => setLinkSaveStatus('idle'), 2000)
  }

  async function updateLinkField(id: string, field: string, value: any) {
    setLinks(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l))
    await fetch(`/api/admin/creators/${creator.id}/links/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value }),
    })
  }

  async function toggleLink(id: string, is_active: boolean) {
    await fetch(`/api/admin/creators/${creator.id}/links/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active }),
    })
    setLinks(prev => prev.map(l => l.id === id ? { ...l, is_active } : l))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <a href="/admin/creators" className="text-sm text-white/40 hover:text-white/60 mb-1 block">← Back</a>
          <h1 className="text-2xl font-semibold">
            {isNew ? 'New Creator' : creator.display_name}
          </h1>
        </div>
        {!isNew && (
          <a
            href={`/${creator.slug}`}
            target="_blank"
            className="px-4 py-2 bg-white/10 text-white text-sm rounded-lg hover:bg-white/20 transition"
          >
            View Page →
          </a>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#111] p-1 rounded-xl w-fit">
        {(['profile', 'links', ...(isNew ? [] : ['analytics'])] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${
              activeTab === tab ? 'bg-white text-black' : 'text-white/50 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-[#111] rounded-2xl p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Display Name" value={creator.display_name} onChange={v => updateCreator('display_name', v)} />
            <Field label="Slug (URL)" value={creator.slug} onChange={v => updateCreator('slug', v.toLowerCase().replace(/\s/g, ''))} placeholder="lilybrown" />
            <Field label="Username (@handle)" value={creator.username} onChange={v => updateCreator('username', v)} placeholder="lilybrown" />
            <Field label="Bio" value={creator.bio} onChange={v => updateCreator('bio', v)} />
            <Field label="Avatar URL" value={creator.avatar_url} onChange={v => updateCreator('avatar_url', v)} placeholder="https://..." />
            <Field label="Custom Domain" value={creator.custom_domain} onChange={v => updateCreator('custom_domain', v)} placeholder="lilybrown.com" />
            <Field label="Background Image URL" value={creator.background_image_url} onChange={v => updateCreator('background_image_url', v)} placeholder="https://..." />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ColorField label="Background Color" value={creator.background_color} onChange={v => updateCreator('background_color', v)} />
            <ColorField label="Button Color" value={creator.button_color} onChange={v => updateCreator('button_color', v)} />
            <ColorField label="Text Color" value={creator.text_color} onChange={v => updateCreator('text_color', v)} />
            <div>
              <label className="text-xs text-white/40 mb-1.5 block">Button Style</label>
              <select
                value={creator.button_style}
                onChange={e => updateCreator('button_style', e.target.value)}
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-sm text-white"
              >
                <option value="rounded">Rounded</option>
                <option value="pill">Pill</option>
                <option value="sharp">Sharp</option>
              </select>
            </div>
          </div>

          {/* Image controls */}
          <div className="border-t border-white/5 pt-5">
            <p className="text-xs text-white/40 mb-4 uppercase tracking-wider">Hero Image Settings</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-white/40 mb-1.5 block">Image Size</label>
                <select
                  value={creator.hero_height || 'large'}
                  onChange={e => updateCreator('hero_height', e.target.value)}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-sm text-white"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1.5 block">Image Focus / Crop</label>
                <select
                  value={creator.avatar_position || 'top'}
                  onChange={e => updateCreator('avatar_position', e.target.value)}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-sm text-white"
                >
                  <option value="top">Top (face/head)</option>
                  <option value="center">Center</option>
                  <option value="bottom">Bottom</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <Toggle label="Show Verified Badge" checked={creator.show_verified} onChange={v => updateCreator('show_verified', v)} />
            <Toggle label="Active" checked={creator.is_active} onChange={v => updateCreator('is_active', v)} />
          </div>

          <button
            onClick={saveCreator}
            disabled={saving}
            className="px-6 py-2.5 bg-white text-black text-sm font-medium rounded-lg hover:bg-white/90 transition disabled:opacity-50"
          >
            {saving ? 'Saving…' : isNew ? 'Create Creator' : 'Save Changes'}
          </button>
        </div>
      )}

      {/* Links Tab */}
      {activeTab === 'links' && (
        <div className="space-y-4">
          {/* Save bar */}
          <div className="flex items-center justify-between bg-[#111] rounded-2xl px-5 py-3">
            <span className="text-sm text-white/40">
              {linkSaveStatus === 'saving' ? 'Saving…' : linkSaveStatus === 'saved' ? '✓ Changes saved' : `${links.length} link${links.length !== 1 ? 's' : ''}`}
            </span>
            <button
              onClick={saveLinksOrder}
              disabled={linkSaveStatus === 'saving'}
              className="px-4 py-1.5 bg-white text-black text-sm font-medium rounded-lg hover:bg-white/90 transition disabled:opacity-40"
            >
              Save Links
            </button>
          </div>

          {/* Existing links */}
          {links.map((link, i) => (
            <div key={link.id} className="bg-[#111] rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-4">
                <span className="text-white/20 text-sm w-4">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{link.title}</p>
                  <p className="text-xs text-white/40 truncate">{link.url}</p>
                  <p className="text-xs text-white/30 mt-0.5">icon: {link.icon}</p>
                </div>
                {analytics?.linkClicks[link.id] && (
                  <span className="text-xs text-white/40">{analytics.linkClicks[link.id]} clicks</span>
                )}
                <button
                  onClick={() => toggleLink(link.id, !link.is_active)}
                  className={`px-2 py-1 text-xs rounded-full ${link.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}
                >
                  {link.is_active ? 'On' : 'Off'}
                </button>
                <button
                  onClick={() => deleteLink(link.id)}
                  className="text-red-400/60 hover:text-red-400 text-xs transition"
                >
                  Delete
                </button>
              </div>
              {/* Per-link image settings */}
              <div className="pl-7 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/30 w-20 shrink-0">Image URL:</span>
                  <input
                    type="text"
                    value={link.thumbnail_url || ''}
                    onChange={e => updateLinkField(link.id, 'thumbnail_url', e.target.value)}
                    placeholder="https://... (optional thumbnail)"
                    className="flex-1 px-3 py-1.5 bg-[#1a1a1a] border border-white/10 rounded-lg text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-white/30"
                  />
                </div>
                {link.thumbnail_url && (
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-white/30 w-20 shrink-0">Image crop:</span>
                    {['top', 'center', 'bottom'].map(pos => (
                      <button
                        key={pos}
                        onClick={() => updateLinkField(link.id, 'thumbnail_position', pos)}
                        className={`px-2.5 py-1 text-xs rounded-lg capitalize transition ${
                          (link.thumbnail_position || 'center') === pos
                            ? 'bg-white text-black'
                            : 'bg-white/10 text-white/50 hover:bg-white/20'
                        }`}
                      >
                        {pos}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Add new link */}
          {!isNew && (
            <div className="bg-[#111] rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-medium text-white/70">Add New Link</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Title" value={newLink.title} onChange={v => setNewLink(p => ({ ...p, title: v }))} placeholder="OnlyFans (free for a short time)" />
                <Field label="URL" value={newLink.url} onChange={v => setNewLink(p => ({ ...p, url: v }))} placeholder="https://onlyfans.com/..." />
                <Field label="Thumbnail Image URL (optional)" value={newLink.thumbnail_url} onChange={v => setNewLink(p => ({ ...p, thumbnail_url: v }))} placeholder="https://..." />
                {newLink.thumbnail_url && (
                  <div>
                    <label className="text-xs text-white/40 mb-1.5 block">Thumbnail Crop</label>
                    <div className="flex gap-2">
                      {['top', 'center', 'bottom'].map(pos => (
                        <button
                          key={pos}
                          type="button"
                          onClick={() => setNewLink(p => ({ ...p, thumbnail_position: pos }))}
                          className={`px-3 py-2 text-xs rounded-lg capitalize transition ${
                            newLink.thumbnail_position === pos
                              ? 'bg-white text-black'
                              : 'bg-[#1a1a1a] border border-white/10 text-white/50 hover:bg-white/10'
                          }`}
                        >
                          {pos}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <label className="text-xs text-white/40 mb-1.5 block">Platform Icon</label>
                  <select
                    value={newLink.icon}
                    onChange={e => setNewLink(p => ({ ...p, icon: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-sm text-white"
                  >
                    {ICON_OPTIONS.map(o => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={addLink}
                  disabled={addLinkStatus === 'saving'}
                  className="px-5 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-white/90 transition disabled:opacity-50"
                >
                  {addLinkStatus === 'saving' ? 'Saving…' : addLinkStatus === 'saved' ? '✓ Link Saved!' : '+ Add Link'}
                </button>
                {addLinkStatus === 'saved' && (
                  <span className="text-xs text-green-400">Link added successfully</span>
                )}
              </div>
            </div>
          )}
          {isNew && (
            <p className="text-white/30 text-sm">Save the creator first, then you can add links.</p>
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && analytics && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Page Views" value={analytics.totalViews.toLocaleString()} />
            <StatCard label="Total Link Clicks" value={analytics.totalClicks.toLocaleString()} />
            <StatCard label="Views Last 30 Days" value={analytics.last30Views.toLocaleString()} />
            <StatCard label="CTR" value={analytics.totalViews > 0 ? `${Math.round(analytics.totalClicks / analytics.totalViews * 100)}%` : '0%'} />
          </div>

          {/* Daily chart */}
          <div className="bg-[#111] rounded-2xl p-6">
            <h3 className="text-sm font-medium text-white/60 mb-4">Views & Clicks — Last 30 Days</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={analytics.dailyData}>
                <XAxis dataKey="date" tick={{ fill: '#555', fontSize: 11 }} />
                <YAxis tick={{ fill: '#555', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8 }} />
                <Line type="monotone" dataKey="views" stroke="#ffffff" strokeWidth={2} dot={false} name="Views" />
                <Line type="monotone" dataKey="clicks" stroke="#4ade80" strokeWidth={2} dot={false} name="Clicks" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Countries */}
            <div className="bg-[#111] rounded-2xl p-6">
              <h3 className="text-sm font-medium text-white/60 mb-4">Top Countries</h3>
              <div className="space-y-2.5">
                {analytics.countries.map(([country, count]: [string, number]) => (
                  <div key={country} className="flex items-center justify-between">
                    <span className="text-sm text-white/70">{country}</span>
                    <span className="text-sm font-medium text-white">{count.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Devices */}
            <div className="bg-[#111] rounded-2xl p-6">
              <h3 className="text-sm font-medium text-white/60 mb-4">Device Types</h3>
              <div className="space-y-2.5">
                {Object.entries(analytics.devices).map(([device, count]) => (
                  <div key={device} className="flex items-center justify-between">
                    <span className="text-sm text-white/70 capitalize">{device}</span>
                    <span className="text-sm font-medium text-white">{(count as number).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, value, onChange, placeholder }: { label: string; value?: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="text-xs text-white/40 mb-1.5 block">{label}</label>
      <input
        type="text"
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/30"
      />
    </div>
  )
}

function ColorField({ label, value, onChange }: { label: string; value?: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs text-white/40 mb-1.5 block">{label}</label>
      <div className="flex gap-2 items-center">
        <input
          type="color"
          value={value || '#000000'}
          onChange={e => onChange(e.target.value)}
          className="w-9 h-9 rounded cursor-pointer bg-transparent border-0"
        />
        <input
          type="text"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          className="flex-1 px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-white/30"
        />
      </div>
    </div>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked?: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onChange(!checked)}
        className={`w-10 h-6 rounded-full transition-colors ${checked ? 'bg-white' : 'bg-white/20'} relative`}
      >
        <div className={`w-4 h-4 rounded-full bg-black absolute top-1 transition-all ${checked ? 'left-5' : 'left-1'}`} />
      </button>
      <span className="text-sm text-white/60">{label}</span>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#111] rounded-2xl p-5">
      <p className="text-xs text-white/40 mb-1">{label}</p>
      <p className="text-2xl font-semibold text-white">{value}</p>
    </div>
  )
}
