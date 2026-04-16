'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from './ThemeProvider'

interface OFAccount {
  id: string
  handle: string
  display_label: string | null
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
  is_active: boolean
}

interface Props {
  creator: Creator
  ofAccounts: OFAccount[]
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

export default function SettingsClient({ creator, ofAccounts: initialOfAccounts, inflowwCreators, currentMapping, isSuperAdmin }: Props) {
  const router = useRouter()
  const { resolved } = useTheme()
  const isLight = resolved === 'light'
  const [toast, setToast] = useState<Toast | null>(null)

  const [ofAccounts, setOfAccounts] = useState<OFAccount[]>(initialOfAccounts)
  const [linkmeEnabled, setLinkmeEnabled] = useState(!!creator.linkme_enabled)
  const [linkmeSaving, setLinkmeSaving] = useState(false)

  // New OF account form
  const [newHandle, setNewHandle] = useState('')
  const [newLabel, setNewLabel] = useState('')
  const [addingAccount, setAddingAccount] = useState(false)

  // Infloww mapping
  const [inflowwMapping, setInflowwMapping] = useState<string>(currentMapping?.infloww_creator_id || '')
  const [inflowwMappingSaving, setInflowwMappingSaving] = useState(false)

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type })
  }

  // ─── LinkMe toggle ─────────────────────────────────────────────
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

  // ─── Add OF account ────────────────────────────────────────────
  async function addAccount() {
    const handle = newHandle.trim().replace(/^@/, '')
    if (!handle) {
      showToast('Handle is required', 'error')
      return
    }
    setAddingAccount(true)
    try {
      const res = await fetch(`/api/admin/creators/${creator.id}/of-accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handle, display_label: newLabel.trim() || null }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'failed')
      setOfAccounts(prev => [...prev, json.account])
      setNewHandle('')
      setNewLabel('')
      showToast('OF account added', 'success')
      router.refresh()
    } catch (e: any) {
      showToast(e.message || 'Failed to add account', 'error')
    } finally {
      setAddingAccount(false)
    }
  }

  // ─── Update OF account (handle / label / active) ──────────────
  async function updateAccount(id: string, patch: Partial<OFAccount>) {
    const prev = ofAccounts
    setOfAccounts(prev.map(a => a.id === id ? { ...a, ...patch } : a))
    try {
      const res = await fetch(`/api/admin/creators/${creator.id}/of-accounts/${id}`, {
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
      setOfAccounts(prev) // revert
      showToast(e.message || 'Failed to save', 'error')
    }
  }

  // ─── Delete OF account ────────────────────────────────────────
  async function deleteAccount(id: string, handle: string) {
    if (!confirm(`Delete @${handle}? This will unlink any conversion data tied to it.`)) return
    try {
      const res = await fetch(`/api/admin/creators/${creator.id}/of-accounts/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'failed')
      }
      setOfAccounts(prev => prev.filter(a => a.id !== id))
      showToast('OF account deleted', 'success')
      router.refresh()
    } catch (e: any) {
      showToast(e.message || 'Failed to delete', 'error')
    }
  }

  // ─── Make account the main (set display_label=null, push others to "alt") ──
  async function makeMain(id: string) {
    const target = ofAccounts.find(a => a.id === id)
    if (!target) return
    await updateAccount(id, { display_label: null })
    // optimistic: ensure no two mains
    for (const a of ofAccounts) {
      if (a.id !== id && !a.display_label) {
        await updateAccount(a.id, { display_label: 'alt' })
      }
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

  // Try to auto-match Infloww creator by @handle across this creator's OF accounts
  const autoMatchableInfloww = (() => {
    if (inflowwMapping || inflowwCreators.length === 0) return null
    const handles = new Set(ofAccounts.map(a => a.handle.toLowerCase()))
    const match = inflowwCreators.find(ic => handles.has(ic.user_name?.toLowerCase()))
    return match || null
  })()

  const mainAccount = ofAccounts.find(a => !a.display_label) || ofAccounts[0]

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

      {/* ─── OnlyFans Accounts ─── */}
      <section className={`rounded-xl border ${cardCls} overflow-hidden`}>
        <div className={`px-5 py-4 border-b ${isLight ? 'border-black/[0.06]' : 'border-white/[0.06]'} flex items-center justify-between`}>
          <div>
            <h2 className={`text-[13px] font-semibold ${textPrimary}`}>OnlyFans Accounts</h2>
            <p className={`text-[11px] mt-0.5 ${textTertiary}`}>
              The @handle is the primary mapping to Infloww. Mark one as the main account.
            </p>
          </div>
          <span className={`text-[11px] px-2 py-0.5 rounded-full ${
            isLight ? 'bg-black/[0.05] text-black/50' : 'bg-white/[0.06] text-white/50'
          }`}>
            {ofAccounts.length} {ofAccounts.length === 1 ? 'account' : 'accounts'}
          </span>
        </div>

        <div className={isLight ? 'divide-y divide-black/[0.05]' : 'divide-y divide-white/[0.05]'}>
          {ofAccounts.length === 0 && (
            <div className={`px-5 py-6 text-[12px] text-center ${textTertiary}`}>
              No OF accounts yet. Add one below.
            </div>
          )}

          {ofAccounts.map(account => {
            const isMain = !account.display_label
            return (
              <div key={account.id} className="px-5 py-3.5 flex items-center gap-4">
                <div className="flex-1 min-w-0 flex items-center gap-3">
                  <div className={`flex-1 min-w-0`}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[13px] font-medium ${textPrimary} font-mono`}>@{account.handle}</span>
                      {isMain && (
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
                    <p className={`text-[11px] mt-0.5 ${textTertiary}`}>
                      onlyfans.com/{account.handle}
                    </p>
                  </div>

                  {/* Label editor */}
                  <input
                    type="text"
                    value={account.display_label || ''}
                    onChange={e => {
                      const v = e.target.value
                      setOfAccounts(prev => prev.map(a => a.id === account.id ? { ...a, display_label: v } : a))
                    }}
                    onBlur={e => {
                      const v = e.target.value.trim() || null
                      if (v !== account.display_label) {
                        updateAccount(account.id, { display_label: v })
                      }
                    }}
                    placeholder="Label (e.g. alt, ESP)"
                    className={`w-40 px-2.5 py-1.5 rounded-lg text-[12px] outline-none transition-colors ${inputCls}`}
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  {!isMain && (
                    <button
                      onClick={() => makeMain(account.id)}
                      className={`px-2.5 py-1 text-[11px] rounded-lg transition-all duration-200 ${
                        isLight ? 'text-black/50 hover:text-black/80 hover:bg-black/[0.04]' : 'text-white/45 hover:text-white/80 hover:bg-white/[0.05]'
                      }`}
                    >
                      Make main
                    </button>
                  )}
                  <button
                    onClick={() => updateAccount(account.id, { is_active: !account.is_active })}
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
                      onClick={() => deleteAccount(account.id, account.handle)}
                      className={`px-2.5 py-1 text-[11px] rounded-lg transition-all duration-200 ml-1 ${
                        isLight ? 'text-red-500/70 hover:text-red-600 hover:bg-red-500/[0.08]' : 'text-red-400/70 hover:text-red-400 hover:bg-red-500/[0.12]'
                      }`}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Add OF account row */}
        <div className={`px-5 py-3.5 border-t ${isLight ? 'border-black/[0.06] bg-black/[0.015]' : 'border-white/[0.06] bg-white/[0.015]'} flex items-center gap-2`}>
          <div className="flex-1 flex items-center gap-2">
            <div className={`flex items-center gap-1 flex-1 max-w-xs rounded-lg ${inputCls}`}>
              <span className={`pl-3 text-[13px] ${textTertiary}`}>@</span>
              <input
                type="text"
                value={newHandle}
                onChange={e => setNewHandle(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') addAccount() }}
                placeholder="handle"
                className="flex-1 px-1 py-1.5 bg-transparent text-[13px] outline-none"
                disabled={addingAccount}
              />
            </div>
            <input
              type="text"
              value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addAccount() }}
              placeholder="Label (optional)"
              className={`w-40 px-2.5 py-1.5 rounded-lg text-[12px] outline-none ${inputCls}`}
              disabled={addingAccount}
            />
          </div>
          <button
            onClick={addAccount}
            disabled={addingAccount || !newHandle.trim()}
            className={`px-4 py-1.5 text-[12px] font-medium rounded-lg transition-all disabled:opacity-40 ${
              isLight ? 'bg-black text-white hover:bg-black/90' : 'bg-white text-black hover:bg-white/90'
            }`}
          >
            {addingAccount ? 'Adding…' : 'Add account'}
          </button>
        </div>
      </section>

      {/* ─── Infloww Mapping ─── */}
      <section className={`rounded-xl border ${cardCls} overflow-hidden`}>
        <div className={`px-5 py-4 border-b ${isLight ? 'border-black/[0.06]' : 'border-white/[0.06]'}`}>
          <h2 className={`text-[13px] font-semibold ${textPrimary}`}>Infloww Mapping</h2>
          <p className={`text-[11px] mt-0.5 ${textTertiary}`}>
            Link this creator to their Infloww profile for revenue tracking. Infloww's handle (@user_name) should match one of the OF accounts above.
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
      {mainAccount && (
        <div className={`rounded-xl border ${cardCls} px-5 py-4 grid grid-cols-1 md:grid-cols-3 gap-4`}>
          <div>
            <p className={`text-[10px] uppercase tracking-widest ${textTertiary}`}>Main @handle</p>
            <p className={`text-[14px] font-mono font-medium mt-1 ${textPrimary}`}>@{mainAccount.handle}</p>
          </div>
          <div>
            <p className={`text-[10px] uppercase tracking-widest ${textTertiary}`}>Slug</p>
            <p className={`text-[14px] font-mono mt-1 ${textSecondary}`}>{creator.slug}</p>
          </div>
          <div>
            <p className={`text-[10px] uppercase tracking-widest ${textTertiary}`}>Total OF accounts</p>
            <p className={`text-[14px] mt-1 ${textSecondary}`}>{ofAccounts.length}</p>
          </div>
        </div>
      )}
    </div>
  )
}
