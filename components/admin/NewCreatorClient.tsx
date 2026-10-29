'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, Button } from './ui'
import { useTheme } from './ThemeProvider'

export default function NewCreatorClient({ inflowwCreators }: { inflowwCreators: { infloww_id: string; name: string; user_name: string }[] }) {
  const router = useRouter()
  const { resolved } = useTheme()
  const [name, setName] = useState('')
  const [handle, setHandle] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const input = `mt-1 w-full rounded-lg border p-3 ${resolved === 'light' ? 'border-black/10 bg-white text-black' : 'border-white/10 bg-neutral-900 text-white'}`

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const cleanHandle = handle.trim().replace(/^@/, '')
      const res = await fetch('/api/admin/creators', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_name: name.trim(), of_handle: cleanHandle, slug: cleanHandle.toLowerCase(), is_active: true }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(res.status === 401 ? 'Please sign in again.' : res.status === 403 ? 'Only administrators can add creators.' : 'Could not add the creator. Check whether this handle already exists and try again.')
      router.push(`/admin/creators/${body.id}/settings`)
      router.refresh()
    } catch (err) {
      setError(err instanceof TypeError ? 'Connection lost. Please try again. Your entries are still here.' : err instanceof Error ? err.message : 'Could not add the creator. Please try again.')
    } finally { setSaving(false) }
  }

  return <div className="max-w-xl">
    <Link href="/admin/creators" className="text-sm text-pink-500">← All creators</Link>
    <h1 className="mt-4 mb-2 text-2xl font-bold">Add creator</h1>
    <p className="mb-6 text-sm opacity-60">An active creator appears in Daily subs immediately. Select their OnlyFans account from Infloww or enter the details below.</p>
    <Card className="p-5"><form onSubmit={submit}>
      <fieldset disabled={saving} className="space-y-4 min-w-0">
        <label className="block text-sm">Infloww account<select className={input} defaultValue="" onChange={e => { const c = inflowwCreators.find(c => c.infloww_id === e.target.value); if (c) { setName(c.name); setHandle(c.user_name) } }}><option value="">Select an account…</option>{inflowwCreators.map(c => <option key={c.infloww_id} value={c.infloww_id}>{c.name} — @{c.user_name}</option>)}</select></label>
        <label className="block text-sm">Creator name<input className={input} required value={name} onChange={e => setName(e.target.value)} /></label>
        <label className="block text-sm">OnlyFans handle<input className={input} required pattern="@?[A-Za-z0-9_.-]+" value={handle} onChange={e => setHandle(e.target.value)} placeholder="e.g. jennasawyer" /></label>
        {error && <p role="alert" className="rounded-lg bg-red-500/10 p-3 text-sm text-red-500">{error}</p>}
        <Button type="submit" variant="primary" loading={saving}>Add creator</Button>
      </fieldset>
    </form></Card>
  </div>
}
