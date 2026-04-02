'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from './ThemeProvider'

interface AdminNavProps {
  isSuperAdmin?: boolean
  displayName?: string
}

export default function AdminNav({ isSuperAdmin, displayName }: AdminNavProps) {
  const path = usePathname()
  const { theme, setTheme, resolved } = useTheme()
  const isLight = resolved === 'light'

  const navItems = [
    { href: '/admin', label: 'Dashboard', exact: true },
    { href: '/admin/conversions', label: 'Conversions' },
    { href: '/admin/revenue', label: 'Revenue' },
    { href: '/admin/domains', label: 'Domains' },
    ...(isSuperAdmin ? [
      { href: '/admin/access', label: 'Access' },
    ] : []),
  ]

  function isActive(item: { href: string; exact?: boolean }) {
    if (item.exact) return path === item.href
    return path === item.href || path.startsWith(item.href)
  }

  function cycleTheme() {
    const order: Array<'system' | 'light' | 'dark'> = ['system', 'light', 'dark']
    const next = order[(order.indexOf(theme) + 1) % order.length]
    setTheme(next)
  }

  return (
    <nav className="admin-nav">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-14">
        {/* Left: Logo + Nav links */}
        <div className="flex items-center gap-8">
          <Link href="/admin" className="flex items-center gap-2.5 group">
            <img
              src={isLight ? '/logo.svg' : '/logo-white.svg'}
              alt="MAHO"
              className="h-5 transition-opacity group-hover:opacity-80"
            />
          </Link>

          <div className="flex items-center gap-0.5">
            {navItems.map(item => {
              const active = isActive(item)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                    active
                      ? isLight
                        ? 'text-black/90 bg-black/[0.06]'
                        : 'text-white/95 bg-white/[0.08]'
                      : isLight
                        ? 'text-black/40 hover:text-black/70 hover:bg-black/[0.03]'
                        : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Right: Theme toggle + Logout */}
        <div className="flex items-center gap-1">
          <button
            onClick={cycleTheme}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] transition-all duration-150 ${
              isLight
                ? 'text-black/40 hover:text-black/70 hover:bg-black/[0.04]'
                : 'text-white/35 hover:text-white/60 hover:bg-white/[0.04]'
            }`}
            title={`Theme: ${theme}`}
          >
            {theme === 'system' ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            ) : theme === 'light' ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
            <span>{theme === 'system' ? 'System' : theme === 'light' ? 'Light' : 'Dark'}</span>
          </button>
          {displayName && (
            <span className={`text-[12px] px-2 ${isLight ? 'text-black/30' : 'text-white/25'}`}>
              {displayName}
            </span>
          )}
          <a
            href="/api/admin/logout"
            className={`px-2.5 py-1.5 rounded-lg text-[12px] transition-all duration-150 ${
              isLight
                ? 'text-black/40 hover:text-black/70 hover:bg-black/[0.04]'
                : 'text-white/35 hover:text-white/60 hover:bg-white/[0.04]'
            }`}
          >
            Log out
          </a>
        </div>
      </div>
    </nav>
  )
}
