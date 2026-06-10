'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard, TrendingUp, DollarSign, Users, Globe, Shield,
  LogOut, Menu, X, Sun, Moon, Monitor,
} from 'lucide-react'
import { useTheme } from './ThemeProvider'

interface SidebarProps {
  isSuperAdmin?: boolean
  displayName?: string
}

type Item = { href: string; label: string; exact?: boolean; icon: React.ComponentType<{ className?: string }> }
type Group = { label: string; items: Item[] }

export default function Sidebar({ isSuperAdmin, displayName }: SidebarProps) {
  const path = usePathname()
  const { theme, setTheme, resolved } = useTheme()
  const isLight = resolved === 'light'
  const [mobileOpen, setMobileOpen] = useState(false)

  // Close the drawer on navigation.
  useEffect(() => { setMobileOpen(false) }, [path])

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    if (!mobileOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [mobileOpen])

  const groups: Group[] = [
    {
      label: 'Tracking',
      items: [
        { href: '/admin', label: 'Dashboard', exact: true, icon: LayoutDashboard },
        { href: '/admin/conversions', label: 'Conversions', icon: TrendingUp },
        { href: '/admin/revenue', label: 'Revenue', icon: DollarSign },
        ...(isSuperAdmin ? [{ href: '/admin/social-accounts', label: 'Social Accounts', icon: Users }] : []),
      ],
    },
    {
      label: 'LinkMe (optional)',
      items: [
        { href: '/admin/domains', label: 'Domains', icon: Globe },
      ],
    },
    ...(isSuperAdmin
      ? [{ label: 'Admin', items: [{ href: '/admin/access', label: 'Access', icon: Shield }] }]
      : []),
  ]

  // Same active-state logic as the old top nav.
  function isActive(item: { href: string; exact?: boolean }) {
    if (item.exact) return path === item.href
    return path === item.href || path.startsWith(item.href)
  }

  function cycleTheme() {
    const order: Array<'system' | 'light' | 'dark'> = ['system', 'light', 'dark']
    const next = order[(order.indexOf(theme) + 1) % order.length]
    setTheme(next)
  }

  const ThemeIcon = theme === 'system' ? Monitor : theme === 'light' ? Sun : Moon
  const subtleBtn = isLight
    ? 'text-black/45 hover:text-black/70 hover:bg-black/[0.04]'
    : 'text-white/40 hover:text-white/65 hover:bg-white/[0.04]'

  return (
    <>
      {/* Mobile hamburger — floats top-left, hidden on desktop */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
        className={`fixed left-3 top-3 z-40 inline-flex h-9 w-9 items-center justify-center rounded-lg backdrop-blur lg:hidden ${
          isLight ? 'bg-white/90 text-black/70 border border-black/10' : 'bg-[#0e0e0e]/90 text-white/70 border border-white/10'
        }`}
      >
        <Menu className="h-4 w-4" />
      </button>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}

      <aside
        className={`admin-sidebar fixed inset-y-0 left-0 z-50 flex h-screen w-60 shrink-0 flex-col transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo + mobile close */}
        <div className="flex h-14 shrink-0 items-center justify-between px-5">
          <Link href="/admin" className="group flex items-center gap-2.5">
            <img
              src={isLight ? '/Logo.svg' : '/logo-white.svg'}
              alt="MAHO"
              className="h-5 transition-opacity group-hover:opacity-80"
            />
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg lg:hidden ${
              isLight ? 'text-black/40 hover:bg-black/[0.04]' : 'text-white/40 hover:bg-white/[0.05]'
            }`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav groups (scrolls) */}
        <nav className="flex-1 overflow-y-auto px-3 py-2">
          {groups.map((group, gi) => (
            <div key={group.label} className={gi > 0 ? 'mt-5' : ''}>
              <div className={`mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider ${isLight ? 'text-black/30' : 'text-white/30'}`}>
                {group.label}
              </div>
              <div className="flex flex-col gap-0.5">
                {group.items.map(item => {
                  const active = isActive(item)
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-all duration-200 ${
                        active
                          ? isLight
                            ? 'text-black/90 bg-black/[0.06] shadow-sm'
                            : 'text-white/95 bg-white/[0.08] shadow-sm'
                          : isLight
                            ? 'text-black/45 hover:text-black/70 hover:bg-black/[0.04]'
                            : 'text-white/45 hover:text-white/70 hover:bg-white/[0.05]'
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom: theme toggle + displayName + logout */}
        <div className={`shrink-0 border-t px-3 py-3 ${isLight ? 'border-black/[0.08]' : 'border-white/[0.06]'}`}>
          <button
            onClick={cycleTheme}
            title={`Theme: ${theme}`}
            className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12px] transition-all duration-150 ${subtleBtn}`}
          >
            <ThemeIcon className="h-4 w-4 shrink-0" />
            <span>{theme === 'system' ? 'System' : theme === 'light' ? 'Light' : 'Dark'}</span>
          </button>

          {displayName && (
            <div className={`truncate px-2.5 pt-2 pb-1 text-[12px] ${isLight ? 'text-black/30' : 'text-white/25'}`}>
              {displayName}
            </div>
          )}

          <a
            href="/api/admin/logout"
            className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12px] transition-all duration-150 ${subtleBtn}`}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span>Log out</span>
          </a>
        </div>
      </aside>
    </>
  )
}
