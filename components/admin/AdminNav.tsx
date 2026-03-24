'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from './ThemeProvider'

export default function AdminNav() {
  const path = usePathname()
  const { theme, setTheme } = useTheme()

  const navItems = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/creators', label: 'Creators' },
    { href: '/admin/conversions', label: 'Conversions' },
    { href: '/admin/domains', label: 'Domains' },
  ]

  function cycleTheme() {
    const order: Array<'system' | 'light' | 'dark'> = ['system', 'light', 'dark']
    const next = order[(order.indexOf(theme) + 1) % order.length]
    setTheme(next)
  }

  return (
    <nav className="admin-nav">
      <div className="max-w-5xl mx-auto px-6 flex items-center justify-between h-12">
        <div className="flex items-center gap-8">
          <span className="font-semibold admin-text text-[13px] tracking-tight" style={{ opacity: 0.9 }}>LinkMe</span>
          <div className="flex gap-0.5">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1 rounded-md text-[13px] transition-colors ${
                  path === item.href || (item.href !== '/admin' && path.startsWith(item.href))
                    ? 'admin-text'
                    : 'admin-text-muted'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Theme toggle */}
          <button
            onClick={cycleTheme}
            className="admin-text-muted hover:opacity-80 transition-opacity flex items-center gap-1.5"
            title={`Theme: ${theme}`}
          >
            {theme === 'system' ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            ) : theme === 'light' ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
            <span className="text-[11px]">
              {theme === 'system' ? 'System' : theme === 'light' ? 'Light' : 'Dark'}
            </span>
          </button>
          <a
            href="/api/admin/logout"
            className="text-[12px] admin-text-muted transition-opacity hover:opacity-80"
          >
            Log out
          </a>
        </div>
      </div>
    </nav>
  )
}
