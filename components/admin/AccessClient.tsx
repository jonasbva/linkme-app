'use client'

import { useState } from 'react'
import { useTheme } from './ThemeProvider'
import TeamClient from './TeamClient'
import RolesClient from './RolesClient'

type AccessTab = 'team' | 'roles'

export default function AccessClient() {
  const { resolved } = useTheme()
  const isLight = resolved === 'light'
  const [tab, setTab] = useState<AccessTab>('team')

  const tabs: { key: AccessTab; label: string }[] = [
    { key: 'team', label: 'Team' },
    { key: 'roles', label: 'Roles' },
  ]

  return (
    <div className="space-y-6">
      {/* Page header + tab bar */}
      <div className="flex items-center gap-6">
        <h1 className={`text-xl font-semibold tracking-tight ${isLight ? 'text-black/90' : 'text-white/95'}`}>
          Access
        </h1>
        <div className="flex items-center gap-1">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                tab === t.key
                  ? isLight
                    ? 'text-black/90 bg-black/[0.06]'
                    : 'text-white/95 bg-white/[0.08]'
                  : isLight
                    ? 'text-black/40 hover:text-black/70 hover:bg-black/[0.03]'
                    : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {tab === 'team' && <TeamClient />}
      {tab === 'roles' && <RolesClient />}
    </div>
  )
}
