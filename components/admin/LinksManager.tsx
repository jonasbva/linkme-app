'use client'

import { useState, useEffect } from 'react'

// ─── Platform icons ──────────────────────────────────────────────────────────
const ICON_OPTIONS = ['onlyfans', 'fansly', 'instagram', 'twitter', 'tiktok', 'snapchat', 'youtube', 'reddit', 'twitch', 'telegram', 'discord', 'spotify', 'link', 'custom']

const PLATFORM_ICONS: Record<string, { color: string; svg: string }> = {
  onlyfans: { color: '#00AFF0', svg: `<svg viewBox="0 0 24 24" width="100%" height="100%"><circle cx="12" cy="12" r="11.5" fill="#00AFF0"/><circle cx="12" cy="12" r="7.5" fill="none" stroke="#fff" stroke-width="2.5"/><circle cx="12" cy="12" r="3" fill="#fff"/></svg>` },
  fansly: { color: '#1DA1F2', svg: `<svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg>` },
  instagram: { color: '#E1306C', svg: `<svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>` },
  twitter: { color: '#ffffff', svg: `<svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>` },
  tiktok: { color: '#ff0050', svg: `<svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.83 4.83 0 01-1.01-.07z"/></svg>` },
  snapchat: { color: '#FFFC00', svg: `<svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%"><path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2zm0 2a8 8 0 100 16 8 8 0 000-16zm3 6a1 1 0 110 2 1 1 0 010-2zm-6 0a1 1 0 110 2 1 1 0 010-2z"/></svg>` },
  youtube: { color: '#FF0000', svg: `<svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>` },
  reddit: { color: '#FF4500', svg: `<svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%"><path d="M12 2a10 10 0 1010 10A10 10 0 0012 2zm5 10.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM8.5 14c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3zm6.5-6a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/></svg>` },
  twitch: { color: '#9146FF', svg: `<svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%"><path d="M12 2L9 6H5V18H10V22L14 18H17L22 12V2H12ZM14 13L12 15H9L7 17V15H4V5H14V13Z"/></svg>` },
  telegram: { color: '#0088cc', svg: `<svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.43-1.13 7.1-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.59-1.38-.95-2.23-1.52-.99-.66-.35-1.02.21-1.61.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.06-.16-.04-.25-.02-.11.02-1.93 1.23-5.45 3.6-.51.35-.98.52-1.4.51-.46-.01-1.35-.26-2.01-.48-.81-.27-1.44-.41-1.39-.87.03-.24.35-.48.95-.72 3.7-1.6 6.17-2.66 7.41-3.23 3.52-1.5 4.25-1.76 4.73-1.77.1 0 .34.03.49.15.12.09.15.22.17.37z"/></svg>` },
  discord: { color: '#5865F2', svg: `<svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%"><path d="M20.317 4.492c-1.53-.742-3.247-1.139-5.085-1.139a.06.06 0 00-.028.006l-.26.49a18.27 18.27 0 014.939 2.495.059.059 0 01.03.052c-3.296-1.688-6.6-1.688-9.764 0a.06.06 0 01.026-.05A18.27 18.27 0 018.971 6.35l-.26-.49a.06.06 0 00-.028-.006c-1.838 0-3.554.397-5.085 1.14a.06.06 0 00-.03.062c.314.961.524 1.466.524 1.466 3.296 5.035 8.191 6.289 13.13 1.3a.06.06 0 00.03-.055s.21-.505.524-1.466a.06.06 0 00-.03-.062z"/></svg>` },
  spotify: { color: '#1DB954', svg: `<svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/></svg>` },
  link: { color: '#888', svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="100%" height="100%"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>` },
}

function renderIcon(link: any, size = 20) {
  if (link.custom_icon_url) {
    return (
      <img
        src={link.custom_icon_url}
        alt=""
        style={{ width: size, height: size, borderRadius: size > 24 ? 8 : 4, objectFit: 'cover', flexShrink: 0 }}
      />
    )
  }
  const platform = PLATFORM_ICONS[link.icon?.toLowerCase()] || PLATFORM_ICONS.link
  return (
    <span
      style={{ color: platform.color, width: size, height: size, flexShrink: 0, display: 'inline-block' }}
      dangerouslySetInnerHTML={{ __html: platform.svg }}
    />
  )
}

// ─── Tiny helpers ────────────────────────────────────────────────────────────
function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-white/35 w-14 shrink-0">{label}</span>
      <input
        type="text"
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 px-2.5 py-1 bg-white/[0.04] border border-white/[0.08] rounded-lg text-[12px] text-white/80 placeholder:text-white/15 focus:border-white/15 transition-colors outline-none"
      />
    </div>
  )
}

function SliderRow({ label, value, min, max, step = 1, suffix, onChange }: {
  label: string; value: number; min: number; max: number; step?: number; suffix?: string; onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-white/35 w-14 shrink-0">{label}</span>
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="flex-1 accent-white/60"
      />
      <span className="text-[11px] text-white/40 w-10 text-right">{value}{suffix}</span>
    </div>
  )
}

type Toast = { message: string; type: 'success' | 'error' }

function ToastBanner({ toast, onDismiss }: { toast: Toast | null; onDismiss: () => void }) {
  useEffect(() => {
    if (toast) { const t = setTimeout(onDismiss, 4000); return () => clearTimeout(t) }
  }, [toast, onDismiss])
  if (!toast) return null
  return (
    <div style={{ position: 'fixed', bottom: 32, right: 32, zIndex: 100 }}>
      <div className={`px-5 py-3 rounded-xl text-[13px] font-medium shadow-xl backdrop-blur-xl border ${
        toast.type === 'success'
          ? 'bg-emerald-500/15 border-emerald-500/20 text-emerald-400'
          : 'bg-red-500/15 border-red-500/20 text-red-400'
      }`}>
        {toast.message}
      </div>
    </div>
  )
}

// ─── Link preview card ───────────────────────────────────────────────────────
function PreviewCard({ link, creator }: { link: any; creator: any }) {
  if (!link.thumbnail_url) return null
  return (
    <div
      style={{
        height: link.thumbnail_height || 200,
        width: '100%',
        background: creator.button_color || '#141414',
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
        border: '1px solid rgba(128,128,128,0.15)',
      }}
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
      {creator.link_icon_style === 'large' && (
        <div style={{ position: 'absolute', top: 12, left: 14, zIndex: 2 }}>
          {renderIcon(link, 36)}
        </div>
      )}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '32px 16px 14px',
        background: 'linear-gradient(transparent, rgba(0,0,0,0.82))',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        {creator.link_icon_style !== 'large' && renderIcon(link, 20)}
        <span style={{
          flex: 1,
          fontSize: creator.link_font_size || 14,
          fontWeight: 'bold',
          color: creator.text_color || '#ffffff',
          textAlign: (creator.link_text_align as any) || 'left',
        }}>
          {link.title || 'Link title'}
        </span>
      </div>
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────
interface Props {
  creator: any
  initialLinks: any[]
}

const EMPTY_LINK = { title: '', url: '', icon: 'link', custom_icon_url: '', thumbnail_url: '', thumbnail_position: '50', thumbnail_height: 200 }

export default function LinksManager({ creator, initialLinks }: Props) {
  const [links, setLinks] = useState<any[]>(initialLinks || [])
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [addStatus, setAddStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [newLink, setNewLink] = useState({ ...EMPTY_LINK })
  const [toast, setToast] = useState<Toast | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type })
  }

  function updateField(id: string, field: string, value: any) {
    setLinks(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l))
  }

  function moveLink(index: number, dir: -1 | 1) {
    const next = [...links]
    const swap = index + dir
    if (swap < 0 || swap >= next.length) return
    ;[next[index], next[swap]] = [next[swap], next[index]]
    setLinks(next)
  }

  async function saveAll() {
    setSaveStatus('saving')
    try {
      await Promise.all(
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
          if (l.custom_icon_url) payload.custom_icon_url = l.custom_icon_url
          const res = await fetch(`/api/admin/creators/${creator.id}/links/${l.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
          if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            throw new Error(err.error || `Failed to save "${l.title}"`)
          }
        })
      )
      setSaveStatus('saved')
      showToast('Links saved', 'success')
      setTimeout(() => setSaveStatus('idle'), 2500)
    } catch (err: any) {
      setSaveStatus('idle')
      showToast('Save failed: ' + (err.message || 'Unknown error'), 'error')
    }
  }

  async function addLink() {
    if (!newLink.title || !newLink.url) return
    setAddStatus('saving')
    const payload: any = { ...newLink, sort_order: links.length }
    if (!payload.custom_icon_url) delete payload.custom_icon_url
    const res = await fetch(`/api/admin/creators/${creator.id}/links`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      const data = await res.json()
      setLinks(prev => [...prev, data])
      setNewLink({ ...EMPTY_LINK })
      setAddStatus('saved')
      setExpandedId(data.id)
      showToast('Link added', 'success')
      setTimeout(() => setAddStatus('idle'), 2500)
    } else {
      const err = await res.json().catch(() => ({}))
      setAddStatus('idle')
      showToast('Failed: ' + (err.error || 'Unknown error'), 'error')
    }
  }

  async function deleteLink(id: string) {
    const removed = links.find(l => l.id === id)
    setLinks(prev => prev.filter(l => l.id !== id))
    if (expandedId === id) setExpandedId(null)
    const res = await fetch(`/api/admin/creators/${creator.id}/links/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      if (removed) setLinks(prev => [...prev, removed].sort((a: any, b: any) => a.sort_order - b.sort_order))
      showToast('Failed to delete link', 'error')
    } else {
      showToast('Link removed', 'success')
    }
  }

  async function toggleActive(id: string, is_active: boolean) {
    await fetch(`/api/admin/creators/${creator.id}/links/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active }),
    })
    setLinks(prev => prev.map(l => l.id === id ? { ...l, is_active } : l))
  }

  return (
    <div className="space-y-8">
      <ToastBanner toast={toast} onDismiss={() => setToast(null)} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <a href="/admin/creators" className="text-[12px] text-white/35 hover:text-white/60 transition-colors">
            ← Back
          </a>
          <h1 className="text-xl font-semibold tracking-tight mt-1">{creator.display_name}</h1>
          <p className="text-[12px] text-white/30 mt-0.5">Manage links</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`/admin/creators/${creator.id}/edit`}
            className="px-3 py-1.5 text-[12px] text-white/40 border border-white/[0.08] rounded-lg hover:bg-white/[0.04] transition-colors"
          >
            Edit profile
          </a>
          <a
            href={creator.custom_domain ? `https://${creator.custom_domain}` : `/${creator.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 text-[12px] text-white/40 border border-white/[0.08] rounded-lg hover:bg-white/[0.04] transition-colors"
          >
            Preview ↗
          </a>
          <button
            onClick={saveAll}
            disabled={saveStatus === 'saving'}
            className="px-4 py-1.5 bg-white text-black text-[12px] font-medium rounded-lg hover:bg-white/90 transition-colors disabled:opacity-40"
          >
            {saveStatus === 'saving' ? 'Saving…' : saveStatus === 'saved' ? '✓ Saved' : 'Save changes'}
          </button>
        </div>
      </div>

      {/* Existing links */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-[12px] text-white/30 font-medium uppercase tracking-widest">
            {links.length} link{links.length !== 1 ? 's' : ''}
          </p>
        </div>

        {links.length === 0 && (
          <div className="py-12 text-center text-white/20 text-[13px] border border-dashed border-white/[0.06] rounded-xl">
            No links yet — add one below
          </div>
        )}

        {links.map((link: any, i: number) => {
          const expanded = expandedId === link.id
          return (
            <div key={link.id} className="bg-white/[0.03] border border-white/[0.07] rounded-xl overflow-hidden">
              {/* Row summary */}
              <div className="flex items-center gap-3 px-4 py-3">
                {/* Up/down */}
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button
                    onClick={() => moveLink(i, -1)}
                    disabled={i === 0}
                    className="text-white/20 hover:text-white/60 disabled:opacity-20 transition-colors text-[10px] leading-none"
                  >▲</button>
                  <button
                    onClick={() => moveLink(i, 1)}
                    disabled={i === links.length - 1}
                    className="text-white/20 hover:text-white/60 disabled:opacity-20 transition-colors text-[10px] leading-none"
                  >▼</button>
                </div>

                {/* Icon preview */}
                <div className="shrink-0 w-6 h-6">
                  {renderIcon(link, 20)}
                </div>

                {/* Title + URL */}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-white/85 truncate">{link.title || <span className="text-white/25">Untitled</span>}</p>
                  <p className="text-[11px] text-white/30 truncate">{link.url}</p>
                </div>

                {/* Active toggle */}
                <button
                  onClick={() => toggleActive(link.id, !link.is_active)}
                  className={`w-8 h-[18px] rounded-full transition-colors relative shrink-0 ${link.is_active ? 'bg-white/90' : 'bg-white/10'}`}
                >
                  <div className={`w-3.5 h-3.5 rounded-full absolute top-[2px] transition-all ${
                    link.is_active ? 'left-[17px] bg-black' : 'left-[2px] bg-white/30'
                  }`} />
                </button>

                {/* Expand / collapse */}
                <button
                  onClick={() => setExpandedId(expanded ? null : link.id)}
                  className="px-3 py-1 text-[11px] text-white/35 border border-white/[0.06] rounded-lg hover:bg-white/[0.04] transition-colors shrink-0"
                >
                  {expanded ? 'Collapse' : 'Edit'}
                </button>

                {/* Delete */}
                <button
                  onClick={() => deleteLink(link.id)}
                  className="text-white/20 hover:text-red-400/70 text-[11px] transition-colors shrink-0"
                >
                  Remove
                </button>
              </div>

              {/* Expanded settings + preview */}
              {expanded && (
                <div className="border-t border-white/[0.06] p-4">
                  <div className="flex gap-5 items-start">
                    {/* Settings column */}
                    <div className="flex-1 space-y-2.5">
                      <Field label="Title" value={link.title} onChange={v => updateField(link.id, 'title', v)} placeholder="OnlyFans" />
                      <Field label="URL" value={link.url} onChange={v => updateField(link.id, 'url', v)} placeholder="https://..." />
                      <Field label="Image" value={link.thumbnail_url || ''} onChange={v => updateField(link.id, 'thumbnail_url', v)} placeholder="Paste image URL…" />

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-white/35 w-14 shrink-0">Icon</span>
                        <select
                          value={link.icon || 'link'}
                          onChange={e => updateField(link.id, 'icon', e.target.value)}
                          className="flex-1 px-2.5 py-1 bg-white/[0.04] border border-white/[0.08] rounded-lg text-[12px] text-white/80 focus:border-white/15 transition-colors outline-none"
                        >
                          {ICON_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>

                      {link.icon === 'custom' && (
                        <Field label="Icon URL" value={link.custom_icon_url || ''} onChange={v => updateField(link.id, 'custom_icon_url', v)} placeholder="https://..." />
                      )}

                      {link.thumbnail_url && (
                        <>
                          <SliderRow
                            label="Height"
                            value={link.thumbnail_height || 200}
                            min={100} max={400} step={10} suffix="px"
                            onChange={v => updateField(link.id, 'thumbnail_height', v)}
                          />
                          <SliderRow
                            label="Position"
                            value={parseInt(link.thumbnail_position || '50') || 50}
                            min={0} max={100} suffix="%"
                            onChange={v => updateField(link.id, 'thumbnail_position', String(v))}
                          />
                        </>
                      )}
                    </div>

                    {/* Preview column */}
                    {link.thumbnail_url && (
                      <div className="shrink-0" style={{ width: 340 }}>
                        <p style={{ fontSize: 11, color: 'rgba(128,128,128,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500, marginBottom: 8 }}>Preview</p>
                        <PreviewCard link={link} creator={creator} />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Add new link */}
      <div className="border border-dashed border-white/[0.1] rounded-xl p-5 space-y-4">
        <p className="text-[12px] text-white/40 font-medium">Add link</p>
        <div className="flex gap-5 items-start">
          {/* Form */}
          <div className="flex-1 space-y-2.5">
            <Field label="Title" value={newLink.title} onChange={v => setNewLink(p => ({ ...p, title: v }))} placeholder="OnlyFans (free for a short time)" />
            <Field label="URL" value={newLink.url} onChange={v => setNewLink(p => ({ ...p, url: v }))} placeholder="https://onlyfans.com/..." />
            <Field label="Image" value={newLink.thumbnail_url} onChange={v => setNewLink(p => ({ ...p, thumbnail_url: v }))} placeholder="Optional thumbnail URL" />

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-white/35 w-14 shrink-0">Icon</span>
              <select
                value={newLink.icon}
                onChange={e => setNewLink(p => ({ ...p, icon: e.target.value }))}
                className="flex-1 px-2.5 py-1 bg-white/[0.04] border border-white/[0.08] rounded-lg text-[12px] text-white/80 focus:border-white/15 transition-colors outline-none"
              >
                {ICON_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            {newLink.icon === 'custom' && (
              <Field label="Icon URL" value={newLink.custom_icon_url} onChange={v => setNewLink(p => ({ ...p, custom_icon_url: v }))} placeholder="https://..." />
            )}

            {newLink.thumbnail_url && (
              <>
                <SliderRow
                  label="Height"
                  value={newLink.thumbnail_height}
                  min={100} max={400} step={10} suffix="px"
                  onChange={v => setNewLink(p => ({ ...p, thumbnail_height: v }))}
                />
                <SliderRow
                  label="Position"
                  value={parseInt(newLink.thumbnail_position) || 50}
                  min={0} max={100} suffix="%"
                  onChange={v => setNewLink(p => ({ ...p, thumbnail_position: String(v) }))}
                />
              </>
            )}

            <button
              onClick={addLink}
              disabled={addStatus === 'saving' || !newLink.title || !newLink.url}
              className="mt-1 px-4 py-1.5 bg-white text-black text-[12px] font-medium rounded-lg hover:bg-white/90 transition-colors disabled:opacity-30"
            >
              {addStatus === 'saving' ? 'Adding…' : addStatus === 'saved' ? '✓ Added' : 'Add link'}
            </button>
          </div>

          {/* Live preview for new link */}
          {newLink.thumbnail_url && (
            <div className="shrink-0" style={{ width: 340 }}>
              <p style={{ fontSize: 11, color: 'rgba(128,128,128,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500, marginBottom: 8 }}>Preview</p>
              <PreviewCard link={newLink} creator={creator} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
