'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Mail, Shield } from 'lucide-react'
import { useTheme } from './ThemeProvider'
import { Card, Button } from './ui'

interface Props {
  email: string
  displayName: string
  isSuperAdmin: boolean
}

type Msg = { kind: 'success' | 'error'; text: string } | null

export default function ProfileClient({ email, displayName, isSuperAdmin }: Props) {
  const router = useRouter()
  const { resolved } = useTheme()
  const isLight = resolved === 'light'

  const textPrimary = isLight ? 'text-black/90' : 'text-white/95'
  const textSecondary = isLight ? 'text-black/55' : 'text-white/60'
  const textTertiary = isLight ? 'text-black/35' : 'text-white/40'
  const labelCls = `block text-[11px] font-medium mb-1.5 ${textTertiary}`
  const inputCls = `w-full rounded-lg px-3 py-2 text-[13px] outline-none transition-all duration-200 ${
    isLight
      ? 'bg-white border border-black/10 text-black/80 placeholder:text-black/25 focus:border-black/30'
      : 'bg-white/[0.04] border border-white/[0.08] text-white/85 placeholder:text-white/25 focus:border-white/25'
  }`

  // ── Display name ──
  const [name, setName] = useState(displayName)
  const [nameSaving, setNameSaving] = useState(false)
  const [nameMsg, setNameMsg] = useState<Msg>(null)

  async function saveName() {
    setNameSaving(true); setNameMsg(null)
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_display_name', display_name: name }),
      })
      const json = await res.json().catch(() => ({}))
      if (res.ok) {
        setNameMsg({ kind: 'success', text: 'Display name updated' })
        router.refresh() // refresh layout/sidebar name
      } else {
        setNameMsg({ kind: 'error', text: json.error || 'Failed to update' })
      }
    } catch {
      setNameMsg({ kind: 'error', text: 'Network error' })
    } finally {
      setNameSaving(false)
    }
  }

  // ── Password ──
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [pwSaving, setPwSaving] = useState(false)
  const [pwMsg, setPwMsg] = useState<Msg>(null)

  async function changePassword() {
    setPwMsg(null)
    if (next.length < 8) { setPwMsg({ kind: 'error', text: 'New password must be at least 8 characters' }); return }
    if (next !== confirm) { setPwMsg({ kind: 'error', text: 'New passwords do not match' }); return }
    setPwSaving(true)
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'change_password', current, new: next }),
      })
      const json = await res.json().catch(() => ({}))
      if (res.ok) {
        setPwMsg({ kind: 'success', text: 'Password changed' })
        setCurrent(''); setNext(''); setConfirm('')
      } else {
        setPwMsg({ kind: 'error', text: json.error || 'Failed to change password' })
      }
    } catch {
      setPwMsg({ kind: 'error', text: 'Network error' })
    } finally {
      setPwSaving(false)
    }
  }

  const MsgLine = ({ msg }: { msg: Msg }) => msg
    ? <p className={`text-[12px] mt-2 ${msg.kind === 'success' ? 'text-emerald-500' : 'text-red-400'}`}>{msg.text}</p>
    : null

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <h1 className={`text-xl font-semibold tracking-tight ${textPrimary}`}>Profile</h1>

      {/* Identity */}
      <Card className="p-5">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center text-[20px] font-semibold ${isLight ? 'bg-black/[0.06] text-black/50' : 'bg-white/[0.08] text-white/60'}`}>
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className={`text-[15px] font-semibold ${textPrimary}`}>{displayName}</p>
            <div className={`flex items-center gap-3 mt-1 text-[12px] ${textSecondary}`}>
              <span className="inline-flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{email}</span>
              <span className="inline-flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" />{isSuperAdmin ? 'Super admin' : 'Admin'}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Display name */}
      <Card className="p-5">
        <h2 className={`text-[13px] font-semibold mb-4 flex items-center gap-2 ${textPrimary}`}><User className="w-4 h-4" /> Display name</h2>
        <label className={labelCls}>Name</label>
        <div className="flex items-center gap-2">
          <input className={inputCls} value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
          <Button variant="primary" onClick={saveName} loading={nameSaving} disabled={!name.trim() || name.trim() === displayName}>Save</Button>
        </div>
        <MsgLine msg={nameMsg} />
      </Card>

      {/* Password */}
      <Card className="p-5">
        <h2 className={`text-[13px] font-semibold mb-4 flex items-center gap-2 ${textPrimary}`}><Shield className="w-4 h-4" /> Change password</h2>
        <div className="space-y-3">
          <div>
            <label className={labelCls}>Current password</label>
            <input type="password" className={inputCls} value={current} onChange={e => setCurrent(e.target.value)} autoComplete="current-password" />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>New password</label>
              <input type="password" className={inputCls} value={next} onChange={e => setNext(e.target.value)} autoComplete="new-password" />
            </div>
            <div>
              <label className={labelCls}>Confirm new password</label>
              <input type="password" className={inputCls} value={confirm} onChange={e => setConfirm(e.target.value)} autoComplete="new-password" />
            </div>
          </div>
        </div>
        <div className="mt-4">
          <Button variant="primary" onClick={changePassword} loading={pwSaving} disabled={!current || !next || !confirm}>Change password</Button>
        </div>
        <MsgLine msg={pwMsg} />
      </Card>
    </div>
  )
}
