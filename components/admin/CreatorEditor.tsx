'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine } from 'recharts'
import { useTheme } from './ThemeProvider'
import SocialTab from './SocialTab'

const ICON_OPTIONS = ['onlyfans', 'fansly', 'instagram', 'twitter', 'tiktok', 'snapchat', 'youtube', 'reddit', 'twitch', 'telegram', 'discord', 'spotify', 'link', 'custom']

const PLATFORM_ICONS: Record<string, { color: string; svg: string }> = {
  onlyfans: { color: '#00AFF0', svg: `<img src="https://sogytagzrkfuvwrqzqgk.supabase.co/storage/v1/object/public/creators/Logos/OFIconBlue.svg" width="100%" height="100%" style="object-fit:contain" />` },
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

function renderPreviewIcon(link: any, size = 20) {
  if (link.custom_icon_url) {
    return <img src={link.custom_icon_url} alt="" style={{ width: size, height: size, borderRadius: size > 24 ? 8 : 4, objectFit: 'cover', flexShrink: 0 }} />
  }
  const platform = PLATFORM_ICONS[link.icon?.toLowerCase()] || PLATFORM_ICONS.link
  return <span style={{ color: platform.color, width: size, height: size, flexShrink: 0, display: 'inline-block' }} dangerouslySetInnerHTML={{ __html: platform.svg }} />
}

type Toast = { message: string; type: 'success' | 'error' }

function ToastNotification({ toast, onDismiss }: { toast: Toast | null; onDismiss: () => void }) {
  useEffect(() => {
    if (toast) {
      const t = setTimeout(onDismiss, 4000)
      return () => clearTimeout(t)
    }
  }, [toast, onDismiss])

  if (!toast) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 32,
        right: 32,
        zIndex: 100,
        animation: 'toast-in 0.3s ease-out',
      }}
    >
      <div className={`px-5 py-3 rounded-xl text-[13px] font-medium shadow-xl backdrop-blur-xl border ${
        toast.type === 'success'
          ? 'bg-emerald-500/15 border-emerald-500/20 text-emerald-400'
          : 'bg-red-500/15 border-red-500/20 text-red-400'
      }`}>
        <div className="flex items-center gap-2.5">
          {toast.type === 'success' ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          )}
          {toast.message}
        </div>
      </div>
    </div>
  )
}

interface Props {
  creator: any
  links: any[]
  analytics: any
  rawClicks: any[]
  isNew: boolean
  mode?: 'edit' | 'analysis'
}

