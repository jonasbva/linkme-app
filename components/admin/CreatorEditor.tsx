'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Defs, Filter } from 'recharts'
import CreatorPage from '@/components/CreatorPage'

const ICON_OPTIONS = ['onlyfans', 'fansly', 'instagram', 'twitter', 'tiktok', 'snapchat', 'youtube', 'reddit', 'twitch', 'telegram', 'discord', 'spotify', 'link', 'custom']

interface Props {
  creator: any
  links: any[]
  analytics: any
  rawClicks: any[]
  isNew: boolean
}

export default function CreatorEditor({ creator: initialCreator, links: initialLinks, analytics, rawClicks = [], isNew }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'links' | 'analytics'>('profile')

  const [creator, setCreator] = useState(initialCreator || {
    slug: '', display_name: '', username: '', bio: '', avatar_url: '',
    background_color: '#080808', button_color: '#1a1a1a', text_color: '#ffffff',
    button_style: 'rounded', show_verified: true, custom_domain: '',
    avatar_position: 'top', hero_height: 'large', hero_position: 50, hero_scale: 100, is_active: true,
    background_image_url: '',
  })
  const [linkSaveStatus, setLinkSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [links, setLinks] = useState<any[]>(initialLinks || [])
  const [newLink, setNewLink] = useState({ title: '', url: '', icon: 'link', custom_icon_url: '', thumbnail_url: '', thumbnail_position: '50', thumbnail_height: 200 })
  const [addLinkStatus, setAddLinkStatus] = useState<'idle' | 'saving' | 'saved'>('idle')

  // Date range state — default to last 30 days
  const [dateStart, setDateStart] = useState<Date>(() => {
    const d = new Date(); d.setDate(d.getDate() - 30); return d
  })
  const [dateEnd, setDateEnd] = useState<Date>(new Date())
  const [dateLabel, setDateLabel] = useState('Last 30 days')
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const datePickerRef = useRef<HTMLDivElement>(null)

  // Close popup on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target as Node)) {
        setShowDatePicker(false)
      }
    }
    if (showDatePicker) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showDatePicker])

  function applyPreset(label: string, start: Date, end: Date) {
    setDateStart(start)
    setDateEnd(end)
    setDateLabel(label)
    setShowDatePicker(false)
  }

  function applyCustomRange() {
    if (!customStart || !customEnd) return
    const s = new Date(customStart + 'T00:00:00')
    const e = new Date(customEnd + 'T23:59:59')
    if (isNaN(s.getTime()) || isNaN(e.getTime()) || s > e) return
    setDateStart(s)
    setDateEnd(e)
    setDateLabel(`${s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${e.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`)
    setShowDatePicker(false)
  }

  function selectMonth(monthOffset: number) {
    const now = new Date()
    const d = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1)
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59)
    const label = d.toLocaleDateString('en-US', { month: 'long', year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined })
    applyPreset(label, d, end)
  }

  // Generate last 12 months for the slider
  const monthOptions = useMemo(() => {
    const now = new Date()
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      return {
        offset: i,
        label: d.toLocaleDateString('en-US', { month: 'short' }),
        fullLabel: d.toLocaleDateString('en-US', { month: 'long', year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined }),
      }
    })
  }, [])

  function updateCreator(field: string, value: any) {
    setCreator((prev: any) => ({ ...prev, [field]: value }))
  }

  function updateLinkField(id: string, field: string, value: any) {
    setLinks(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l))
  }

  function countryFlag(code: string): string {
    if (!code || code.length !== 2) return ''
    return String.fromCodePoint(...[...code.toUpperCase()].map((c: string) => 0x1F1E6 + c.charCodeAt(0) - 65))
  }

  const filteredClicks = useMemo(() => {
    return rawClicks.filter((click: any) => {
      const clickDate = new Date(click.created_at)
      return clickDate >= dateStart && clickDate <= dateEnd
    })
  }, [rawClicks, dateStart, dateEnd])

  const computedAnalytics = useMemo(() => {
    const totalViews = filteredClicks.length
    const totalClicks = filteredClicks.filter((c: any) => c.type === 'click').length
    const ctr = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0

    // Daily chart data
    const dailyMap = new Map<string, { views: number; clicks: number }>()
    filteredClicks.forEach((click: any) => {
      const date = new Date(click.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      const current = dailyMap.get(date) || { views: 0, clicks: 0 }
      if (click.type === 'click') current.clicks++
      current.views++
      dailyMap.set(date, current)
    })
    const dailyData = Array.from(dailyMap.entries()).map(([date, data]) => ({ date, ...data }))

    // Countries
    const countriesMap = new Map<string, { code: string; count: number }>()
    filteredClicks.forEach((click: any) => {
      const country = click.country || 'Unknown'
      const code = click.country_code || ''
      const current = countriesMap.get(country) || { code, count: 0 }
      current.count++
      countriesMap.set(country, current)
    })
    const countries = Array.from(countriesMap.entries())
      .map(([name, data]) => [name, data.code, data.count] as [string, string, number])
      .sort((a, b) => b[2] - a[2])

    // Devices
    const devicesMap = new Map<string, number>()
    filteredClicks.forEach((click: any) => {
      const device = click.device || 'unknown'
      devicesMap.set(device, (devicesMap.get(device) || 0) + 1)
    })
    const devices = Object.fromEntries(devicesMap)

    return {
      totalViews,
      totalClicks,
      ctr,
      dailyData: dailyData.length > 0 ? dailyData : analytics?.dailyData || [],
      countries,
      devices,
    }
  }, [filteredClicks])

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
      const results = await Promise.all(
        links.map(async (l: any, i: number) => {
          const payload: any = {
            sort_order: i,
            title: l.title,
            url: l.url,
            icon: l.icon,
            thumbnail_url: l.thumbnail_url || null,
            thumbnail_position: l.thumbnail_position || '50',
            thumbnail_height: l.thumbnail_height || 200,
            is_active: l.is_active,
          }
          if (l.custom_icon_url) {
            payload.custom_icon_url = l.custom_icon_url
          }
          const res = await fetch(`/api/admin/creators/${creator.id}/links/${l.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
          if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            throw new Error(err.error || `Failed to save "${l.title}"`)
          }
          return res.json()
        })
      )
      setLinkSaveStatus('saved')
      setTimeout(() => setLinkSaveStatus('idle'), 2500)
    } catch (err: any) {
      setLinkSaveStatus('idle')
      alert('Save failed: ' + (err.message || 'Unknown error'))
    }
  }

  async function addLink() {
    if (!newLink.title || !newLink.url) return
    setAddLinkStatus('saving')
    const payload: any = {
      ...newLink,
      sort_order: links.length,
    }
    if (!payload.custom_icon_url) {
      delete payload.custom_icon_url
    }
    const res = await fetch(`/api/admin/creators/${creator.id}/links`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      const data = await res.json()
      setLinks(prev => [...prev, data])
      setNewLink({ title: '', url: '', icon: 'link', custom_icon_url: '', thumbnail_url: '', thumbnail_position: '50', thumbnail_height: 200 })
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
        <div className="flex gap-8">
          {/* Left: Settings */}
          <div className="flex-1 min-w-0 space-y-8">
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
              <div className="space-y-4">
                <SelectField label="Size" value={creator.hero_height || 'large'} onChange={v => updateCreator('hero_height', v)}
                  options={[['small', 'Small'], ['medium', 'Medium'], ['large', 'Large']]} />
                <SliderField
                  label="Position"
                  value={creator.hero_position !== undefined ? creator.hero_position : 50}
                  min={0}
                  max={100}
                  suffix="%"
                  onChange={v => updateCreator('hero_position', v)}
                />
                <SliderField
                  label="Scale"
                  value={creator.hero_scale !== undefined ? creator.hero_scale : 100}
                  min={100}
                  max={200}
                  step={5}
                  suffix="%"
                  onChange={v => updateCreator('hero_scale', v)}
                />
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

          {/* Right: Live preview (sticky) */}
          <div className="w-[300px] shrink-0">
            <div className="sticky top-24">
              <p className="text-[11px] text-white/20 uppercase tracking-widest font-medium mb-4">Preview</p>
              <div className="bg-white/[0.02] border border-white/[0.04] rounded-2xl overflow-hidden" style={{ height: 580 }}>
                <div style={{ width: 375, height: 667, transform: 'scale(0.75)', transformOrigin: 'top left' }}>
                  <CreatorPage creator={creator} links={links} />
                </div>
              </div>
            </div>
          </div>
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

                {/* Icon settings */}
                <div className="pl-9 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-white/20 w-16 shrink-0">Icon</span>
                    <select
                      value={link.icon || 'link'}
                      onChange={e => updateLinkField(link.id, 'icon', e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-white/[0.03] border border-white/[0.06] rounded-lg text-[12px] text-white/80 focus:border-white/15 transition-colors"
                    >
                      {ICON_OPTIONS.map(o => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  </div>

                  {link.icon === 'custom' && (
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-white/20 w-16 shrink-0">Icon URL</span>
                      <input
                        type="text"
                        value={link.custom_icon_url || ''}
                        onChange={e => updateLinkField(link.id, 'custom_icon_url', e.target.value)}
                        placeholder="https://..."
                        className="flex-1 px-3 py-1.5 bg-white/[0.03] border border-white/[0.06] rounded-lg text-[12px] text-white/80 placeholder:text-white/15 focus:border-white/15 transition-colors"
                      />
                    </div>
                  )}
                </div>

                {/* Image settings + preview */}
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
                    <div className="flex gap-5">
                      {/* Left: sliders */}
                      <div className="flex-1 min-w-0 space-y-2.5">
                        <SliderField
                          label="Height"
                          value={link.thumbnail_height || 200}
                          min={100}
                          max={400}
                          step={10}
                          suffix="px"
                          onChange={v => updateLinkField(link.id, 'thumbnail_height', v)}
                        />
                        <SliderField
                          label="Position"
                          value={parseInt(link.thumbnail_position || '50') || 50}
                          min={0}
                          max={100}
                          suffix="%"
                          onChange={v => updateLinkField(link.id, 'thumbnail_position', String(v))}
                        />
                      </div>

                      {/* Right: wider preview */}
                      <div
                        className="rounded-xl overflow-hidden border border-white/[0.04] relative shrink-0"
                        style={{ height: link.thumbnail_height || 200, width: 320 }}
                      >
                        <img
                          src={link.thumbnail_url}
                          alt=""
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            objectPosition: `center ${parseInt(link.thumbnail_position || '50') || 50}%`,
                            display: 'block',
                          }}
                        />
                        <div style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          padding: '24px 16px 12px',
                          background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                        }}>
                          <span className="text-[13px] font-semibold text-white line-clamp-1">{link.title}</span>
                        </div>
                      </div>
                    </div>
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

              {newLink.icon === 'custom' && (
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-white/20 w-16 shrink-0">Icon URL</span>
                  <input
                    type="text"
                    value={newLink.custom_icon_url || ''}
                    onChange={e => setNewLink(p => ({ ...p, custom_icon_url: e.target.value }))}
                    placeholder="https://..."
                    className="flex-1 px-3 py-1.5 bg-white/[0.03] border border-white/[0.06] rounded-lg text-[12px] text-white/80 placeholder:text-white/15 focus:border-white/15 transition-colors"
                  />
                </div>
              )}

              {newLink.thumbnail_url && (
                <div className="flex gap-5">
                  {/* Left: sliders */}
                  <div className="flex-1 min-w-0 space-y-2.5">
                    <SliderField label="Height" value={newLink.thumbnail_height} min={100} max={400} step={10} suffix="px"
                      onChange={v => setNewLink(p => ({ ...p, thumbnail_height: v }))} />
                    <SliderField label="Position" value={parseInt(newLink.thumbnail_position) || 50} min={0} max={100} suffix="%"
                      onChange={v => setNewLink(p => ({ ...p, thumbnail_position: String(v) }))} />
                  </div>
                  {/* Right: wider preview */}
                  <div
                    className="rounded-xl overflow-hidden border border-white/[0.04] relative shrink-0"
                    style={{ height: newLink.thumbnail_height, width: 320 }}
                  >
                    <img
                      src={newLink.thumbnail_url}
                      alt=""
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: `center ${parseInt(newLink.thumbnail_position) || 50}%`,
                        display: 'block',
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
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
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Date range bar — OF-style */}
          <div className="space-y-3">
            {/* Month slider */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
              {monthOptions.map(m => {
                const now = new Date()
                const mStart = new Date(now.getFullYear(), now.getMonth() - m.offset, 1)
                const mEnd = new Date(mStart.getFullYear(), mStart.getMonth() + 1, 0, 23, 59, 59)
                const isActive = dateStart.getTime() === mStart.getTime() && dateEnd.getTime() === mEnd.getTime()
                return (
                  <button
                    key={m.offset}
                    onClick={() => selectMonth(m.offset)}
                    className={`px-3.5 py-1.5 text-[12px] font-medium rounded-full whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-white text-black'
                        : 'bg-white/[0.04] text-white/40 hover:bg-white/[0.08] hover:text-white/60'
                    }`}
                  >
                    {m.label}
                  </button>
                )
              })}
            </div>

            {/* Quick presets + custom trigger */}
            <div className="flex items-center gap-2 relative">
              {[
                { label: '7d', fn: () => { const s = new Date(); s.setDate(s.getDate() - 7); applyPreset('Last 7 days', s, new Date()) } },
                { label: '30d', fn: () => { const s = new Date(); s.setDate(s.getDate() - 30); applyPreset('Last 30 days', s, new Date()) } },
                { label: '90d', fn: () => { const s = new Date(); s.setDate(s.getDate() - 90); applyPreset('Last 90 days', s, new Date()) } },
                { label: 'All', fn: () => { applyPreset('All time', new Date(2000, 0, 1), new Date()) } },
              ].map(p => (
                <button
                  key={p.label}
                  onClick={p.fn}
                  className={`px-3 py-1 text-[11px] font-medium rounded-md transition-all ${
                    dateLabel.toLowerCase().includes(p.label.toLowerCase().replace('d', ' day'))
                    || (p.label === 'All' && dateLabel === 'All time')
                      ? 'bg-white/[0.12] text-white/80'
                      : 'bg-white/[0.03] text-white/30 hover:bg-white/[0.06] hover:text-white/50'
                  }`}
                >
                  {p.label}
                </button>
              ))}

              <div className="ml-auto flex items-center gap-2">
                <span className="text-[11px] text-white/25">{dateLabel}</span>
                <button
                  onClick={() => {
                    setCustomStart(dateStart.toISOString().split('T')[0])
                    setCustomEnd(dateEnd.toISOString().split('T')[0])
                    setShowDatePicker(!showDatePicker)
                  }}
                  className="px-3 py-1 text-[11px] font-medium rounded-md bg-white/[0.03] text-white/40 hover:bg-white/[0.06] hover:text-white/60 transition-all border border-white/[0.06]"
                >
                  Custom range
                </button>
              </div>

              {/* Custom date popup */}
              {showDatePicker && (
                <div
                  ref={datePickerRef}
                  className="absolute right-0 top-full mt-2 z-50 bg-[#111] border border-white/[0.08] rounded-xl p-5 shadow-2xl shadow-black/50"
                  style={{ minWidth: 300 }}
                >
                  <p className="text-[12px] text-white/40 font-medium mb-4">Custom date range</p>
                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] text-white/25 mb-1.5 block">Start date</label>
                      <input
                        type="date"
                        value={customStart}
                        onChange={e => setCustomStart(e.target.value)}
                        className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-[13px] text-white/80 focus:border-white/20 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-white/25 mb-1.5 block">End date</label>
                      <input
                        type="date"
                        value={customEnd}
                        onChange={e => setCustomEnd(e.target.value)}
                        className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-[13px] text-white/80 focus:border-white/20 transition-colors"
                      />
                    </div>
                    <button
                      onClick={applyCustomRange}
                      disabled={!customStart || !customEnd}
                      className="w-full mt-1 px-4 py-2 bg-white text-black text-[12px] font-medium rounded-lg hover:bg-white/90 transition-colors disabled:opacity-30"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Stat label="Page views" value={computedAnalytics.totalViews.toLocaleString()} />
            <Stat label="Link clicks" value={computedAnalytics.totalClicks.toLocaleString()} />
            <Stat label="CTR" value={computedAnalytics.totalViews > 0 ? `${Math.round(computedAnalytics.ctr)}%` : '—'} />
            <Stat label="Date range" value={filteredClicks.length > 0 ? `${filteredClicks.length} events` : '—'} />
          </div>

          {/* Chart */}
          <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-6">
            <p className="text-[12px] text-white/25 mb-4">Activity</p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={computedAnalytics.dailyData}>
                <Defs>
                  <Filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </Filter>
                </Defs>
                <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.15)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.15)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, fontSize: 12 }}
                  itemStyle={{ color: '#fff' }}
                />
                {/* Glow layer */}
                <Line type="monotone" dataKey="views" stroke="rgba(255,255,255,0.1)" strokeWidth={6} dot={false} filter="url(#glow)" />
                {/* Main line */}
                <Line type="monotone" dataKey="views" stroke="rgba(255,255,255,0.8)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="clicks" stroke="rgba(255,255,255,0.2)" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Countries and Devices */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-5">
              <p className="text-[12px] text-white/25 mb-3">Countries</p>
              <div className="space-y-2">
                {computedAnalytics.countries.length > 0 ? (
                  computedAnalytics.countries.map(([country, code, count]: [string, string, number]) => (
                    <div key={country} className="flex items-center justify-between">
                      <span className="text-[13px] text-white/50">
                        {countryFlag(code)} {country}
                      </span>
                      <span className="text-[13px] text-white/80 font-medium">{count.toLocaleString()}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-[12px] text-white/20">No data</p>
                )}
              </div>
            </div>
            <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-5">
              <p className="text-[12px] text-white/25 mb-3">Devices</p>
              <div className="space-y-2">
                {Object.entries(computedAnalytics.devices).length > 0 ? (
                  Object.entries(computedAnalytics.devices).map(([device, count]) => (
                    <div key={device} className="flex items-center justify-between">
                      <span className="text-[13px] text-white/50 capitalize">{device}</span>
                      <span className="text-[13px] text-white/80 font-medium">{(count as number).toLocaleString()}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-[12px] text-white/20">No data</p>
                )}
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
        className="w-full px-3 py-1.5 bg-white/[0.03] border border-white/[0.06] rounded-lg text-[12px] text-white/80 placeholder:text-white/15 focus:border-white/15 transition-colors"
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
        className="w-full px-3 py-1.5 bg-white/[0.03] border border-white/[0.06] rounded-lg text-[12px] text-white/80 focus:border-white/15 transition-colors"
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
          className="flex-1 px-3 py-1.5 bg-white/[0.03] border border-white/[0.06] rounded-lg text-[12px] text-white/80 focus:border-white/15 transition-colors"
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
      <span className="text-[11px] text-white/20 w-20 shrink-0">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step || 1}
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
