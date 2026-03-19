'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AdminNav() {
  const path = usePathname()

  const navItems = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/creators', label: 'Creators' },
  ]

  return (
    <nav className="border-b border-white/5 bg-[#0d0d0d]">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-14">
        <div className="flex items-center gap-6">
          <span className="font-semibold text-white text-sm">LinkMe Admin</span>
          <div className="flex gap-1">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-lg text-sm transition ${
                  path === item.href
                    ? 'bg-white/10 text-white'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <a
          href="/api/admin/logout"
          className="text-xs text-white/30 hover:text-white/60 transition"
        >
          Logout
        </a>
      </div>
    </nav>
  )
}
