'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, Button } from './ui'
import { useTheme } from './ThemeProvider'
import { parseNewCreator } from '@/lib/creator-input'

export default function NewCreatorClient({ inflowwCreators }: { inflowwCreators: { infloww_id: string; name: string; user_name: string }[] }) {
  const { resolved } = useTheme()
  const [name, setName] = useState('')
  const [handle, setHandle] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const input = `mt-1 w-full rounded-lg border p-3 ${resolved === 'light' ? 'border-black/10 bg-white text-black' : 'border-white/10 bg-neutral-900 text-white'}`

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    const parsed = parseNewCreator({ display_name: name, of_handle: handle })
    if (!parsed.ok) {
      setError(parsed.error)
      return
    }
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/creators', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      })
      const body = await res.json().catch(() => null)
      if (!res.ok) throw new Error(res.status === 401 ? 'Please sign in again.' : res.status === 403 ? 'Only administrators can add creators.' : body?.error || 'Could not add the creator. Please try again.')
      if (!body?.id) throw new Error('The save response was incomplete. Check All creators before trying again.')
      // Reload the shared sidebar too: its creator list is cached in memory.
      window.location.assign(`/admin/creators/${body.id}/settings`)
    } catch (err) {
      setError(err instanceof TypeError ? 'Connection lost. Please try again. Your entries are still here.' : err instanceof Error ? err.message : 'Could not add the creator. Please try again.')
    } finally { setSaving(false) }
  }

  return <div className="max-w-xl">
    <Link href="/admin/creators" className="text-sm text-pink-500">← All creators</Link>
    <h1 className="mt-4 mb-2 text-2xl font-bold">Add creator</h1>
    <p className="mb-6 text-sm opacity-60">An active creator appears in Daily subs immediately. Enter their name to get started. You can connect their OnlyFans account now or later in Settings.</p>
    <Card className="p-5"><form onSubmit={submit}>
      <fieldset disabled={saving} className="space-y-4 min-w-0">
        <label className="block text-sm">Infloww account<select className={input} defaultValue="" onChange={e => { const c = inflowwCreators.find(c => c.infloww_id === e.target.value); if (c) { setName(c.name); setHandle(c.user_name) } }}><option value="">Select an account…</option>{inflowwCreators.map(c => <option key={c.infloww_id} value={c.infloww_id}>{c.name} — @{c.user_name}</option>)}</select></label>
        <label className="block text-sm">Creator name<input className={input} required maxLength={255} value={name} onChange={e => setName(e.target.value)} /></label>
        <label className="block text-sm">OnlyFans handle or profile link (optional)<input className={input} value={handle} onChange={e => setHandle(e.target.value)} placeholder="e.g. @jennasawyer or https://onlyfans.com/jennasawyer" /><span className="mt-1 block text-xs opacity-60">Leave blank if their account is not available yet.</span></label>
        {error && <p role="alert" className="rounded-lg bg-red-500/10 p-3 text-sm text-red-500">{error}</p>}
        <Button type="submit" variant="primary" loading={saving}>Add creator</Button>
      </fieldset>
    </form></Card>
  </div>
}
