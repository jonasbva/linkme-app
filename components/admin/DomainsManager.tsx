'use client'

import { useState, useEffect, useCallback } from 'react'

interface Creator {
  id: string
  display_name: string
  slug: string
  custom_domain: string | null
}

interface DomainStatus {
  checking: boolean
  verified: boolean | null
  resolvedCname: string | null
  resolvedA: string | null
  error?: string
}

const CNAME_TARGET = 'cname.vercel-dns.com'

// ─── Toast ───────────────────────────────────────────────────────────────────
type Toast = { message: string; type: 'success' | 'error' }

function ToastBanner({ toast, onDismiss }: { toast: Toast | null; onDismiss: () => void }) {
  useEffect(() => {
    if (toast) { const t = setTimeout(onDismiss, 4000); return () => clearTimeout(t) }
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

// ─── DNS status badge ────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: DomainStatus }) {
  if (status.checking) {
    return (
      <span className="flex items-center gap-1.5 text-[12px] text-white/40">
        <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-pulse" />
        Checking…
      </span>
    )
  }
  if (status.verified === null) {
    return (
      <span className="flex items-center gap-1.5 text-[12px] text-white/30">
        <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
        Not checked
      </span>
    )
  }
  if (status.verified) {
    return (
      <span className="flex items-center gap-1.5 text-[12px] text-emerald-400">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        Verified
      </span>
    )
  }
  return (
    <span className="flex items-center gap-1.5 text-[12px] text-amber-400">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
      Not configured
    </span>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function DomainsManager({ initialCreators }: { initialCreators: Creator[] }) {
  const [creators, setCreators] = useState<Creator[]>(initialCreators)
  const [statuses, setStatuses] = useState<Record<string, DomainStatus>>({})
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [toast, setToast] = useState<Toast | null>(null)

  // For adding a new domain
  const [selectedCreatorId, setSelectedCreatorId] = useState('')
  const [newDomain, setNewDomain] = useState('')
  const [addSaving, setAddSaving] = useState(false)

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type })
  }

  const checkDomain = useCallback(async (creatorId: string, domain: string) => {
    setStatuses(prev => ({ ...prev, [creatorId]: { checking: true, verified: null, resolvedCname: null, resolvedA: null } }))
    try {
      const res = await fetch(`/api/admin/check-domain?domain=${encodeURIComponent(domain)}`)
      const data = await res.json()
      setStatuses(prev => ({
        ...prev,
        [creatorId]: {
          checking: false,
          verified: data.verified,
          resolvedCname: data.resolvedCname,
          resolvedA: data.resolvedA,
          error: data.error,
        },
      }))
    } catch {
      setStatuses(prev => ({ ...prev, [creatorId]: { checking: false, verified: false, resolvedCname: null, resolvedA: null, error: 'Network error' } }))
    }
  }, [])

  // Auto-check all existing domains on mount
  useEffect(() => {
    creators.forEach(c => {
      if (c.custom_domain) checkDomain(c.id, c.custom_domain)
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function saveDomain(creatorId: string, domain: string | null) {
    const res = await fetch(`/api/admin/creators/${creatorId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ custom_domain: domain || null }),
    })
    return res.ok
  }

  async function addDomain() {
    if (!selectedCreatorId || !newDomain.trim()) return
    const domain = newDomain.trim().replace(/^https?:\/\//, '').replace(/\/$/, '')
    setAddSaving(true)
    const ok = await saveDomain(selectedCreatorId, domain)
    if (ok) {
      setCreators(prev => prev.map(c => c.id === selectedCreatorId ? { ...c, custom_domain: domain } : c))
      setNewDomain('')
      setSelectedCreatorId('')
      showToast('Domain added', 'success')
      checkDomain(selectedCreatorId, domain)
    } else {
      showToast('Failed to save domain', 'error')
    }
    setAddSaving(false)
  }

  async function removeDomain(creatorId: string) {
    const ok = await saveDomain(creatorId, null)
    if (ok) {
      setCreators(prev => prev.map(c => c.id === creatorId ? { ...c, custom_domain: null } : c))
      setStatuses(prev => { const next = { ...prev }; delete next[creatorId]; return next })
      if (expandedId === creatorId) setExpandedId(null)
      showToast('Domain removed', 'success')
    } else {
      showToast('Failed to remove domain', 'error')
    }
  }

  const domainsCreators = creators.filter(c => c.custom_domain)
  const unassigned = creators.filter(c => !c.custom_domain)

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">
      <ToastBanner toast={toast} onDismiss={() => setToast(null)} />

      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Domains</h1>
        <p className="text-[12px] text-white/30 mt-1">
          Manage custom domains for your creators. Point each domain's CNAME to{' '}
          <code className="text-white/50 bg-white/[0.06] px-1.5 py-0.5 rounded text-[11px]">{CNAME_TARGET}</code>
        </p>
      </div>

      {/* Active domains */}
      <div className="space-y-3">
        <p className="text-[11px] text-white/30 font-medium uppercase tracking-widest">
          {domainsCreators.length} active domain{domainsCreators.length !== 1 ? 's' : ''}
        </p>

        {domainsCreators.length === 0 && (
          <div className="py-10 text-center text-white/20 text-[13px] border border-dashed border-white/[0.06] rounded-xl">
            No custom domains yet
          </div>
        )}

        {domainsCreators.map(creator => {
          const status = statuses[creator.id] || { checking: false, verified: null, resolvedCname: null, resolvedA: null }
          const expanded = expandedId === creator.id

          return (
            <div key={creator.id} className="bg-white/[0.03] border border-white/[0.07] rounded-xl overflow-hidden">
              {/* Main row */}
              <div className="flex items-center gap-4 px-5 py-4">
                {/* Domain + creator */}
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-white/90">{creator.custom_domain}</p>
                  <p className="text-[11px] text-white/30 mt-0.5">
                    → <a href={`/admin/creators/${creator.id}/edit`} className="hover:text-white/50 transition-colors">{creator.display_name}</a>
                    <span className="text-white/15 ml-1">/{creator.slug}</span>
                  </p>
                </div>

                {/* Status badge */}
                <StatusBadge status={status} />

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => checkDomain(creator.id, creator.custom_domain!)}
                    disabled={status.checking}
                    className="px-3 py-1 text-[11px] text-white/35 border border-white/[0.06] rounded-lg hover:bg-white/[0.04] transition-colors disabled:opacity-30"
                  >
                    Check DNS
                  </button>
                  <button
                    onClick={() => setExpandedId(expanded ? null : creator.id)}
                    className="px-3 py-1 text-[11px] text-white/35 border border-white/[0.06] rounded-lg hover:bg-white/[0.04] transition-colors"
                  >
                    {expanded ? 'Hide setup' : 'Setup'}
                  </button>
                  <button
                    onClick={() => removeDomain(creator.id)}
                    className="text-[11px] text-white/20 hover:text-red-400/70 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>

              {/* DNS setup instructions */}
              {expanded && (
                <div className="border-t border-white/[0.06] px-5 py-4 space-y-4">
                  <p className="text-[12px] text-white/50 font-medium">DNS Configuration</p>

                  {/* CNAME record */}
                  <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl overflow-hidden">
                    <div className="grid grid-cols-3 text-[11px] text-white/30 uppercase tracking-widest px-4 py-2 border-b border-white/[0.05]">
                      <span>Type</span>
                      <span>Name</span>
                      <span>Value</span>
                    </div>
                    <div className="grid grid-cols-3 text-[13px] px-4 py-3 font-mono">
                      <span className="text-blue-400">CNAME</span>
                      <span className="text-white/70">{creator.custom_domain?.startsWith('www.') ? 'www' : '@'}</span>
                      <span className="text-white/70">{CNAME_TARGET}</span>
                    </div>
                  </div>

                  {/* Current resolution */}
                  {(status.resolvedCname || status.resolvedA) && (
                    <div className="text-[12px] text-white/30 space-y-1">
                      <p className="font-medium text-white/40">Currently resolving to:</p>
                      {status.resolvedCname && <p>CNAME → <span className="text-white/60 font-mono">{status.resolvedCname}</span></p>}
                      {status.resolvedA && <p>A → <span className="text-white/60 font-mono">{status.resolvedA}</span></p>}
                    </div>
                  )}

                  {/* Status explanation */}
                  {status.verified === false && !status.checking && (
                    <div className="text-[12px] text-amber-400/70 bg-amber-400/[0.06] border border-amber-400/[0.1] rounded-lg px-4 py-3">
                      DNS not pointing to Vercel yet. Add the CNAME record above in your domain registrar, then click Check DNS. Changes can take up to 48h to propagate.
                    </div>
                  )}
                  {status.verified && (
                    <div className="text-[12px] text-emerald-400/70 bg-emerald-400/[0.06] border border-emerald-400/[0.1] rounded-lg px-4 py-3">
                      Domain is correctly pointed to Vercel. Make sure it's also added in your Vercel project settings under Domains.
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Add domain */}
      <div className="border border-dashed border-white/[0.1] rounded-xl p-5 space-y-4">
        <p className="text-[12px] text-white/40 font-medium">Add custom domain</p>
        <div className="flex gap-3 items-end flex-wrap">
          <div className="flex-1 min-w-[200px] space-y-1.5">
            <label className="text-[11px] text-white/30">Domain</label>
            <input
              type="text"
              value={newDomain}
              onChange={e => setNewDomain(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addDomain()}
              placeholder="lilybrown.com"
              className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-[13px] text-white/80 placeholder:text-white/15 focus:border-white/15 transition-colors outline-none"
            />
          </div>
          <div className="flex-1 min-w-[200px] space-y-1.5">
            <label className="text-[11px] text-white/30">Creator</label>
            <select
              value={selectedCreatorId}
              onChange={e => setSelectedCreatorId(e.target.value)}
              className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-[13px] text-white/80 focus:border-white/15 transition-colors outline-none"
            >
              <option value="">Select creator…</option>
              {creators.map(c => (
                <option key={c.id} value={c.id}>
                  {c.display_name}{c.custom_domain ? ` (${c.custom_domain})` : ''}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={addDomain}
            disabled={addSaving || !newDomain.trim() || !selectedCreatorId}
            className="px-5 py-2 bg-white text-black text-[13px] font-medium rounded-lg hover:bg-white/90 transition-colors disabled:opacity-30 shrink-0"
          >
            {addSaving ? 'Saving…' : 'Add domain'}
          </button>
        </div>

        {/* Quick DNS reminder */}
        <p className="text-[11px] text-white/20">
          After adding, point your domain's CNAME record to <span className="text-white/40 font-mono">{CNAME_TARGET}</span> and add it in Vercel project → Settings → Domains.
        </p>
      </div>
    </div>
  )
}
