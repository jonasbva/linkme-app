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
    <nav className="border-b border-white/[0.04] bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 flex items-center justify-between h-12">
        <div className="flex items-center gap-8">
          <span className="font-semibold text-white/90 text-[13px] tracking-tight">LinkMe</span>
          <div className="flex gap-0.5">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1 rounded-md text-[13px] transition-colors ${
                  path === item.href
                    ? 'text-white'
                    : 'text-white/35 hover:text-white/60'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <a
          href="/api/admin/logout"
          className="text-[12px] text-white/20 hover:text-white/50 transition-colors"
        >
          Log out
        </a>
      </div>
    </nav>
  )
}