export default function CreatorEditor({ creator: initialCreator, links: initialLinks, analytics, rawClicks = [], isNew, mode = 'edit' }: Props) {
  const router = useRouter()
  const { resolved: themeMode } = useTheme()
  const isLight = themeMode === 'light'
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'links' | 'social' | 'analytics'>(
    mode === 'analysis' ? 'social' : 'profile'
  )

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type })
  }

  const [creator, setCreator] = useState(initialCreator || {
    slug: '', display_name: '', username: '', bio: '', avatar_url: '',
    background_color: '#080808', button_color: '#1a1a1a', text_color: '#ffffff',
    button_style: 'rounded', show_verified: true, custom_domain: '',
    avatar_position: 'top', hero_height: 'large', hero_position: 50, hero_scale: 100, is_active: true,
    background_image_url: '',
    link_font_size: 14, link_text_align: 'left', link_icon_style: 'inline',
    show_footer: true,
  })
  const [linkSaveStatus, setLinkSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [uploadingField, setUploadingField] = useState<string | null>(null)

  // ─── Infloww Creator Mapping ───
  const [inflowwCreators, setInflowwCreators] = useState<{ infloww_id: string; name: string; user_name: string }[]>([])
  const [inflowwMapping, setInflowwMapping] = useState<string>('') // infloww_creator_id
  const [inflowwMappingSaving, setInflowwMappingSaving] = useState(false)

  useEffect(() => {
    if (isNew || !initialCreator?.id) return
    // Fetch cached Infloww creators
    fetch('/api/admin/revenue/infloww-creators-cached')
      .then(r => r.json())
      .then(j => { if (j.creators) setInflowwCreators(j.creators) })
      .catch(() => {})
    // Fetch current mapping for this creator
    fetch(`/api/admin/revenue/mapping?creator_id=${initialCreator.id}`)
      .then(r => r.json())
      .then(j => {
        const m = (j.mappings || []).find((m: any) => m.creator_id === initialCreator.id)
        if (m) setInflowwMapping(m.infloww_creator_id)
      })
      .catch(() => {})
  }, [isNew, initialCreator?.id])

  async function saveInflowwMapping(inflowwId: string) {
    if (!initialCreator?.id) return
    setInflowwMappingSaving(true)
    setInflowwMapping(inflowwId)
    try {
      if (!inflowwId) {
        await fetch(`/api/admin/revenue/mapping?creator_id=${initialCreator.id}`, { method: 'DELETE' })
      } else {
        const ic = inflowwCreators.find(c => c.infloww_id === inflowwId)
        await fetch('/api/admin/revenue/mapping', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ creator_id: initialCreator.id, infloww_creator_id: inflowwId, infloww_creator_name: ic?.name || '' }),
        })
      }
      showToast('Infloww mapping saved', 'success')
    } catch { showToast('Failed to save mapping', 'error') }
    finally { setInflowwMappingSaving(false) }
  }

  async function uploadImage(file: File, field: string) {
    setUploadingField(field)
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('bucket', 'images')
      const res = await fetch('/api/admin/upload', { method: 'POST', body: form })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Upload failed')
      }
      const { url } = await res.json()
      updateCreator(field, url)
      showToast('Image uploaded', 'success')
    } catch (e: any) {
      showToast(e.message || 'Upload failed', 'error')
    }
    setUploadingField(null)
  }

  async function uploadLinkImage(file: File, field: string): Promise<string | null> {
    setUploadingField(field)
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('bucket', 'images')
      const res = await fetch('/api/admin/upload', { method: 'POST', body: form })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Upload failed')
      }
      const { url } = await res.json()
      showToast('Image uploaded', 'success')
      return url
    } catch (e: any) {
      showToast(e.message || 'Upload failed', 'error')
      return null
    } finally {
      setUploadingField(null)
    }
  }

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
    const totalViews = filteredClicks.filter((c: any) => c.type === 'page_view').length
    const totalClicks = filteredClicks.filter((c: any) => c.type === 'link_click').length
    const ctr = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0

    // Detect if single day selected (less than 36 hours between start and end)
    const isSingleDay = (dateEnd.getTime() - dateStart.getTime()) < 36 * 60 * 60 * 1000

    // Chart data — hourly for single day, daily otherwise
    const chartMap = new Map<string, { views: number; clicks: number }>()

    if (isSingleDay) {
      // Pre-fill all 24 hours so chart has no gaps
      for (let h = 0; h < 24; h++) {
        const label = `${h.toString().padStart(2, '0')}:00`
        chartMap.set(label, { views: 0, clicks: 0 })
      }
      filteredClicks.forEach((click: any) => {
        const d = new Date(click.created_at)
        const label = `${d.getHours().toString().padStart(2, '0')}:00`
        const current = chartMap.get(label) || { views: 0, clicks: 0 }
        if (click.type === 'link_click') current.clicks++
        current.views++
        chartMap.set(label, current)
      })
    } else {
      filteredClicks.forEach((click: any) => {
        const date = new Date(click.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        const current = chartMap.get(date) || { views: 0, clicks: 0 }
        if (click.type === 'link_click') current.clicks++
        current.views++
        chartMap.set(date, current)
      })
    }
    const dailyData = Array.from(chartMap.entries()).map(([date, data]) => ({ date, ...data }))

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
      isSingleDay,
    }
  }, [filteredClicks])

  async function saveCreator() {
    if (!creator.display_name || !creator.slug) {
      showToast('Display name and slug are required', 'error')
      return
    }
    setSaving(true)
    try {
      const method = isNew ? 'POST' : 'PUT'
      const url = isNew ? '/api/admin/creators' : `/api/admin/creators/${creator.id}`
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(creator) })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `Failed to ${isNew ? 'create' : 'save'} creator`)
      }
      const data = await res.json()
      showToast(isNew ? 'Creator created' : 'Changes saved', 'success')
      if (isNew) router.push(`/admin/creators/${data.id}`)
      else router.refresh()
    } catch (err: any) {
      showToast(err.message || 'Something went wrong', 'error')
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
      showToast('Links saved', 'success')
      setTimeout(() => setLinkSaveStatus('idle'), 2500)
    } catch (err: any) {
      setLinkSaveStatus('idle')
      showToast('Save failed: ' + (err.message || 'Unknown error'), 'error')
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
      showToast('Link added', 'success')
      setTimeout(() => setAddLinkStatus('idle'), 2500)
    } else {
      const err = await res.json().catch(() => ({}))
      setAddLinkStatus('idle')
      showToast('Failed to add link: ' + (err.error || 'Unknown error'), 'error')
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
      showToast('Failed to delete link', 'error')
      return
    }
    showToast('Link removed', 'success')
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
      <ToastNotification toast={toast} onDismiss={() => setToast(null)} />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <a href="/admin" className="text-[12px] text-white/35 hover:text-white/60 transition-colors">
            ← Dashboard
          </a>
          <h1 className="text-xl font-semibold tracking-tight mt-1">
            {isNew ? 'New Creator' : creator.display_name}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {!isNew && mode === 'analysis' && (
            <>
              <a
                href={`/admin/creators/${creator.id}`}
                className="px-4 py-1.5 text-[12px] text-white/50 border border-white/[0.08] rounded-lg hover:bg-white/[0.05] transition-colors"
              >
                Settings
              </a>
              <a
                href={`/admin/conversions?creator=${creator.id}`}
                className="px-4 py-1.5 text-[12px] text-white/50 border border-white/[0.08] rounded-lg hover:bg-white/[0.05] transition-colors"
              >
                View Conversions
              </a>
            </>
          )}
          {!isNew && mode === 'edit' && (
            <>
              <a
                href={`/admin/creators/${creator.id}/analysis`}
                className="px-4 py-1.5 text-[12px] text-white/50 border border-white/[0.08] rounded-lg hover:bg-white/[0.05] transition-colors"
              >
                View Analysis
              </a>
              <a
                href={creator.custom_domain ? `https://${creator.custom_domain}` : `/${creator.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-1.5 text-[12px] text-white/50 border border-white/[0.08] rounded-lg hover:bg-white/[0.05] transition-colors"
              >
                Preview ↗
              </a>
            </>
          )}
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex items-center gap-6 border-b border-white/[0.08] pb-px">
        {mode === 'edit' && (['profile', 'links'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`pb-2.5 text-[13px] font-medium transition-colors border-b-2 -mb-px ${
              activeSubTab === tab
                ? 'text-white border-white'
                : 'text-white/40 border-transparent hover:text-white/60'
            }`}
          >
            {tab === 'profile' ? 'Profile' : 'Links'}
          </button>
        ))}
        {mode === 'analysis' && (['social', 'analytics'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`pb-2.5 text-[13px] font-medium transition-colors border-b-2 -mb-px ${
              activeSubTab === tab
                ? 'text-white border-white'
                : 'text-white/40 border-transparent hover:text-white/60'
            }`}
          >
            {tab === 'social' ? 'Social Media' : 'Link Analysis'}
          </button>
        ))}
      </div>

      {/* ─── PROFILE SUB-TAB ─── */}
      {mode === 'edit' && activeSubTab === 'profile' && (
        <div className="space-y-3">
          <Section title="General" defaultOpen={true}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Display Name" value={creator.display_name} onChange={v => updateCreator('display_name', v)} />
              <Field label="Slug" value={creator.slug} onChange={v => updateCreator('slug', v.toLowerCase().replace(/\s/g, ''))} placeholder="lilybrown" />
              <Field label="Username" value={creator.username} onChange={v => updateCreator('username', v)} placeholder="@lilybrown" />
              <Field label="Bio" value={creator.bio} onChange={v => updateCreator('bio', v)} />
              <div className="space-y-1">
                <Field label="Avatar URL" value={creator.avatar_url} onChange={v => updateCreator('avatar_url', v)} placeholder="https://..." />
                <label className="flex items-center gap-2 cursor-pointer w-fit">
                  <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f, 'avatar_url') }} />
                  <span className="text-[11px] text-white/40 hover:text-white/70 transition-colors underline underline-offset-2">
                    {uploadingField === 'avatar_url' ? 'Uploading…' : '↑ Upload image instead'}
                  </span>
                </label>
              </div>
              <Field label="Custom Domain" value={creator.custom_domain} onChange={v => updateCreator('custom_domain', v)} placeholder="lilybrown.com" />
              <div className="space-y-1">
                <Field label="Background Image" value={creator.background_image_url} onChange={v => updateCreator('background_image_url', v)} placeholder="https://..." />
                <label className="flex items-center gap-2 cursor-pointer w-fit">
                  <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f, 'background_image_url') }} />
                  <span className="text-[11px] text-white/40 hover:text-white/70 transition-colors underline underline-offset-2">
                    {uploadingField === 'background_image_url' ? 'Uploading…' : '↑ Upload image instead'}
                  </span>
                </label>
              </div>
            </div>
          </Section>

          <Section title="Appearance" defaultOpen={false}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              <ColorField label="Background" value={creator.background_color} onChange={v => updateCreator('background_color', v)} />
              <ColorField label="Buttons" value={creator.button_color} onChange={v => updateCreator('button_color', v)} />
              <ColorField label="Text" value={creator.text_color} onChange={v => updateCreator('text_color', v)} />
              <SelectField label="Button Style" value={creator.button_style} onChange={v => updateCreator('button_style', v)}
                options={[['rounded', 'Rounded'], ['pill', 'Pill'], ['sharp', 'Sharp']]} />
            </div>
          </Section>

          <Section title="Link Text & Icons" defaultOpen={false}>
            <div className="space-y-4">
              <SliderField
                label="Font size"
                value={creator.link_font_size !== undefined ? creator.link_font_size : 14}
                min={10}
                max={22}
                suffix="px"
                onChange={v => updateCreator('link_font_size', v)}
              />
              <SelectField label="Text alignment" value={creator.link_text_align || 'left'} onChange={v => updateCreator('link_text_align', v)}
                options={[['left', 'Left'], ['center', 'Centered']]} />
              <SelectField label="Icon style" value={creator.link_icon_style || 'inline'} onChange={v => updateCreator('link_icon_style', v)}
                options={[['inline', 'Inline (next to text)'], ['large', 'Large (top-left)']]} />
            </div>
          </Section>

          <Section title="Hero Image" defaultOpen={false}>
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

          {!isNew && (
            <Section title="Infloww" defaultOpen={false}>
              <div className="space-y-2">
                <p className={`text-[12px] ${isLight ? 'text-black/40' : 'text-white/40'}`}>
                  Link this creator to their Infloww profile for revenue tracking.
                  {inflowwCreators.length === 0 && ' Fetch revenue data at least once to populate this list.'}
                </p>
                {inflowwCreators.length > 0 && (
                  <select
                    value={inflowwMapping}
                    onChange={e => saveInflowwMapping(e.target.value)}
                    disabled={inflowwMappingSaving}
                    className={`w-full max-w-md rounded-lg px-3 py-2 text-[13px] outline-none transition-all ${
                      isLight
                        ? 'bg-white border border-black/10 text-black/80 focus:border-black/30'
                        : 'bg-white/[0.05] border border-white/10 text-white/90 focus:border-white/30'
                    } ${inflowwMappingSaving ? 'opacity-50' : ''}`}
                  >
                    <option value="">— Not mapped —</option>
                    {inflowwCreators.map(ic => (
                      <option key={ic.infloww_id} value={ic.infloww_id}>
                        {ic.name} ({ic.user_name})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </Section>
          )}

          <Section title="Options" defaultOpen={false}>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
              <Toggle label="Verified badge" checked={creator.show_verified} onChange={v => updateCreator('show_verified', v)} />
              <Toggle label="Active" checked={creator.is_active} onChange={v => updateCreator('is_active', v)} />
              <Toggle label="Footer links" checked={creator.show_footer !== false} onChange={v => updateCreator('show_footer', v)} />
            </div>
          </Section>

          <button
            onClick={saveCreator}
            disabled={saving}
            className="px-5 py-2 bg-white text-black text-[13px] font-medium rounded-lg hover:bg-white/90 transition-colors disabled:opacity-40 mt-4"
          >
            {saving ? 'Saving…' : isNew ? 'Create' : 'Save changes'}
          </button>
        </div>
      )}

      {/* ─── LINKS SUB-TAB ─── */}
      {mode === 'edit' && activeSubTab === 'links' && (
        <div className="border-t border-white/[0.08] pt-6 space-y-5">
          {/* Save bar */}
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-white/40">
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
          <div className="space-y-5">
            {links.map((link: any, i: number) => (
              <div key={link.id} className="flex gap-5 items-start">
                {/* Left: settings box (max 50%) */}
                <div className="w-1/2 max-w-[50%] bg-white/[0.03] border border-white/[0.07] rounded-xl p-5 space-y-3">
                  {/* Link header */}
                  <div className="flex items-center gap-3">
                    <span className="text-white/25 text-[12px] font-medium w-5 text-center shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-white/90 truncate">{link.title}</p>
                      <p className="text-[11px] text-white/35 truncate mt-0.5">{link.url}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
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
                        className="text-white/25 hover:text-red-400/70 text-[11px] transition-colors ml-1"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Settings */}
                  <div className="space-y-2.5 pt-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-white/35 w-14 shrink-0">Icon</span>
                      <select
                        value={link.icon || 'link'}
                        onChange={e => updateLinkField(link.id, 'icon', e.target.value)}
                        className="flex-1 px-2.5 py-1 bg-white/[0.04] border border-white/[0.08] rounded-lg text-[12px] text-white/80 focus:border-white/15 transition-colors"
                      >
                        {ICON_OPTIONS.map(o => (
                          <option key={o} value={o}>{o}</option>
                        ))}
                      </select>
                    </div>

                    {link.icon === 'custom' && (
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-white/35 w-14 shrink-0">Icon URL</span>
                        <input
                          type="text"
                          value={link.custom_icon_url || ''}
                          onChange={e => updateLinkField(link.id, 'custom_icon_url', e.target.value)}
                          placeholder="https://..."
                          className="flex-1 px-2.5 py-1 bg-white/[0.04] border border-white/[0.08] rounded-lg text-[12px] text-white/80 placeholder:text-white/15 focus:border-white/15 transition-colors"
                        />
                      </div>
                    )}

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-white/35 w-14 shrink-0">Image</span>
                        <input
                          type="text"
                          value={link.thumbnail_url || ''}
                          onChange={e => updateLinkField(link.id, 'thumbnail_url', e.target.value)}
                          placeholder="Paste image URL…"
                          className="flex-1 px-2.5 py-1 bg-white/[0.04] border border-white/[0.08] rounded-lg text-[12px] text-white/80 placeholder:text-white/15 focus:border-white/15 transition-colors"
                        />
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer w-fit ml-16">
                        <input type="file" accept="image/*" className="hidden" onChange={async e => { const f = e.target.files?.[0]; if (f) { const url = await uploadLinkImage(f, `thumbnail_${link.id}`); if (url) updateLinkField(link.id, 'thumbnail_url', url); } }} />
                        <span className="text-[11px] text-white/40 hover:text-white/70 transition-colors underline underline-offset-2">
                          {uploadingField === `thumbnail_${link.id}` ? 'Uploading…' : '↑ Upload image instead'}
                        </span>
                      </label>
                    </div>

                    {link.thumbnail_url && (
                      <>
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
                      </>
                    )}
                  </div>
                </div>

                {/* Right: preview — always uses creator's profile settings, never theme */}
                {link.thumbnail_url && (
                  <div className="shrink-0" style={{ width: 468 }}>
                    <p style={{ fontSize: 11, color: 'rgba(128,128,128,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500, marginBottom: 8 }}>Preview</p>
                    <div
                      style={{
                        height: link.thumbnail_height || 200,
                        width: 468,
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
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          objectPosition: `center ${parseInt(link.thumbnail_position || '50') || 50}%`,
                          display: 'block',
                        }}
                      />
                      {creator.link_icon_style === 'large' && (
                        <div style={{ position: 'absolute', top: 12, left: 14, zIndex: 2 }}>
                          {renderPreviewIcon(link, 36)}
                        </div>
                      )}
                      <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: '32px 16px 14px',
                        background: 'linear-gradient(transparent, rgba(0,0,0,0.82))',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                      }}>
                        {creator.link_icon_style !== 'large' && renderPreviewIcon(link, 20)}
                        <span style={{
                          flex: 1,
                          fontSize: creator.link_font_size || 14,
                          fontWeight: 'bold',
                          color: creator.text_color || '#ffffff',
                          textAlign: (creator.link_text_align as any) || 'left',
                        }}>{link.title}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add new link */}
          {!isNew && (
            <div className="flex gap-5 items-start">
              {/* Left: add form in box (max 50%) */}
              <div className="w-1/2 max-w-[50%] border border-dashed border-white/[0.1] rounded-xl p-5 space-y-4">
                <p className="text-[12px] text-white/40 font-medium">Add link</p>
                <div className="grid grid-cols-1 gap-3">
                  <Field label="Title" value={newLink.title} onChange={v => setNewLink(p => ({ ...p, title: v }))} placeholder="OnlyFans (free for a short time)" />
                  <Field label="URL" value={newLink.url} onChange={v => setNewLink(p => ({ ...p, url: v }))} placeholder="https://onlyfans.com/..." />
                  <div className="space-y-1">
                    <Field label="Image URL" value={newLink.thumbnail_url} onChange={v => setNewLink(p => ({ ...p, thumbnail_url: v }))} placeholder="Optional" />
                    <label className="flex items-center gap-2 cursor-pointer w-fit ml-16">
                      <input type="file" accept="image/*" className="hidden" onChange={async e => { const f = e.target.files?.[0]; if (f) { const url = await uploadLinkImage(f, 'thumbnail_new'); if (url) setNewLink(p => ({ ...p, thumbnail_url: url })); } }} />
                      <span className="text-[11px] text-white/40 hover:text-white/70 transition-colors underline underline-offset-2">
                        {uploadingField === 'thumbnail_new' ? 'Uploading…' : '↑ Upload image instead'}
                      </span>
                    </label>
                  </div>
                  <SelectField label="Icon" value={newLink.icon} onChange={v => setNewLink(p => ({ ...p, icon: v }))}
                    options={ICON_OPTIONS.map(o => [o, o])} />
                </div>

                {newLink.icon === 'custom' && (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-white/20 w-14 shrink-0">Icon URL</span>
                    <input
                      type="text"
                      value={newLink.custom_icon_url || ''}
                      onChange={e => setNewLink(p => ({ ...p, custom_icon_url: e.target.value }))}
                      placeholder="https://..."
                      className="flex-1 px-2.5 py-1 bg-white/[0.04] border border-white/[0.08] rounded-lg text-[12px] text-white/80 placeholder:text-white/15 focus:border-white/15 transition-colors"
                    />
                  </div>
                )}

                {newLink.thumbnail_url && (
                  <div className="space-y-2.5">
                    <SliderField label="Height" value={newLink.thumbnail_height} min={100} max={400} step={10} suffix="px"
                      onChange={v => setNewLink(p => ({ ...p, thumbnail_height: v }))} />
                    <SliderField label="Position" value={parseInt(newLink.thumbnail_position) || 50} min={0} max={100} suffix="%"
                      onChange={v => setNewLink(p => ({ ...p, thumbnail_position: String(v) }))} />
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

              {/* Right: preview outside box — always uses creator's profile settings, never theme */}
              {newLink.thumbnail_url && (
                <div className="shrink-0" style={{ width: 468 }}>
                  <p style={{ fontSize: 11, color: 'rgba(128,128,128,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500, marginBottom: 8 }}>Preview</p>
                  <div
                    style={{
                      height: newLink.thumbnail_height,
                      width: 468,
                      background: creator.button_color || '#141414',
                      borderRadius: 16,
                      overflow: 'hidden',
                      position: 'relative',
                      border: '1px solid rgba(128,128,128,0.15)',
                    }}
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
                    {creator.link_icon_style === 'large' && (
                      <div style={{ position: 'absolute', top: 12, left: 14, zIndex: 2 }}>
                        {renderPreviewIcon(newLink, 36)}
                      </div>
                    )}
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      padding: '32px 16px 14px',
                      background: 'linear-gradient(transparent, rgba(0,0,0,0.82))',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                    }}>
                      {creator.link_icon_style !== 'large' && renderPreviewIcon(newLink, 20)}
                      <span style={{
                        flex: 1,
                        fontSize: creator.link_font_size || 14,
                        fontWeight: 'bold',
                        color: creator.text_color || '#ffffff',
                        textAlign: (creator.link_text_align as any) || 'left',
                      }}>{newLink.title || 'Link title'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {isNew && (
            <p className="text-white/20 text-[13px]">Save the creator first, then add links.</p>
          )}
        </div>
      )}

      {/* ─── LINK ANALYSIS SUB-TAB ─── */}
      {mode === 'analysis' && activeSubTab === 'analytics' && (
        <div className="space-y-6">
          {/* Date range trigger — popup only */}
          <div className="relative inline-block">
            <button
              onClick={() => {
                setCustomStart(dateStart.toISOString().split('T')[0])
                setCustomEnd(dateEnd.toISOString().split('T')[0])
                setShowDatePicker(!showDatePicker)
              }}
              className="flex items-center gap-2.5 px-4 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg hover:bg-white/[0.06] transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/30">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span className="text-[13px] text-white/70 font-medium">{dateLabel}</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white/25">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {showDatePicker && (
              <div
                ref={datePickerRef}
                className="absolute left-0 top-full mt-2 z-50 bg-[#0e0e0e] border border-white/[0.08] rounded-2xl p-0 shadow-2xl shadow-black/60"
                style={{ width: 340 }}
              >
                {/* Quick presets */}
                <div className="p-4 pb-3 border-b border-white/[0.06]">
                  <p className="text-[11px] text-white/25 uppercase tracking-widest font-medium mb-3">Quick select</p>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: 'Today', fn: () => { const s = new Date(); s.setHours(0,0,0,0); applyPreset('Today', s, new Date()) } },
                      { label: 'Yesterday', fn: () => { const s = new Date(); s.setDate(s.getDate() - 1); s.setHours(0,0,0,0); const e = new Date(s); e.setHours(23,59,59,999); applyPreset('Yesterday', s, e) } },
                      { label: 'Last 7 days', fn: () => { const s = new Date(); s.setDate(s.getDate() - 7); applyPreset('Last 7 days', s, new Date()) } },
                      { label: 'Last 30 days', fn: () => { const s = new Date(); s.setDate(s.getDate() - 30); applyPreset('Last 30 days', s, new Date()) } },
                    ].map(p => (
                      <button
                        key={p.label}
                        onClick={p.fn}
                        className={`px-3 py-1.5 text-[11px] font-medium rounded-lg transition-all ${
                          dateLabel === p.label
                            ? 'bg-white text-black'
                            : 'bg-white/[0.04] text-white/40 hover:bg-white/[0.08] hover:text-white/60'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Month grid */}
                <div className="p-4 pb-3 border-b border-white/[0.06]">
                  <p className="text-[11px] text-white/25 uppercase tracking-widest font-medium mb-3">By month</p>
                  <div className="grid grid-cols-4 gap-1.5">
                    {monthOptions.map(m => {
                      const now = new Date()
                      const mStart = new Date(now.getFullYear(), now.getMonth() - m.offset, 1)
                      const mEnd = new Date(mStart.getFullYear(), mStart.getMonth() + 1, 0, 23, 59, 59)
                      const isActive = dateStart.getTime() === mStart.getTime() && dateEnd.getTime() === mEnd.getTime()
                      return (
                        <button
                          key={m.offset}
                          onClick={() => selectMonth(m.offset)}
                          className={`px-2 py-1.5 text-[11px] font-medium rounded-lg transition-all ${
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
                </div>

                {/* Custom dates */}
                <div className="p-4">
                  <p className="text-[11px] text-white/25 uppercase tracking-widest font-medium mb-3">Custom range</p>
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <label className="text-[10px] text-white/20 mb-1 block">From</label>
                      <input
                        type="date"
                        value={customStart}
                        onChange={e => setCustomStart(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-[12px] text-white/80 focus:border-white/20 transition-colors"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] text-white/20 mb-1 block">To</label>
                      <input
                        type="date"
                        value={customEnd}
                        onChange={e => setCustomEnd(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-[12px] text-white/80 focus:border-white/20 transition-colors"
                      />
                    </div>
                    <button
                      onClick={applyCustomRange}
                      disabled={!customStart || !customEnd}
                      className="px-4 py-1.5 bg-white text-black text-[12px] font-medium rounded-lg hover:bg-white/90 transition-colors disabled:opacity-30 shrink-0"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Stat label="Page views" value={computedAnalytics.totalViews.toLocaleString()} />
            <Stat label="Link clicks" value={computedAnalytics.totalClicks.toLocaleString()} />
            <Stat label="CTR" value={computedAnalytics.totalViews > 0 ? `${Math.round(computedAnalytics.ctr)}%` : '—'} />
            <Stat label="Date range" value={filteredClicks.length > 0 ? `${filteredClicks.length} events` : '—'} />
          </div>

          {/* Chart */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-6">
            <p className="text-[12px] text-white/35 mb-4">Activity</p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={computedAnalytics.dailyData}>
                <defs>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <XAxis dataKey="date" tick={{ fill: isLight ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.25)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: isLight ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.25)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: isLight ? '#fff' : '#111',
                    border: isLight ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8,
                    fontSize: 12,
                    color: isLight ? '#1a1a1a' : '#fff',
                  }}
                  itemStyle={{ color: isLight ? '#1a1a1a' : '#fff' }}
                  labelStyle={{ color: isLight ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)' }}
                />
                {/* Current time indicator for single-day view */}
                {computedAnalytics.isSingleDay && (
                  <ReferenceLine
                    x={`${new Date().getHours().toString().padStart(2, '0')}:00`}
                    stroke={isLight ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)'}
                    strokeDasharray="4 4"
                    label={{ value: 'Now', position: 'top', fill: isLight ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)', fontSize: 10 }}
                  />
                )}
                {/* Glow layer */}
                <Line type="monotone" dataKey="views" stroke="rgba(96,165,250,0.15)" strokeWidth={6} dot={false} filter="url(#glow)" />
                {/* Main line */}
                <Line type="monotone" dataKey="views" stroke="rgba(96,165,250,0.9)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="clicks" stroke="rgba(167,139,250,0.5)" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Countries and Devices */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
              <p className="text-[12px] text-white/35 mb-3">Countries</p>
              <div className="space-y-2">
                {computedAnalytics.countries.length > 0 ? (
                  computedAnalytics.countries.map(([country, code, count]: [string, string, number]) => (
                    <div key={country} className="flex items-center justify-between">
                      <span className="text-[13px] text-white/60">
                        {countryFlag(code)} {country}
                      </span>
                      <span className="text-[13px] text-white/85 font-medium">{count.toLocaleString()}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-[12px] text-white/20">No data</p>
                )}
              </div>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
              <p className="text-[12px] text-white/35 mb-3">Devices</p>
              <div className="space-y-2">
                {Object.entries(computedAnalytics.devices).length > 0 ? (
                  Object.entries(computedAnalytics.devices).map(([device, count]) => (
                    <div key={device} className="flex items-center justify-between">
                      <span className="text-[13px] text-white/60 capitalize">{device}</span>
                      <span className="text-[13px] text-white/85 font-medium">{(count as number).toLocaleString()}</span>
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

      {/* ─── SOCIAL MEDIA SUB-TAB ─── */}
      {mode === 'analysis' && activeSubTab === 'social' && !isNew && (
        <SocialTab creatorId={creator.id} />
      )}

    </div>
  )
}

/* ── Shared Components ──────────────────────────── */

function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border border-white/[0.08] rounded-xl overflow-hidden bg-white/[0.02]">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.04] transition-colors"
      >
        <span className="text-[11px] text-white/40 uppercase tracking-widest font-medium">{title}</span>
        <svg
          width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          className={`text-white/30 transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="px-5 pb-5 pt-1">
          {children}
        </div>
      )}
    </div>
  )
}

function Field({ label, value, onChange, placeholder }: { label: string; value?: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="text-[11px] text-white/40 mb-1.5 block">{label}</label>
      <input
        type="text"
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-1.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-[12px] text-white/80 placeholder:text-white/20 focus:border-white/20 transition-colors"
      />
    </div>
  )
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[][] }) {
  return (
    <div>
      <label className="text-[11px] text-white/40 mb-1.5 block">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-1.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-[12px] text-white/80 focus:border-white/20 transition-colors"
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
      <label className="text-[11px] text-white/40 mb-1.5 block">{label}</label>
      <div className="flex gap-2 items-center">
        <input
          type="color"
          value={value || '#000000'}
          onChange={e => onChange(e.target.value)}
          className="w-8 h-8 rounded-md cursor-pointer bg-transparent border border-white/[0.08] p-0.5"
        />
        <input
          type="text"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          className="flex-1 px-3 py-1.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-[12px] text-white/80 focus:border-white/20 transition-colors"
        />
      </div>
    </div>
  )
}

function SliderField({ label, value, min, max, step, suffix, onChange }: {
  label: string; value: number; min: number; max: number; step?: number; suffix: string; onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-white/35 w-14 shrink-0">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step || 1}
        value={value}
        onChange={e => onChange(parseInt(e.target.value))}
        className="flex-1"
      />
      <span className="text-[11px] text-white/40 w-11 text-right tabular-nums">{value}{suffix}</span>
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
      <span className="text-[12px] text-white/50 group-hover:text-white/70 transition-colors">{label}</span>
    </button>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
      <p className="text-[11px] text-white/30 mb-1">{label}</p>
      <p className="text-xl font-semibold text-white/90 tracking-tight">{value}</p>
    </div>
  )
}
