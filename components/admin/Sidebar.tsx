'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard, Users, TrendingUp, DollarSign, BarChart3, Globe, Shield,
  Instagram, Link2, Settings, LogOut, Menu, X, Sun, Moon, Monitor, ChevronLeft,
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

// Module-scoped cache so the creators list isn't refetched on every render.
let creatorsCache: CreatorLite[] | null = null

export default function Sidebar({ isSuperAdmin, displayName, userPermissions }: SidebarProps) {
  const path = usePathname()
  const { theme, setTheme, resolved } = useTheme()
  const isLight = resolved === 'light'
  const [mobileOpen, setMobileOpen] = useState(false)
  const [creators, setCreators] = useState<CreatorLite[]>(creatorsCache || [])

  useEffect(() => { setMobileOpen(false) }, [path])
  useEffect(() => {
    if (!mobileOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [mobileOpen])

  // Fetch the creators list once (for resolving the active creator's name/avatar).
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

  const groups: Group[] = [
    {
      label: 'Tracking',
      items: [
        { href: '/admin', label: 'Dashboard', exact: true, icon: LayoutDashboard },
        { href: '/admin/creators', label: 'Creators', icon: Users },
        { href: '/admin/conversions', label: 'Conversions', icon: TrendingUp },
        { href: '/admin/revenue', label: 'Revenue', icon: DollarSign },
        ...(isSuperAdmin ? [{ href: '/admin/social-accounts', label: 'Social Accounts', icon: BarChart3 }] : []),
      ],
    },
    {
      label: 'LinkMe (optional)',
      items: [{ href: '/admin/domains', label: 'Domains', icon: Globe }],
    },
    ...(isSuperAdmin ? [{ label: 'Admin', items: [{ href: '/admin/access', label: 'Access', icon: Shield }] }] : []),
  ]

  function isActive(item: { href: string; exact?: boolean }) {
    if (item.exact) return path === item.href
    return path === item.href || path.startsWith(item.href + '/')
  }

  // ── Active creator context (when on /admin/creators/<id>/…) ──
  const segs = path.split('/').filter(Boolean) // e.g. ['admin','creators','<id>','analysis']
  const creatorId = segs[0] === 'admin' && segs[1] === 'creators' && segs[2] && segs[2] !== 'new' ? segs[2] : null
  const activeCreator = creatorId ? creators.find(c => c.id === creatorId) : null

  function hasPerm(perm: string) {
    if (isSuperAdmin) return true
    if (!userPermissions || !creatorId) return false
    return (userPermissions[creatorId]?.includes(perm) ?? false) || (userPermissions['__all__']?.includes(perm) ?? false)
  }

  const creatorSubItems = creatorId ? [
    { href: `/admin/creators/${creatorId}/analysis`, label: 'Social Media', icon: Instagram, show: hasPerm('view_social'), active: path === `/admin/creators/${creatorId}/analysis` },
    { href: `/admin/conversions?creator=${creatorId}`, label: 'Conversions', icon: TrendingUp, show: hasPerm('view_conversions'), active: false },
    { href: `/admin/creators/${creatorId}/edit`, label: 'LinkMe', icon: Link2, show: hasPerm('view_links'), active: path === `/admin/creators/${creatorId}/edit` || path === `/admin/creators/${creatorId}/links` },
    { href: `/admin/creators/${creatorId}/settings`, label: 'Settings', icon: Settings, show: !!isSuperAdmin, active: path === `/admin/creators/${creatorId}/settings` },
  ].filter(i => i.show) : []

  function cycleTheme() {
    const order: Array<'system' | 'light' | 'dark'> = ['system', 'light', 'dark']
    setTheme(order[(order.indexOf(theme) + 1) % order.length])
  }
  const ThemeIcon = theme === 'system' ? Monitor : theme === 'light' ? Sun : Moon

  const itemBase = 'flex items-center gap-2.5 rounded-lg pl-2.5 pr-2 py-[7px] text-[12.5px] font-medium transition-all duration-150'
  const activeCls = isLight ? 'text-black/90 bg-black/[0.06]' : 'text-white/95 bg-white/[0.08]'
  const idleCls = isLight ? 'text-black/45 hover:text-black/75 hover:bg-black/[0.04]' : 'text-white/45 hover:text-white/75 hover:bg-white/[0.06]'
  const subtleBtn = isLight ? 'text-black/45 hover:text-black/70 hover:bg-black/[0.04]' : 'text-white/40 hover:text-white/65 hover:bg-white/[0.05]'

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
        className={`fixed left-3 top-3 z-40 inline-flex h-9 w-9 items-center justify-center rounded-lg backdrop-blur lg:hidden ${isLight ? 'bg-white/90 text-black/70 border border-black/10' : 'bg-[#0e0e0e]/90 text-white/70 border border-white/10'}`}
      >
        <Menu className="h-4 w-4" />
      </button>

      {mobileOpen && <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} aria-hidden />}

      <aside
        className={`admin-sidebar fixed inset-y-0 left-0 z-50 flex h-screen w-56 shrink-0 flex-col transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo + mobile close */}
        <div className="flex h-14 shrink-0 items-center justify-between px-4">
          <Link href="/admin" className="group flex items-center gap-2.5">
            <img src={isLight ? '/Logo.svg' : '/logo-white.svg'} alt="MAHO" className="h-5 transition-opacity group-hover:opacity-80" />
          </Link>
          <button type="button" onClick={() => setMobileOpen(false)} aria-label="Close navigation" className={`inline-flex h-8 w-8 items-center justify-center rounded-lg lg:hidden ${isLight ? 'text-black/40 hover:bg-black/[0.04]' : 'text-white/40 hover:bg-white/[0.05]'}`}>
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-2">
          {groups.map((group, gi) => (
            <div key={group.label} className={gi > 0 ? 'mt-5' : ''}>
              <div className={`mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider ${isLight ? 'text-black/30' : 'text-white/30'}`}>{group.label}</div>
              <div className="flex flex-col gap-0.5">
                {group.items.map(item => {
                  const active = isActive(item)
                  const Icon = item.icon
                  const showCreatorCtx = item.label === 'Creators' && creatorId
                  return (
                    <div key={item.href}>
                      <Link href={item.href} className={`relative ${itemBase} ${active ? activeCls : idleCls}`}>
                        {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[2.5px] rounded-full bg-blue-500" />}
                        <Icon className="h-[15px] w-[15px] shrink-0" />
                        <span>{item.label}</span>
                      </Link>

                      {/* Contextual creator sub-nav */}
                      {showCreatorCtx && (
                        <div className={`mt-1 mb-1 ml-3 pl-2 border-l ${isLight ? 'border-black/[0.08]' : 'border-white/[0.08]'}`}>
                          <div className="flex items-center gap-2 px-2 py-1.5">
                            {activeCreator?.avatar_url ? (
                              <img src={activeCreator.avatar_url} alt="" className="h-5 w-5 rounded-full object-cover" />
                            ) : (
                              <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-medium ${isLight ? 'bg-black/[0.06] text-black/40' : 'bg-white/[0.08] text-white/40'}`}>
                                {(activeCreator?.display_name || '?').charAt(0).toUpperCase()}
                              </span>
                            )}
                            <span className={`text-[12px] font-medium truncate ${isLight ? 'text-black/70' : 'text-white/70'}`}>{activeCreator?.display_name || 'Creator'}</span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            {creatorSubItems.map(sub => {
                              const SubIcon = sub.icon
                              return (
                                <Link key={sub.label} href={sub.href} prefetch className={`${itemBase} ${sub.active ? activeCls : idleCls}`}>
                                  <SubIcon className="h-[14px] w-[14px] shrink-0" />
                                  <span>{sub.label}</span>
                                </Link>
                              )
                            })}
                            <Link href="/admin/creators" className={`flex items-center gap-2 rounded-lg pl-2.5 py-[6px] text-[11px] ${subtleBtn}`}>
                              <ChevronLeft className="h-3.5 w-3.5" />
                              <span>All creators</span>
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div className={`shrink-0 border-t px-2.5 py-2.5 ${isLight ? 'border-black/[0.08]' : 'border-white/[0.06]'}`}>
          <button onClick={cycleTheme} title={`Theme: ${theme}`} className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[12px] transition-all duration-150 ${subtleBtn}`}>
            <ThemeIcon className="h-[15px] w-[15px] shrink-0" />
            <span>{theme === 'system' ? 'System' : theme === 'light' ? 'Light' : 'Dark'}</span>
          </button>

          {displayName && (
            <Link href="/admin/profile" className={`flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] mt-0.5 transition-all duration-150 ${path === '/admin/profile' ? activeCls : subtleBtn}`}>
              <span className={`h-[18px] w-[18px] rounded-full flex items-center justify-center text-[9px] font-semibold shrink-0 ${isLight ? 'bg-black/[0.08] text-black/55' : 'bg-white/[0.10] text-white/60'}`}>
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
