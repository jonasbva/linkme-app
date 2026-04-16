'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from './ThemeProvider'

interface ConversionAccount {
  id: string
  handle: string
  display_label: string | null
  sheet_tab_name: string | null
  is_active: boolean
  created_at: string
}

interface InflowwCreator {
  infloww_id: string
  name: string
  user_name: string
}

interface Mapping {
  creator_id: string
  infloww_creator_id: string
  infloww_creator_name: string
}

interface Creator {
  id: string
  slug: string
  display_name: string
  avatar_url?: string
  custom_domain?: string
  linkme_enabled?: boolean
  of_handle?: string | null
  is_active: boolean
}

interface Props {
  creator: Creator
  conversionAccounts: ConversionAccount[]
  inflowwCreators: InflowwCreator[]
  currentMapping: Mapping | null
  isSuperAdmin: boolean
}

type Toast = { message: string; type: 'success' | 'error' }

function ToastNotification({ toast, onDismiss }: { toast: Toast | null; onDismiss: () => void }) {
  useEffect(() => {
    if (toast) {
      const t = setTimeout(onDismiss, 3500)
      return () => clearTimeout(t)
    }
  }, [toast, onDismiss])

  if (!toast) return null

  return (
    <div style={{ position: 'fixed', bottom: 32, right: 32, zIndex: 100 }}>
      <div className={`px-5 py-3 rounded-xl text-[13px] font-medium shadow-xl backdrop-blur-xl border ${
        toast.type === 'success'
          ? 'bg-emerald-500/15 border-emerald-500/20 text-emerald-400'
          : 'bg-red-500/15 border-red-500/20 text-red-400'
      }`}>
        {toast.message}
      </div>
    </div>
  )
}

