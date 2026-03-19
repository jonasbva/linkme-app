'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts'

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
    slug: '', display_name: '', username: '', bio: '', avatar_url: '',
    background_color: '#080808', button_color: '#1a1a1a', text_color: '#ffffff',
    button_style: 'rounded', show_verified: true, custom_domain: '',
    avatar_position: 'top', hero_height: 'large', is_active: true,
    background_image_url: '',
  })
  const [linkSaveStatus, setLinkSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [links, setLinks] = useState<any[]>(initialLinks || [])
  const [newLink, setNewLink] = useState({ title: '', url: '', icon: 'link', thumbnail_url: '', thumbnail_position: '50', thumbnail_height: 200 })
  const [addLinkStatus, setAddLinkStatus] = useState<'idle' | 'saving' | 'saved'>('idle')

  function updateCreator(field: string, value: any) {
    setCreator((prev: any) => ({ ...prev, [field]: value }))
  }

  function updateLinkField(id: string, field: string, value: any) {
    setLinks(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l))
  }

  async function saveCreator() {
    setSaving(true)
    const method = isNew ? 'POST' : 'PUT'
    const url = isNew ? '/api/admin/creators' : `/api/admin/creators/${creator.id}`
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(creator) })
    if (res.ok) {
      const data = await res.json()
      if (isNew) router.push(`/admin/creators/${data.id}`)
      else router.refresh()
    }
    setSaving(false)
  }

  async function saveAllLinks() {
    setLinkSaveStatus('saving')
    try {
      await Promise.all(
        links.map((l: any, i: number) =>
          fetch(`/api/admin/creators/${creator.id}/links/${l.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sort_order: i, title: l.title, url: l.url, icon: l.icon,
              thumbnail_url: l.thumbnail_url || null,
              thumbnail_position: l.thumbnail_position || '50',
              thumbnail_height: l.thumbnail_height || 200,
              is_active: l.is_active,
            }),
          })
        )
      )
      setLinkSaveStatus('saved')
      setTimeout(() => setLinkSaveStatus('idle'), 2500)
    } catch (err) {
      setLinkSaveStatus('idle')
      alert('Failed to save links.')
    }
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
      setNewLink({ title: '', url: '', icon: 'link', thumbnail_url: '', thumbnail_position: '50', thumbnail_height: 200 })
      setAddLinkStatus('saved')
      setTimeout(() => setAddLinkStatus('idle'), 2500)
    } else {
      setAddLinkStatus('idle')
      alert('Failed to add link.')
    }
  }

  async function deleteLink(id: string) {
    const removed = links.find(l => l.id === id)
    setLinks(prev => prev.filter(l => l.id !== id))
    setLinkSaveStatus('saving')
    const res = await fetch(`/api/admin/creators/${creator.id}/links/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      if (removed) setLinks(prev => [...prev, removed].sort((a: any, b: any) => a.sort_order - b.sort_order))
      setLinkSaveStatus('idle')
      alert('Delete failed.')
      return
    }
    setLinkSaveStatus('saved')
    setTimeout(() => setLinkSaveStatus('idle'), 2000)
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <a href="/admin/creators" className="text-[12px] text-white/25 hover:text-white/50 transition-colors">
            ← Back
          </a>
          <h1 className="text-xl font-semibold tracking-tight mt-1">
            {isNew ? 'New Creator' : creator.display_name}
          </h1>
        </div>
        {!isNew && (
          <a
            href={`/${creator.slug}`}
            target="_blank"
            className="px-4 py-1.5 text-[12px] text-white/40 border border-white/[0.06] rounded-lg hover:bg-white/[0.03] transition-colors"
          >
            View page →
          </a>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-white/[0.04] pb-px">
        {(['profile', 'links', ...(isNew ? [] : ['analytics'])] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`pb-2.5 text-[13px] font-medium capitalize transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? 'text-white border-white'
                : 'text-white/30 border-transparent hover:text-white/50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ─── PROFILE TAB ─── */}
      {activeTab === 'profile' && (
        <div className="space-y-8">
          <Section title="General">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Display Name" value={creator.display_name} onChange={v => updateCreator('display_name', v)} />
              <Field label="Slug" value={creator.slug} onChange={v => updateCreator('slug', v.toLowerCase().replace(/\s/g, ''))} placeholder="lilybrown" />
              <Field label="Username" value={creator.username} onChange={v => updateCreator('username', v)} placeholder="@lilybrown" />
              <Field label="Bio" value={creator.bio} onChange={v => updateCreator('bio', v)} />
              <Field label="Avatar URL" value={creator.avatar_url} onChange={v => updateCreator('avatar_url', v)} placeholder="https://..." />
              <Field label="Custom Domain" value={creator.custom_domain} onChange={v => updateCreator('custom_domain', v)} placeholder="lilybrown.com" />
              <Field label="Background Image" value={creator.background_image_url} onChange={v => updateCreator('background_image_url', v)} placeholder="https://..." />
            </div>
          </Section>

          <Section title="Appearance">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              <ColorField label="Background" value={creator.background_color} onChange={v => updateCreator('background_color', v)} />
              <ColorField label="Buttons" value={creator.button_color} onChange={v => updateCreator('button_color', v)} />
              <ColorField label="Text" value={creator.text_color} onChange={v => updateCreator('text_color', v)} />
              <SelectField label="Button Style" value={creator.button_style} onChange={v => updateCreator('button_style', v)}
                options={[['rounded', 'Rounded'], ['pill', 'Pill'], ['sharp', 'Sharp']]} />
            </div>
          </Section>

          <Section title="Hero Image">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              <SelectField label="Size" value={creator.hero_height || 'large'} onChange={v => updateCreator('hero_height', v)}
                options={[['small', 'Small'], ['medium', 'Medium'], ['large', 'Large']]} />
              <SelectField label="Focus" value={creator.avatar_position || 'top'} onChange={v => updateCreator('avatar_position', v)}
                options={[['top', 'Top'], ['center', 'Center'], ['bottom', 'Bottom']]} />
            </div>
          </Section>

          <div className="flex items-center gap-8">
            <Toggle label="Verified badge" checked={creator.show_verified} onChange={v => updateCreator('show_verified', v)} />
            <Toggle label="Active" checked={creator.is_active} onChange={v => updateCreator('is_active', v)} />
          </div>

          <button
            onClick={saveCreator}
            disabled={saving}
            className="px-5 py-2 bg-white text-black text-[13px] font-medium rounded-lg hover:bg-white/90 transition-colors disabled:opacity-40"
          >
            {saving ? 'Saving…' : isNew ? 'Create' : 'Save changes'}
          </button>
        </div>
      )}

      {/* ─── LINKS TAB ─── */}
      {activeTab === 'links' && (
        <div className="space-y-5">
          {/* Save bar */}
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-white/25">
              {linkSaveStatus === 'saving' ? 'Saving…' : linkSaveStatus === 'saved' ? '✓ Saved' : `${links.length} link${links.length !== 1 ? 's' : ''}`}
            </span>
            <button
              onClick={saveAllLinks}
              disabled={linkSaveStatus === 'saving'}
              className="px-4 py-1.5 bg-white text-black text-[12px] font-medium rounded-lg hover:bg-white/90 transition-colors disabled:opacity-40"
            >
              Save links
            </button>
          </div>

          {/* Existing links */}
          <div className="space-y-3">
            {links.map((link: any, i: number) => (
              <div key={link.id} className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-5 space-y-4">
                {/* Link header */}
                <div className="flex items-center gap-4">
                  <span className="text-white/15 text-[12px] font-medium w-5 text-center">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-white/90 truncate">{link.title}</p>
                    <p className="text-[11px] text-white/25 truncate mt-0.5">{link.url}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleLink(link.id, !link.is_active)}
                      className={`w-8 h-[18px] rounded-full transition-colors relative ${link.is_active ? 'bg-white/90' : 'bg-white/10'}`}
                    >
                      <div className={`w-3.5 h-3.5 rounded-full absolute top-[2px] transition-all ${
                        link.is_active ? 'left-[17px] bg-black' : 'left-[2px] bg-white/30'
                      }`} />
                    </button>
                    <button
                      onClick={() => deleteLink(link.id)}
                      className="text-white/15 hover:text-red-400/70 text-[11px] transition-colors ml-1"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                {/* Image settings */}
                <div className="pl-9 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-white/20 w-16 shrink-0">Image</span>
                    <input
                      type="text"
                      value={link.thumbnail_url || ''}
                      onChange={e => updateLinkField(link.id, 'thumbnail_url', e.target.value)}
                      placeholder="Paste image URL…"
                      className="flex-1 px-3 py-1.5 bg-white/[0.03] border border-white/[0.06] rounded-lg text-[12px] text-white/80 placeholder:text-white/15 focus:border-white/15 transition-colors"
                    />
                  </div>

                  {link.thumbnail_url && (
                    <>
                      <div className="space-y-2.5">
                        <SliderField
                          label="Height"
                          value={link.thumbnail_height || 200}
                          min={100} max={400} step={10}
                          suffix="px"
                          onChange={v => updateLinkField(link.id, 'thumbnail_height', v)}
                        />
                        <SliderField
                          label="Position"
                          value={parseInt(link.thumbnail_position || '50') || 50}
                          min={0} max={100}
                          suffix="%"
                          onChange={v => updateLinkField(link.id, 'thumbnail_position', String(v))}
                        />
                      </div>

                      {/* Preview */}
                      <div
                        className="rounded-xl overflow-hidden border border-white/[0.04] relative"
                        style={{ height: link.thumbnail_height || 200, maxWidth: 400 }}
                      >
                        <img
                          src={link.thumbnail_url}
                          alt=""
                          style={{
                            width: '100%', height: '100%', objectFit: 'cover',
                            objectPosition: `center ${parseInt(link.thumbnail_position || '50') || 50}%`,
                            display: 'block',
                          }}
                        />
                        <div style={{
                          position: 'absolute', bottom: 0, left: 0, right: 0,
                          padding: '30px 16px 14px',
                          background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                        }}>
                          <span className="text-[13px] font-semibold text-white">{link.title}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add new link */}
          {!isNew && (
            <div className="border border-dashed border-white/[0.06] rounded-xl p-5 space-y-4">
              <p className="text-[12px] text-white/30 font-medium">Add link</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Title" value={newLink.title} onChange={v => setNewLink(p => ({ ...p, title: v }))} placeholder="OnlyFans (free for a short time)" />
                <Field label="URL" value={newLink.url} onChange={v => setNewLink(p => ({ ...p, url: v }))} placeholder="https://onlyfans.com/..." />
                <Field label="Image URL" value={newLink.thumbnail_url} onChange={v => setNewLink(p => ({ ...p, thumbnail_url: v }))} placeholder="Optional" />
                <SelectField label="Icon" value={newLink.icon} onChange={v => setNewLink(p => ({ ...p, icon: v }))}
                  options={ICON_OPTIONS.map(o => [o, o])} />
              </div>

              {newLink.thumbnail_url && (
                <div className="space-y-3">
                  <SliderField label="Height" value={newLink.thumbnail_height} min={100} max={400} step={10} suffix="px"
                    onChange={v => setNewLink(p => ({ ...p, thumbnail_height: v }))} />
                  <SliderField label="Position" value={parseInt(newLink.thumbnail_position) || 50} min={0} max={100} suffix="%"
                    onChange={v => setNewLink(p => ({ ...p, thumbnail_position: String(v) }))} />
                  <div
                    className="rounded-xl overflow-hidden border border-white/[0.04] relative"
                    style={{ height: newLink.thumbnail_height, maxWidth: 400 }}
                  >
                    <img
                      src={newLink.thumbnail_url}
                      alt=""
                      style={{
                        width: '100%', height: '100%', objectFit: 'cover',
                        objectPosition: `center ${parseInt(newLink.thumbnail_position) || 50}%`,
                        display: 'block',
                      }}
                    />
                    <div style={{
                      position: 'absolute', bottom: 0, left: 0, right: 0,
                      padding: '30px 16px 14px',
                      background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                    }}>
                      <span className="text-[13px] font-semibold text-white">{newLink.title || 'Link title'}</span>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={addLink}
                disabled={addLinkStatus === 'saving' || !newLink.title || !newLink.url}
                className="px-4 py-1.5 bg-white text-black text-[12px] font-medium rounded-lg hover:bg-white/90 transition-colors disabled:opacity-30"
              >
                {addLinkStatus === 'saving' ? 'Saving…' : addLinkStatus === 'saved' ? '✓ Added' : 'Add link'}
              </button>
            </div>
          )}

          {isNew && (
            <p className="text-white/20 text-[13px]">Save the creator first, then add links.</p>
          )}
        </div>
      )}

      {/* ─── ANALYTICS TAB ─── */}
      {activeTab === 'analytics' && analytics && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Stat label="Page views" value={analytics.totalViews.toLocaleString()} />
            <Stat label="Link clicks" value={analytics.totalClicks.toLocaleString()} />
            <Stat label="Last 30 days" value={analytics.last30Views.toLocaleString()} />
            <Stat label="CTR" value={analytics.totalViews > 0 ? `${Math.round(analytics.totalClicks / analytics.totalViews * 100)}%` : '—'} />
          </div>

          <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-6">
            <p className="text-[12px] text-white/25 mb-4">Last 30 days</p>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={analytics.dailyData}>
                <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.15)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.15)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, fontSize: 12 }}
                  itemStyle={{ color: '#fff' }}
                />
                <Line type="monotone" dataKey="views" stroke="rgba(255,255,255,0.5)" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="clicks" stroke="rgba(255,255,255,0.15)" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-5">
              <p className="text-[12px] text-white/25 mb-3">Countries</p>
              <div className="space-y-2">
                {analytics.countries.map(([country, count]: [string, number]) => (
                  <div key={country} className="flex items-center justify-between">
                    <span className="text-[13px] text-white/50">{country}</span>
                    <span className="text-[13px] text-white/80 font-medium">{count.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-5">
              <p className="text-[12px] text-white/25 mb-3">Devices</p>
              <div className="space-y-2">
                {Object.entries(analytics.devices).map(([device, count]) => (
                  <div key={device} className="flex items-center justify-between">
                    <span className="text-[13px] text-white/50 capitalize">{device}</span>
                    <span className="text-[13px] text-white/80 font-medium">{(count as number).toLocaleString()}</span>
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

/* ── Shared Components ──────────────────────────── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <p className="text-[11px] text-white/20 uppercase tracking-widest font-medium">{title}</p>
      {children}
    </div>
  )
}

function Field({ label, value, onChange, placeholder }: { label: string; value?: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="text-[11px] text-white/25 mb-1.5 block">{label}</label>
      <input
        type="text"
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-[13px] text-white/80 placeholder:text-white/15 focus:border-white/15 transition-colors"
      />
    </div>
  )
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[][] }) {
  return (
    <div>
      <label className="text-[11px] text-white/25 mb-1.5 block">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-[13px] text-white/80 focus:border-white/15 transition-colors"
      >
        {options.map(([val, lbl]) => (
          <option key={val} value={val}>{lbl}</option>
        ))}
      </select>
    </div>
  )
}

function ColorField({ label, value, onChange }: { label: string; value?: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-[11px] text-white/25 mb-1.5 block">{label}</label>
      <div className="flex gap-2 items-center">
        <input
          type="color"
          value={value || '#000000'}
          onChange={e => onChange(e.target.value)}
          className="w-8 h-8 rounded-md cursor-pointer bg-transparent border border-white/[0.06] p-0.5"
        />
        <input
          type="text"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          className="flex-1 px-3 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-[13px] text-white/80 focus:border-white/15 transition-colors"
        />
      </div>
    </div>
  )
}

function SliderField({ label, value, min, max, step, suffix, onChange }: {
  label: string; value: number; min: number; max: number; step?: number; suffix: string; onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[11px] text-white/20 w-16 shrink-0">{label}</span>
      <input
        type="range"
        min={min} max={max} step={step || 1}
        value={value}
        onChange={e => onChange(parseInt(e.target.value))}
        className="flex-1"
      />
      <span className="text-[11px] text-white/30 w-12 text-right tabular-nums">{value}{suffix}</span>
    </div>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked?: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)} className="flex items-center gap-2.5 group">
      <div className={`w-8 h-[18px] rounded-full transition-colors relative ${checked ? 'bg-white/90' : 'bg-white/10'}`}>
        <div className={`w-3.5 h-3.5 rounded-full absolute top-[2px] transition-all ${
          checked ? 'left-[17px] bg-black' : 'left-[2px] bg-white/30'
        }`} />
      </div>
      <span className="text-[12px] text-white/40 group-hover:text-white/60 transition-colors">{label}</span>
    </button>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-4">
      <p className="text-[11px] text-white/20 mb-1">{label}</p>
      <p className="text-xl font-semibold text-white/90 tracking-tight">{value}</p>
    </div>
  )
}
