'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import {
  LayoutDashboard, Users, TrendingUp, DollarSign, BarChart3, Globe, Shield,
  Instagram, Link2, Settings, LogOut, Menu, X, Sun, Moon, Monitor,
  ChevronsUpDown, Search,
} from 'lucide-react'
import { useTheme } from './ThemeProvider'

interface SidebarProps {
  isSuperAdmin?: boolean
  displayName?: string
  userPermissions?: Record<string, string[]>
}

type Item = { href: string; label: string; exact?: boolean; icon: React.ComponentType<{ className?: string }> }
type Group = { label: string; items: Item[] }
type CreatorLite = { id: string; display_name: string; avatar_url?: string }

let creatorsCache: CreatorLite[] | null = null

export default function Sidebar({ isSuperAdmin, displayName, userPermissions }: SidebarProps) {
  const path = usePathname()
  const router = useRouter()
  const { theme, setTheme, resolved } = useTheme()
  const isLight = resolved === 'light'

  const [mobileOpen, setMobileOpen] = useState(false)
  const [creators, setCreators] = useState<CreatorLite[]>(creatorsCache || [])
  const [switcherOpen, setSwitcherOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [storedId, setStoredId] = useState<string | null>(null)
  const switcherRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setMobileOpen(false); setSwitcherOpen(false) }, [path])
  useEffect(() => {
    if (!mobileOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [mobileOpen])

  // Close switcher on outside click
  useEffect(() => {
    if (!switcherOpen) return
    function onDown(e: MouseEvent) {
      if (switcherRef.current && !switcherRef.current.contains(e.target as Node)) setSwitcherOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [switcherOpen])

  // Fetch creators once
  useEffect(() => {
    if (creatorsCache) return
    let cancelled = false
    fetch('/api/admin/creators')
      .then(r => (r.ok ? r.json() : []))
      .then((data: any[]) => {
        if (cancelled) return
        const list = (data || []).map(c => ({ id: c.id, display_name: c.display_name, avatar_url: c.avatar_url }))
        creatorsCache = list
        setCreators(list)
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  // ── Active creator (route → localStorage → first creator) ──
  const segs = path.split('/').filter(Boolean)
  const routeCreatorId = segs[0] === 'admin' && segs[1] === 'creators' && segs[2] && segs[2] !== 'new' ? segs[2] : null

  useEffect(() => { try { setStoredId(localStorage.getItem('activeCreatorId')) } catch {} }, [])
  useEffect(() => {
    if (routeCreatorId) { try { localStorage.setItem('activeCreatorId', routeCreatorId) } catch {}; setStoredId(routeCreatorId) }
  }, [routeCreatorId])
  useEffect(() => {
    if (!routeCreatorId && !storedId && creators.length) {
      setStoredId(creators[0].id)
      try { localStorage.setItem('activeCreatorId', creators[0].id) } catch {}
    }
  }, [creators, storedId, routeCreatorId])

  const activeCreatorId = routeCreatorId || storedId || creators[0]?.id || null
  const activeCreator = activeCreatorId ? creators.find(c => c.id === activeCreatorId) || null : null

  function hasPerm(perm: string) {
    if (isSuperAdmin) return true
    if (!userPermissions || !activeCreatorId) return false
    return (userPermissions[activeCreatorId]?.includes(perm) ?? false) || (userPermissions['__all__']?.includes(perm) ?? false)
  }

  function selectCreator(id: string) {
    try { localStorage.setItem('activeCreatorId', id) } catch {}
    setStoredId(id); setSwitcherOpen(false); setSearch('')
    router.push(`/admin/creators/${id}/analysis`)
  }

  const creatorTabs = activeCreatorId ? [
    { href: `/admin/creators/${activeCreatorId}/analysis`, label: 'Social Media', icon: Instagram, show: hasPerm('view_social'), active: path === `/admin/creators/${activeCreatorId}/analysis` },
    { href: `/admin/conversions?creator=${activeCreatorId}`, label: 'Conversions', icon: TrendingUp, show: hasPerm('view_conversions'), active: false },
    { href: `/admin/creators/${activeCreatorId}/edit`, label: 'LinkMe', icon: Link2, show: hasPerm('view_links'), active: path === `/admin/creators/${activeCreatorId}/edit` || path === `/admin/creators/${activeCreatorId}/links` },
    { href: `/admin/creators/${activeCreatorId}/settings`, label: 'Settings', icon: Settings, show: !!isSuperAdmin, active: path === `/admin/creators/${activeCreatorId}/settings` },
  ].filter(t => t.show) : []

  const workspace: Group = {
    label: 'Workspace',
    items: [
      { href: '/admin', label: 'Overview', exact: true, icon: LayoutDashboard },
      { href: '/admin/creators', label: 'All Creators', icon: Users },
      { href: '/admin/revenue', label: 'Revenue', icon: DollarSign },
      ...(isSuperAdmin ? [{ href: '/admin/social-accounts', label: 'Social Accounts', icon: BarChart3 }] : []),
      { href: '/admin/domains', label: 'Domains', icon: Globe },
    ],
  }
  const adminGroup: Group | null = isSuperAdmin ? { label: 'Admin', items: [{ href: '/admin/access', label: 'Access', icon: Shield }] } : null

  function isActive(item: { href: string; exact?: boolean }) {
    if (item.exact) return path === item.href
    return path === item.href || path.startsWith(item.href + '/')
  }

  function cycleTheme() {
    const order: Array<'system' | 'light' | 'dark'> = ['system', 'light', 'dark']
    setTheme(order[(order.indexOf(theme) + 1) % order.length])
  }
  const ThemeIcon = theme === 'system' ? Monitor : theme === 'light' ? Sun : Moon

  // ── shared classes ──
  const itemBase = 'flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[12.5px] font-medium transition-all duration-150'
  const activeCls = 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
  const idleCls = isLight ? 'text-black/55 hover:text-black/90 hover:bg-black/[0.04]' : 'text-white/55 hover:text-white/90 hover:bg-white/[0.06]'
  const subtleBtn = isLight ? 'text-black/45 hover:text-black/70 hover:bg-black/[0.04]' : 'text-white/40 hover:text-white/65 hover:bg-white/[0.05]'
  const groupLabel = `mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider ${isLight ? 'text-black/30' : 'text-white/30'}`
  const Avatar = ({ c, size = 20 }: { c: CreatorLite | null; size?: number }) =>
    c?.avatar_url
      ? <img src={c.avatar_url} alt="" className="rounded-full object-cover shrink-0" style={{ width: size, height: size }} />
      : <span className={`rounded-full flex items-center justify-center font-medium shrink-0 ${isLight ? 'bg-black/[0.06] text-black/40' : 'bg-white/[0.10] text-white/50'}`} style={{ width: size, height: size, fontSize: size * 0.42 }}>{(c?.display_name || '?').charAt(0).toUpperCase()}</span>

  const filteredCreators = search.trim()
    ? creators.filter(c => c.display_name.toLowerCase().includes(search.toLowerCase()))
    : creators

  const renderItem = (item: Item) => {
    const active = isActive(item)
    const Icon = item.icon
    return (
      <Link key={item.href} href={item.href} className={`${itemBase} ${active ? activeCls : idleCls}`}>
        <Icon className="h-[15px] w-[15px] shrink-0" />
        <span>{item.label}</span>
      </Link>
    )
  }

  return (
    <>
      <button type="button" onClick={() => setMobileOpen(true)} aria-label="Open navigation"
        className={`fixed left-3 top-3 z-40 inline-flex h-9 w-9 items-center justify-center rounded-lg backdrop-blur lg:hidden ${isLight ? 'bg-white/90 text-black/70 border border-black/10' : 'bg-[#0e0e0e]/90 text-white/70 border border-white/10'}`}>
        <Menu className="h-4 w-4" />
      </button>

      {mobileOpen && <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} aria-hidden />}

      <aside className={`admin-sidebar fixed inset-y-0 left-0 z-50 flex h-screen w-60 shrink-0 flex-col transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="flex h-14 shrink-0 items-center justify-between px-4">
          <Link href="/admin" className="group flex items-center gap-2.5">
            <img src={isLight ? '/Logo.svg' : '/logo-white.svg'} alt="MAHO" className="h-5 transition-opacity group-hover:opacity-80" />
          </Link>
          <button type="button" onClick={() => setMobileOpen(false)} aria-label="Close navigation" className={`inline-flex h-8 w-8 items-center justify-center rounded-lg lg:hidden ${isLight ? 'text-black/40 hover:bg-black/[0.04]' : 'text-white/40 hover:bg-white/[0.05]'}`}>
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Creator switcher */}
        <div className="px-3 pb-1" ref={switcherRef}>
          <div className="relative">
            <button
              type="button"
              onClick={() => setSwitcherOpen(o => !o)}
              className={`w-full flex items-center justify-between gap-2 rounded-xl border px-2.5 py-2 transition-all duration-150 ${
                isLight ? 'border-black/[0.08] bg-black/[0.02] hover:bg-black/[0.04]' : 'border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.06]'
              }`}
            >
              <span className="flex items-center gap-2 min-w-0">
                <Avatar c={activeCreator} size={22} />
                <span className={`text-[13px] font-medium truncate ${isLight ? 'text-black/80' : 'text-white/85'}`}>
                  {activeCreator?.display_name || (creators.length ? 'Select creator' : 'Loading…')}
                </span>
              </span>
              <ChevronsUpDown className={`h-3.5 w-3.5 shrink-0 ${isLight ? 'text-black/35' : 'text-white/40'}`} />
            </button>

            {switcherOpen && (
              <div className={`absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl border p-1.5 shadow-2xl ${isLight ? 'bg-white border-black/10' : 'bg-[#141414] border-white/[0.10]'}`}>
                <div className={`relative mb-1.5`}>
                  <Search className={`pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 ${isLight ? 'text-black/30' : 'text-white/30'}`} />
                  <input
                    autoFocus
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search creators…"
                    className={`w-full rounded-lg pl-7 pr-2 py-1.5 text-[12.5px] outline-none ${isLight ? 'bg-black/[0.03] text-black/80 placeholder:text-black/30' : 'bg-white/[0.05] text-white/85 placeholder:text-white/30'}`}
                  />
                </div>
                <div className="max-h-64 overflow-y-auto flex flex-col gap-0.5">
                  {filteredCreators.map(c => (
                    <button key={c.id} onClick={() => selectCreator(c.id)}
                      className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors ${
                        c.id === activeCreatorId ? (isLight ? 'bg-black/[0.05]' : 'bg-white/[0.08]') : (isLight ? 'hover:bg-black/[0.04]' : 'hover:bg-white/[0.06]')
                      }`}>
                      <Avatar c={c} size={20} />
                      <span className={`text-[12.5px] truncate ${isLight ? 'text-black/75' : 'text-white/80'}`}>{c.display_name}</span>
                    </button>
                  ))}
                  {filteredCreators.length === 0 && (
                    <p className={`text-[12px] px-2 py-2 ${isLight ? 'text-black/35' : 'text-white/35'}`}>No creators found</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-2">
          {/* Active creator's tabs */}
          {creatorTabs.length > 0 && (
            <div className="mb-4">
              <div className={groupLabel}>Creator</div>
              <div className="flex flex-col gap-0.5">
                {creatorTabs.map(t => {
                  const Icon = t.icon
                  return (
                    <Link key={t.label} href={t.href} prefetch className={`${itemBase} ${t.active ? activeCls : idleCls}`}>
                      <Icon className="h-[15px] w-[15px] shrink-0" />
                      <span>{t.label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* Workspace */}
          <div className={creatorTabs.length > 0 ? '' : 'mt-1'}>
            <div className={groupLabel}>{workspace.label}</div>
            <div className="flex flex-col gap-0.5">{workspace.items.map(renderItem)}</div>
          </div>

          {/* Admin */}
          {adminGroup && (
            <div className="mt-4">
              <div className={groupLabel}>{adminGroup.label}</div>
              <div className="flex flex-col gap-0.5">{adminGroup.items.map(renderItem)}</div>
            </div>
          )}
        </nav>

        {/* Bottom */}
        <div className={`shrink-0 border-t px-3 py-2.5 ${isLight ? 'border-black/[0.08]' : 'border-white/[0.06]'}`}>
          <button onClick={cycleTheme} title={`Theme: ${theme}`} className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[12px] transition-all duration-150 ${subtleBtn}`}>
            <ThemeIcon className="h-[15px] w-[15px] shrink-0" />
            <span>{theme === 'system' ? 'System' : theme === 'light' ? 'Light' : 'Dark'}</span>
          </button>
          {displayName && (
            <Link href="/admin/profile" className={`flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] mt-0.5 transition-all duration-150 ${path === '/admin/profile' ? activeCls : subtleBtn}`}>
              <span className={`h-[18px] w-[18px] rounded-full flex items-center justify-center text-[9px] font-semibold shrink-0 ${path === '/admin/profile' ? 'bg-white/20 text-white' : isLight ? 'bg-black/[0.08] text-black/55' : 'bg-white/[0.10] text-white/60'}`}>
                {displayName.charAt(0).toUpperCase()}
              </span>
              <span className="text-[12px] truncate">{displayName}</span>
            </Link>
          )}
          <a href="/api/admin/logout" className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[7px] mt-0.5 text-[12px] transition-all duration-150 ${subtleBtn}`}>
            <LogOut className="h-[15px] w-[15px] shrink-0" />
            <span>Log out</span>
          </a>
        </div>
      </aside>
    </>
  )
}
