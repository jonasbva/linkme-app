'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  resolved: 'light' | 'dark'
  setTheme: (t: Theme) => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'system',
  resolved: 'dark',
  setTheme: () => {},
})

export function useTheme() {
  return useContext(ThemeContext)
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system')
  const [systemPref, setSystemPref] = useState<'light' | 'dark'>('dark')

  // Load saved preference
  useEffect(() => {
    try {
      const saved = localStorage.getItem('admin-theme') as Theme | null
      if (saved && ['light', 'dark', 'system'].includes(saved)) {
        setThemeState(saved)
      }
    } catch {}
  }, [])

  // Listen to system preference changes
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    setSystemPref(mq.matches ? 'dark' : 'light')

    function handler(e: MediaQueryListEvent) {
      setSystemPref(e.matches ? 'dark' : 'light')
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const resolved = theme === 'system' ? systemPref : theme

  function setTheme(t: Theme) {
    setThemeState(t)
    try {
      localStorage.setItem('admin-theme', t)
    } catch {}
  }

  return (
    <ThemeContext.Provider value={{ theme, resolved, setTheme }}>
      <div data-theme={resolved}>
        {children}
      </div>
    </ThemeContext.Provider>
  )
}