export default function SettingsClient({
  creator,
  conversionAccounts: initialConversionAccounts,
  inflowwCreators,
  currentMapping,
  isSuperAdmin,
}: Props) {
  const router = useRouter()
  const { resolved } = useTheme()
  const isLight = resolved === 'light'
  const [toast, setToast] = useState<Toast | null>(null)

  // ─── OF Handle (single, on creator row) ───────────────────────
  const [ofHandle, setOfHandle] = useState<string>(creator.of_handle || '')
  const [ofHandleDraft, setOfHandleDraft] = useState<string>(creator.of_handle || '')
  const [ofHandleSaving, setOfHandleSaving] = useState(false)

  // ─── LinkMe toggle ────────────────────────────────────────────
  const [linkmeEnabled, setLinkmeEnabled] = useState(!!creator.linkme_enabled)
  const [linkmeSaving, setLinkmeSaving] = useState(false)

  // ─── Conversion Accounts (N per creator) ──────────────────────
  const [conversionAccounts, setConversionAccounts] = useState<ConversionAccount[]>(initialConversionAccounts)
  const [newConvHandle, setNewConvHandle] = useState('')
  const [newConvLabel, setNewConvLabel] = useState('')
  const [newConvSheet, setNewConvSheet] = useState('')
  const [addingConv, setAddingConv] = useState(false)

  // ─── Infloww mapping ──────────────────────────────────────────
  const [inflowwMapping, setInflowwMapping] = useState<string>(currentMapping?.infloww_creator_id || '')
  const [inflowwMappingSaving, setInflowwMappingSaving] = useState(false)

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type })
  }

  // ─── Save OF handle (single) ──────────────────────────────────
  async function saveOfHandle() {
    const next = ofHandleDraft.trim().replace(/^@/, '').toLowerCase()
    if (next === (ofHandle || '')) return
    if (next && !/^[a-z0-9_.-]+$/.test(next)) {
      showToast('Invalid handle format', 'error')
      setOfHandleDraft(ofHandle)
      return
    }
    setOfHandleSaving(true)
    try {
      const res = await fetch(`/api/admin/creators/${creator.id}/of-handle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ of_handle: next || null }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'failed')
      setOfHandle(next)
      setOfHandleDraft(next)
      showToast(next ? 'OF handle saved' : 'OF handle cleared', 'success')
      router.refresh()
    } catch (e: any) {
      setOfHandleDraft(ofHandle)
      showToast(e.message || 'Failed to save handle', 'error')
    } finally {
      setOfHandleSaving(false)
    }
  }

  // ─── LinkMe toggle ────────────────────────────────────────────
  async function toggleLinkMe() {
    const next = !linkmeEnabled
    setLinkmeSaving(true)
    setLinkmeEnabled(next)
    try {
      const res = await fetch(`/api/admin/creators/${creator.id}/linkme-enabled`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkme_enabled: next }),
      })
      if (!res.ok) throw new Error('failed')
      showToast(`LinkMe ${next ? 'enabled' : 'disabled'}`, 'success')
      router.refresh()
    } catch {
      setLinkmeEnabled(!next)
      showToast('Failed to update LinkMe setting', 'error')
    } finally {
      setLinkmeSaving(false)
    }
  }

  // ─── Add conversion account ───────────────────────────────────
  async function addConversionAccount() {
    const handle = newConvHandle.trim().replace(/^@/, '').toLowerCase()
    if (!handle) {
      showToast('Handle is required', 'error')
      return
    }
    setAddingConv(true)
    try {
      const res = await fetch(`/api/admin/creators/${creator.id}/conversion-accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          handle,
          display_label: newConvLabel.trim() || null,
          sheet_tab_name: newConvSheet.trim() || null,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'failed')
      setConversionAccounts(prev => [...prev, json.account])
      setNewConvHandle('')
      setNewConvLabel('')
      setNewConvSheet('')
      showToast('Conversion account added', 'success')
      router.refresh()
    } catch (e: any) {
      showToast(e.message || 'Failed to add account', 'error')
    } finally {
      setAddingConv(false)
    }
  }

  // ─── Update conversion account ────────────────────────────────
  async function updateConversionAccount(id: string, patch: Partial<ConversionAccount>) {
    const prev = conversionAccounts
    setConversionAccounts(prev.map(a => a.id === id ? { ...a, ...patch } : a))
    try {
      const res = await fetch(`/api/admin/creators/${creator.id}/conversion-accounts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'failed')
      }
      showToast('Saved', 'success')
    } catch (e: any) {
      setConversionAccounts(prev)
      showToast(e.message || 'Failed to save', 'error')
    }
  }

  // ─── Delete conversion account ────────────────────────────────
  async function deleteConversionAccount(id: string, handle: string) {
    if (!confirm(`Delete @${handle}? This will unlink any conversion data tied to it.`)) return
    try {
      const res = await fetch(`/api/admin/creators/${creator.id}/conversion-accounts/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'failed')
      }
      setConversionAccounts(prev => prev.filter(a => a.id !== id))
      showToast('Conversion account deleted', 'success')
      router.refresh()
    } catch (e: any) {
      showToast(e.message || 'Failed to delete', 'error')
    }
  }

  // ─── Infloww mapping ──────────────────────────────────────────
  async function saveInflowwMapping(inflowwId: string) {
    setInflowwMappingSaving(true)
    setInflowwMapping(inflowwId)
    try {
      if (!inflowwId) {
        await fetch(`/api/admin/revenue/mapping?creator_id=${creator.id}`, { method: 'DELETE' })
      } else {
        const ic = inflowwCreators.find(c => c.infloww_id === inflowwId)
        const res = await fetch('/api/admin/revenue/mapping', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            creator_id: creator.id,
            infloww_creator_id: inflowwId,
            infloww_creator_name: ic?.name || '',
          }),
        })
        if (!res.ok) throw new Error('failed')
      }
      showToast('Infloww mapping saved', 'success')
    } catch {
      showToast('Failed to save mapping', 'error')
    } finally {
      setInflowwMappingSaving(false)
    }
  }

  // Auto-match Infloww by the OF handle
  const autoMatchableInfloww = (() => {
    if (inflowwMapping || inflowwCreators.length === 0 || !ofHandle) return null
    return inflowwCreators.find(ic => ic.user_name?.toLowerCase() === ofHandle.toLowerCase()) || null
  })()

  // ─── Styling helpers ──────────────────────────────────────────
  const cardCls = isLight
    ? 'bg-black/[0.02] border-black/[0.06]'
    : 'bg-white/[0.03] border-white/[0.07]'
  const textPrimary = isLight ? 'text-black/90' : 'text-white/90'
  const textSecondary = isLight ? 'text-black/60' : 'text-white/60'
  const textTertiary = isLight ? 'text-black/40' : 'text-white/40'
  const inputCls = isLight
    ? 'bg-white border border-black/10 text-black/80 placeholder:text-black/25 focus:border-black/30'
    : 'bg-white/[0.04] border border-white/[0.08] text-white/85 placeholder:text-white/20 focus:border-white/25'

  return (
    <div className="space-y-8">
      <ToastNotification toast={toast} onDismiss={() => setToast(null)} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <a href="/admin" className={`text-[12px] transition-all duration-200 ${
            isLight ? 'text-black/35 hover:text-black/60' : 'text-white/35 hover:text-white/60'
          }`}>
            ← Dashboard
          </a>
          <h1 className={`text-xl font-semibold tracking-tight mt-1 ${textPrimary}`}>
            {creator.display_name}
          </h1>
          <p className={`text-[12px] mt-1 ${textTertiary}`}>
            Settings · Accounts & integrations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`/admin/creators/${creator.id}/analysis`}
            className={`px-4 py-1.5 text-[12px] border rounded-lg transition-all duration-200 ${
              isLight ? 'text-black/50 border-black/[0.08] hover:bg-black/[0.05]' : 'text-white/50 border-white/[0.08] hover:bg-white/[0.05]'
            }`}
          >
            Social & Analytics
          </a>
          <a
            href={`/admin/creators/${creator.id}/edit`}
            className={`px-4 py-1.5 text-[12px] border rounded-lg transition-all duration-200 ${
              isLight ? 'text-black/50 border-black/[0.08] hover:bg-black/[0.05]' : 'text-white/50 border-white/[0.08] hover:bg-white/[0.05]'
            }`}
          >
            LinkMe Page
          </a>
          <a
            href={`/admin/conversions?creator=${creator.id}`}
            className={`px-4 py-1.5 text-[12px] border rounded-lg transition-all duration-200 ${
              isLight ? 'text-black/50 border-black/[0.08] hover:bg-black/[0.05]' : 'text-white/50 border-white/[0.08] hover:bg-white/[0.05]'
            }`}
          >
            Conversions
          </a>
        </div>
      </div>

      {/* ─── OnlyFans Account (single) ─── */}
      <section className={`rounded-xl border ${cardCls} overflow-hidden`}>
        <div className={`px-5 py-4 border-b ${isLight ? 'border-black/[0.06]' : 'border-white/[0.06]'}`}>
          <h2 className={`text-[13px] font-semibold ${textPrimary}`}>OnlyFans Account</h2>
          <p className={`text-[11px] mt-0.5 ${textTertiary}`}>
            Each creator has exactly one OF handle. This is the primary mapping to Infloww.
          </p>
        </div>
        <div className="px-5 py-4 flex items-center gap-2">
          <label className={`text-[11px] w-32 ${textTertiary}`}>OF @handle</label>
          <div className={`flex items-center flex-1 max-w-md rounded-lg ${inputCls}`}>
            <span className={`pl-3 text-[13px] ${textTertiary}`}>@</span>
            <input
              type="text"
              value={ofHandleDraft}
              onChange={e => setOfHandleDraft(e.target.value)}
              onBlur={saveOfHandle}
              onKeyDown={e => {
                if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
                if (e.key === 'Escape') { setOfHandleDraft(ofHandle); (e.target as HTMLInputElement).blur() }
              }}
              placeholder="handle"
              className="flex-1 px-1 py-1.5 bg-transparent text-[13px] outline-none"
              disabled={ofHandleSaving}
            />
          </div>
          {ofHandle && (
            <span className={`text-[11px] ${textTertiary}`}>
              onlyfans.com/{ofHandle}
            </span>
          )}
        </div>
      </section>

      {/* ─── Conversion Accounts (multi) ─── */}
      <section className={`rounded-xl border ${cardCls} overflow-hidden`}>
        <div className={`px-5 py-4 border-b ${isLight ? 'border-black/[0.06]' : 'border-white/[0.06]'} flex items-center justify-between`}>
          <div>
            <h2 className={`text-[13px] font-semibold ${textPrimary}`}>Conversion Accounts</h2>
            <p className={`text-[11px] mt-0.5 ${textTertiary}`}>
              Sheet tabs from Conversion Tracking (main, alts, ESP, etc.). Each has its own daily target and daily numbers.
            </p>
          </div>
          <span className={`text-[11px] px-2 py-0.5 rounded-full ${
            isLight ? 'bg-black/[0.05] text-black/50' : 'bg-white/[0.06] text-white/50'
          }`}>
            {conversionAccounts.length} {conversionAccounts.length === 1 ? 'account' : 'accounts'}
          </span>
        </div>

        <div className={isLight ? 'divide-y divide-black/[0.05]' : 'divide-y divide-white/[0.05]'}>
          {conversionAccounts.length === 0 && (
            <div className={`px-5 py-6 text-[12px] text-center ${textTertiary}`}>
              No conversion accounts yet. Add one below.
            </div>
          )}

          {conversionAccounts.map(account => (
            <div key={account.id} className="px-5 py-3.5 flex items-center gap-4">
              <div className="flex-1 min-w-0 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[13px] font-medium ${textPrimary} font-mono`}>@{account.handle}</span>
                    {!account.display_label && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                        isLight ? 'bg-blue-500/10 text-blue-600' : 'bg-blue-500/15 text-blue-400'
                      }`}>MAIN</span>
                    )}
                    {account.display_label && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        isLight ? 'bg-black/[0.05] text-black/50' : 'bg-white/[0.06] text-white/50'
                      }`}>
                        {account.display_label}
                      </span>
                    )}
                    {!account.is_active && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        isLight ? 'bg-amber-500/10 text-amber-600' : 'bg-amber-500/15 text-amber-400'
                      }`}>
                        Inactive
                      </span>
                    )}
                  </div>
                  {account.sheet_tab_name && (
                    <p className={`text-[11px] mt-0.5 ${textTertiary}`}>
                      Sheet tab: {account.sheet_tab_name}
                    </p>
                  )}
                </div>

                {/* Label editor */}
                <input
                  type="text"
                  value={account.display_label || ''}
                  onChange={e => {
                    const v = e.target.value
                    setConversionAccounts(prev => prev.map(a => a.id === account.id ? { ...a, display_label: v } : a))
                  }}
                  onBlur={e => {
                    const v = e.target.value.trim() || null
                    if (v !== account.display_label) {
                      updateConversionAccount(account.id, { display_label: v })
                    }
                  }}
                  placeholder="Label (e.g. alt, ESP)"
                  className={`w-32 px-2.5 py-1.5 rounded-lg text-[12px] outline-none transition-colors ${inputCls}`}
                />

                {/* Sheet tab editor */}
                <input
                  type="text"
                  value={account.sheet_tab_name || ''}
                  onChange={e => {
                    const v = e.target.value
                    setConversionAccounts(prev => prev.map(a => a.id === account.id ? { ...a, sheet_tab_name: v } : a))
                  }}
                  onBlur={e => {
                    const v = e.target.value.trim() || null
                    if (v !== account.sheet_tab_name) {
                      updateConversionAccount(account.id, { sheet_tab_name: v })
                    }
                  }}
                  placeholder="Sheet tab"
                  className={`w-40 px-2.5 py-1.5 rounded-lg text-[12px] outline-none transition-colors ${inputCls}`}
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => updateConversionAccount(account.id, { is_active: !account.is_active })}
                  className={`w-8 h-[18px] rounded-full transition-colors relative ml-1 ${
                    account.is_active
                      ? isLight ? 'bg-black/80' : 'bg-white/80'
                      : isLight ? 'bg-black/10' : 'bg-white/10'
                  }`}
                  title={account.is_active ? 'Active — click to deactivate' : 'Inactive — click to activate'}
                >
                  <div className={`w-3.5 h-3.5 rounded-full absolute top-[2px] transition-all ${
                    account.is_active
                      ? isLight ? 'left-[17px] bg-white' : 'left-[17px] bg-black'
                      : isLight ? 'left-[2px] bg-black/30' : 'left-[2px] bg-white/30'
                  }`} />
                </button>
                {isSuperAdmin && (
                  <button
                    onClick={() => deleteConversionAccount(account.id, account.handle)}
                    className={`px-2.5 py-1 text-[11px] rounded-lg transition-all duration-200 ml-1 ${
                      isLight ? 'text-red-500/70 hover:text-red-600 hover:bg-red-500/[0.08]' : 'text-red-400/70 hover:text-red-400 hover:bg-red-500/[0.12]'
                    }`}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add conversion account row */}
        <div className={`px-5 py-3.5 border-t ${isLight ? 'border-black/[0.06] bg-black/[0.015]' : 'border-white/[0.06] bg-white/[0.015]'} flex items-center gap-2`}>
          <div className="flex-1 flex items-center gap-2">
            <div className={`flex items-center gap-1 flex-1 max-w-[180px] rounded-lg ${inputCls}`}>
              <span className={`pl-3 text-[13px] ${textTertiary}`}>@</span>
              <input
                type="text"
                value={newConvHandle}
                onChange={e => setNewConvHandle(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') addConversionAccount() }}
                placeholder="handle"
                className="flex-1 px-1 py-1.5 bg-transparent text-[13px] outline-none"
                disabled={addingConv}
              />
            </div>
            <input
              type="text"
              value={newConvLabel}
              onChange={e => setNewConvLabel(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addConversionAccount() }}
              placeholder="Label (optional)"
              className={`w-32 px-2.5 py-1.5 rounded-lg text-[12px] outline-none ${inputCls}`}
              disabled={addingConv}
            />
            <input
              type="text"
              value={newConvSheet}
              onChange={e => setNewConvSheet(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addConversionAccount() }}
              placeholder="Sheet tab (optional)"
              className={`w-40 px-2.5 py-1.5 rounded-lg text-[12px] outline-none ${inputCls}`}
              disabled={addingConv}
            />
          </div>
          <button
            onClick={addConversionAccount}
            disabled={addingConv || !newConvHandle.trim()}
            className={`px-4 py-1.5 text-[12px] font-medium rounded-lg transition-all disabled:opacity-40 ${
              isLight ? 'bg-black text-white hover:bg-black/90' : 'bg-white text-black hover:bg-white/90'
            }`}
          >
            {addingConv ? 'Adding…' : 'Add account'}
          </button>
        </div>
      </section>

      {/* ─── Infloww Mapping ─── */}
      <section className={`rounded-xl border ${cardCls} overflow-hidden`}>
        <div className={`px-5 py-4 border-b ${isLight ? 'border-black/[0.06]' : 'border-white/[0.06]'}`}>
          <h2 className={`text-[13px] font-semibold ${textPrimary}`}>Infloww Mapping</h2>
          <p className={`text-[11px] mt-0.5 ${textTertiary}`}>
            Link this creator to their Infloww profile for revenue tracking. Infloww's handle (@user_name) should match the OF handle above.
          </p>
        </div>
        <div className="px-5 py-4 space-y-3">
          {inflowwCreators.length === 0 ? (
            <p className={`text-[12px] ${textTertiary}`}>
              No Infloww creators cached yet. Go to Revenue and fetch once to populate.
            </p>
          ) : (
            <>
              {autoMatchableInfloww && !inflowwMapping && (
                <div className={`flex items-center justify-between px-3 py-2.5 rounded-lg border ${
                  isLight ? 'bg-emerald-500/[0.06] border-emerald-500/20' : 'bg-emerald-500/[0.06] border-emerald-500/20'
                }`}>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`text-[11px] font-medium ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`}>
                      Auto-match found:
                    </span>
                    <span className={`text-[12px] font-mono truncate ${textPrimary}`}>
                      {autoMatchableInfloww.name} <span className={textTertiary}>(@{autoMatchableInfloww.user_name})</span>
                    </span>
                  </div>
                  <button
                    onClick={() => saveInflowwMapping(autoMatchableInfloww.infloww_id)}
                    className={`px-3 py-1 text-[11px] rounded-md transition-colors ${
                      isLight ? 'bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25' : 'bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25'
                    }`}
                  >
                    Apply
                  </button>
                </div>
              )}
              <div className="flex items-center gap-2">
                <label className={`text-[11px] w-32 ${textTertiary}`}>Infloww Creator</label>
                <select
                  value={inflowwMapping}
                  onChange={e => saveInflowwMapping(e.target.value)}
                  disabled={inflowwMappingSaving}
                  className={`flex-1 max-w-md px-3 py-1.5 rounded-lg text-[13px] outline-none transition-colors ${inputCls} ${
                    inflowwMappingSaving ? 'opacity-50' : ''
                  }`}
                >
                  <option value="">— Not mapped —</option>
                  {inflowwCreators
                    .slice()
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map(ic => (
                      <option key={ic.infloww_id} value={ic.infloww_id}>
                        {ic.name} (@{ic.user_name})
                      </option>
                    ))}
                </select>
              </div>
              {inflowwMapping && currentMapping && (
                <p className={`text-[11px] ${textTertiary}`}>
                  Currently mapped to <span className={textSecondary}>{currentMapping.infloww_creator_name}</span>
                </p>
              )}
            </>
          )}
        </div>
      </section>

      {/* ─── LinkMe App Access ─── */}
      <section className={`rounded-xl border ${cardCls} overflow-hidden`}>
        <div className={`px-5 py-4 border-b ${isLight ? 'border-black/[0.06]' : 'border-white/[0.06]'}`}>
          <h2 className={`text-[13px] font-semibold ${textPrimary}`}>LinkMe App</h2>
          <p className={`text-[11px] mt-0.5 ${textTertiary}`}>
            Controls whether this creator has a public LinkMe page and link routing enabled.
          </p>
        </div>
        <div className="px-5 py-4 flex items-center justify-between">
          <div>
            <p className={`text-[13px] font-medium ${textPrimary}`}>
              LinkMe {linkmeEnabled ? 'enabled' : 'disabled'}
            </p>
            <p className={`text-[11px] mt-0.5 ${textTertiary}`}>
              {linkmeEnabled
                ? `Active at /${creator.slug}${creator.custom_domain ? ` · ${creator.custom_domain}` : ''}`
                : 'Public page and short-link routing are off.'}
            </p>
          </div>
          <button
            onClick={toggleLinkMe}
            disabled={linkmeSaving}
            className={`w-11 h-6 rounded-full transition-colors relative disabled:opacity-50 ${
              linkmeEnabled
                ? isLight ? 'bg-black/85' : 'bg-white/85'
                : isLight ? 'bg-black/10' : 'bg-white/10'
            }`}
          >
            <div className={`w-5 h-5 rounded-full absolute top-[2px] transition-all ${
              linkmeEnabled
                ? isLight ? 'left-[22px] bg-white' : 'left-[22px] bg-black'
                : isLight ? 'left-[2px] bg-black/40' : 'left-[2px] bg-white/40'
            }`} />
          </button>
        </div>
      </section>

      {/* ─── Quick References ─── */}
      <div className={`rounded-xl border ${cardCls} px-5 py-4 grid grid-cols-1 md:grid-cols-3 gap-4`}>
        <div>
          <p className={`text-[10px] uppercase tracking-widest ${textTertiary}`}>OF @handle</p>
          <p className={`text-[14px] font-mono font-medium mt-1 ${textPrimary}`}>
            {ofHandle ? `@${ofHandle}` : <span className={textTertiary}>— not set —</span>}
          </p>
        </div>
        <div>
          <p className={`text-[10px] uppercase tracking-widest ${textTertiary}`}>Slug</p>
          <p className={`text-[14px] font-mono mt-1 ${textSecondary}`}>{creator.slug}</p>
        </div>
        <div>
          <p className={`text-[10px] uppercase tracking-widest ${textTertiary}`}>Conversion accounts</p>
          <p className={`text-[14px] mt-1 ${textSecondary}`}>{conversionAccounts.length}</p>
        </div>
      </div>
    </div>
  )
}
