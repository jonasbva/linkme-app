'use client'

import { useState, useEffect, useMemo } from 'react'
import { useTheme } from './ThemeProvider'

interface Account {
  id: string
  creator_id: string
  creator_name: string
  platform: string
  username: string
  is_active: boolean
  created_at: string
  last_scraped: string | null
}

interface EditState {
  username?: string
  is_active?: boolean
}

export default function SocialAccountsClient() {
  const { resolved } = useTheme()
  const isLight = resolved === 'light'

  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [edits, setEdits] = useState<Record<string, EditState>>({})
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  async function loadAccounts() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/social-accounts')
      const data = await res.json()
      if (Array.isArray(data)) setAccounts(data)
    } catch {
      showToast('Failed to load accounts', 'error')
    }
    setLoading(false)
  }

  useEffect(() => { loadAccounts() }, [])

  // Filtered + searched list
  const filtered = useMemo(() => {
    let list = accounts
    if (filterActive === 'active') list = list.filter(a => a.is_active)
    if (filterActive === 'inactive') list = list.filter(a => !a.is_active)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(a =>
        a.username.toLowerCase().includes(q) ||
        a.creator_name.toLowerCase().includes(q) ||
        a.platform.toLowerCase().includes(q)
      )
    }
    return list
  }, [accounts, filterActive, search])

  // Select all visible
  function toggleSelectAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filtered.map(a => a.id)))
    }
  }

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Track edits per account
  function setEdit(id: string, field: keyof EditState, value: any) {
    setEdits(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }))
  }

  const hasEdits = Object.keys(edits).length > 0

  // Save all edits
  async function saveEdits() {
    const updates = Object.entries(edits).map(([id, fields]) => ({ id, ...fields }))
    if (updates.length === 0) return

    setSaving(true)
    try {
      const res = await fetch('/api/admin/social-accounts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      })
      const data = await res.json()
      showToast(`${data.success} updated${data.errors > 0 ? `, ${data.errors} failed` : ''}`, data.errors > 0 ? 'error' : 'success')
      setEdits({})
      await loadAccounts()
    } catch {
      showToast('Failed to save', 'error')
    }
    setSaving(false)
  }

  // Bulk toggle active
  async function bulkToggleActive(active: boolean) {
    const updates = [...selected].map(id => ({ id, is_active: active }))
    setSaving(true)
    try {
      const res = await fetch('/api/admin/social-accounts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      })
      const data = await res.json()
      showToast(`${data.success} ${active ? 'enabled' : 'disabled'}`, 'success')
      setSelected(new Set())
      setEdits({})
      await loadAccounts()
    } catch {
      showToast('Failed to update', 'error')
    }
    setSaving(false)
  }

  // Bulk delete
  async function bulkDelete() {
    if (!confirm(`Delete ${selected.size} account(s)? This cannot be undone.`)) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/social-accounts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [...selected] }),
      })
      const data = await res.json()
      showToast(`${data.deleted ?? selected.size} deleted`, 'success')
      setSelected(new Set())
      await loadAccounts()
    } catch {
      showToast('Failed to delete', 'error')
    }
    setSaving(false)
  }

  // Time ago helper
  function timeAgo(dateStr: string | null): string {
    if (!dateStr) return 'Never'
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return 'N/A'
      const diff = Date.now() - d.getTime()
      const mins = Math.floor(diff / 60000)
      if (mins < 1) return 'Just now'
      if (mins < 60) return `${mins}m ago`
      const hrs = Math.floor(mins / 60)
      if (hrs < 24) return `${hrs}h ago`
      const days = Math.floor(hrs / 24)
      return `${days}d ago`
    } catch { return 'N/A' }
  }

  // Styling
  const bg = isLight ? 'bg-white' : 'bg-white/[0.03]'
  const border = isLight ? 'border-black/[0.08]' : 'border-white/[0.06]'
  const textPrimary = isLight ? 'text-black/80' : 'text-white/90'
  const textMuted = isLight ? 'text-black/40' : 'text-white/40'
  const inputClass = isLight
    ? 'bg-black/[0.04] border border-black/[0.08] text-black placeholder-black/30 focus:outline-none focus:border-black/20'
    : 'bg-white/[0.06] border border-white/[0.08] text-white placeholder-white/30 focus:outline-none focus:border-white/20'
  const btnPrimary = isLight
    ? 'bg-black text-white hover:bg-black/80'
    : 'bg-white text-black hover:bg-white/90'
  const btnGhost = isLight
    ? 'bg-black/[0.04] text-black/60 border border-black/[0.08] hover:bg-black/[0.08]'
    : 'bg-white/[0.04] text-white/60 border border-white/[0.08] hover:bg-white/[0.08]'

  // Find the most recent scrape across all accounts
  const lastGlobalScrape = useMemo(() => {
    let latest: string | null = null
    for (const a of accounts) {
      if (a.last_scraped && (!latest || a.last_scraped > latest)) {
        latest = a.last_scraped
      }
    }
    return latest
  }, [accounts])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-xl font-semibold tracking-tight ${textPrimary}`}>Social Accounts</h1>
          <p className={`text-[13px] mt-1 ${textMuted}`}>
            {accounts.length} accounts tracked
            {lastGlobalScrape && (
              <> &middot; Last scrape: {timeAgo(lastGlobalScrape)}</>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasEdits && (
            <button
              onClick={saveEdits}
              disabled={saving}
              className={`px-4 py-1.5 rounded-lg text-[12px] font-medium transition-all ${btnPrimary}`}
            >
              {saving ? 'Saving...' : `Save ${Object.keys(edits).length} change${Object.keys(edits).length > 1 ? 's' : ''}`}
            </button>
          )}
        </div>
      </div>

      {/* Filters + Search */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Search username, creator..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className={`px-3 py-1.5 rounded-lg text-[13px] w-64 ${inputClass}`}
        />
        <div className="flex items-center gap-1">
          {(['all', 'active', 'inactive'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilterActive(f)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
                filterActive === f
                  ? isLight ? 'bg-black/[0.08] text-black/80' : 'bg-white/[0.1] text-white/90'
                  : isLight ? 'text-black/40 hover:bg-black/[0.04]' : 'text-white/40 hover:bg-white/[0.04]'
              }`}
            >
              {f === 'all' ? 'All' : f === 'active' ? 'Active' : 'Inactive'}
            </button>
          ))}
        </div>
        <span className={`text-[12px] ml-auto ${textMuted}`}>
          {filtered.length} shown
        </span>
      </div>

      {/* Bulk actions bar */}
      {selected.size > 0 && (
        <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${border} ${bg}`}>
          <span className={`text-[13px] font-medium ${textPrimary}`}>
            {selected.size} selected
          </span>
          <div className="flex items-center gap-2 ml-auto">
            <button onClick={() => bulkToggleActive(true)} disabled={saving} className={`px-3 py-1 rounded-lg text-[12px] font-medium ${btnGhost}`}>
              Enable
            </button>
            <button onClick={() => bulkToggleActive(false)} disabled={saving} className={`px-3 py-1 rounded-lg text-[12px] font-medium ${btnGhost}`}>
              Disable
            </button>
            <button onClick={bulkDelete} disabled={saving} className="px-3 py-1 rounded-lg text-[12px] font-medium bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20">
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className={`text-center py-12 text-[13px] ${textMuted}`}>Loading accounts...</div>
      ) : filtered.length === 0 ? (
        <div className={`text-center py-12 text-[13px] ${textMuted}`}>No accounts found</div>
      ) : (
        <div className={`rounded-xl border ${border} overflow-hidden`}>
          <table className="w-full">
            <thead>
              <tr className={isLight ? 'bg-black/[0.02]' : 'bg-white/[0.02]'}>
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.size === filtered.length && filtered.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded"
                  />
                </th>
                <th className={`text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider ${textMuted}`}>Username</th>
                <th className={`text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider ${textMuted}`}>Creator</th>
                <th className={`text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider ${textMuted}`}>Platform</th>
                <th className={`text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider ${textMuted}`}>Status</th>
                <th className={`text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider ${textMuted}`}>Last Scraped</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((account) => {
                const edited = edits[account.id]
                const currentUsername = edited?.username ?? account.username
                const currentActive = edited?.is_active ?? account.is_active
                const isEdited = !!edited

                return (
                  <tr
                    key={account.id}
                    className={`border-t ${border} transition-colors ${
                      isEdited
                        ? isLight ? 'bg-blue-50/50' : 'bg-blue-500/[0.04]'
                        : isLight ? 'hover:bg-black/[0.02]' : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    <td className="w-10 px-4 py-2.5">
                      <input
                        type="checkbox"
                        checked={selected.has(account.id)}
                        onChange={() => toggleSelect(account.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-4 py-2.5">
                      <input
                        type="text"
                        value={currentUsername}
                        onChange={e => setEdit(account.id, 'username', e.target.value)}
                        className={`px-2 py-1 rounded text-[13px] font-mono w-48 ${
                          isEdited
                            ? isLight ? 'bg-blue-50 border border-blue-200 text-black' : 'bg-blue-500/10 border border-blue-500/20 text-white'
                            : `bg-transparent border border-transparent ${textPrimary} hover:border-current/10`
                        } focus:outline-none focus:border-blue-400/40`}
                      />
                    </td>
                    <td className={`px-4 py-2.5 text-[13px] ${textPrimary}`}>
                      {account.creator_name}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium ${
                        account.platform === 'instagram'
                          ? 'bg-pink-500/10 text-pink-500'
                          : 'bg-cyan-500/10 text-cyan-500'
                      }`}>
                        {account.platform}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <button
                        onClick={() => setEdit(account.id, 'is_active', !currentActive)}
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                          currentActive
                            ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${currentActive ? 'bg-emerald-500' : 'bg-red-400'}`} />
                        {currentActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className={`px-4 py-2.5 text-[12px] ${
                      !account.last_scraped
                        ? 'text-amber-500'
                        : textMuted
                    }`}>
                      {timeAgo(account.last_scraped)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 px-4 py-2.5 rounded-xl text-[13px] font-medium shadow-lg z-50 ${
          toast.type === 'success'
            ? 'bg-emerald-500/90 text-white'
            : 'bg-red-500/90 text-white'
        }`}>
          {toast.message}
        </div>
      )}
    </div>
  )
}
