'use client'

import { useCallback, useEffect, useState } from 'react'
import { Check, Copy, KeyRound, RefreshCw } from 'lucide-react'
import { useTheme } from './ThemeProvider'
import { Button, Card, Spinner } from './ui'

interface ApiUser {
  id: string
  display_name: string
  email: string
  is_active: boolean
  is_super_admin: boolean
}

interface ApiKey {
  id: string
  name: string
  prefix: string
  user_id: string
  created_at: string
  expires_at: string
  revoked_at: string | null
  last_used_at: string | null
  user: ApiUser | null
}

interface ApiRequest {
  id: string
  key_id: string
  method: string
  path: string
  status: number
  created_at: string
}

interface ApiKeyData {
  keys: ApiKey[]
  users: ApiUser[]
  recentRequests: ApiRequest[]
}

function formatDate(value: string | null): string {
  if (!value) return 'Never'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, cache: 'no-store' })
  const data = await response.json().catch(() => null)
  if (!response.ok) throw new Error(data?.error || `Request failed (${response.status}). Please try again.`)
  return data as T
}

export default function ApiKeysClient() {
  const { resolved } = useTheme()
  const isLight = resolved === 'light'
  const [data, setData] = useState<ApiKeyData>({ keys: [], users: [], recentRequests: [] })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [name, setName] = useState('Marlon')
  const [userId, setUserId] = useState('')
  const [expiryDays, setExpiryDays] = useState(90)
  const [creating, setCreating] = useState(false)
  const [newToken, setNewToken] = useState('')
  const [newKeyName, setNewKeyName] = useState('')
  const [copyStatus, setCopyStatus] = useState('')
  const [revokeId, setRevokeId] = useState<string | null>(null)
  const [revoking, setRevoking] = useState<string | null>(null)
  const [baseUrl, setBaseUrl] = useState('/api/v1')

  const text = isLight ? 'text-black/85' : 'text-white/90'
  const muted = isLight ? 'text-black/50' : 'text-white/50'
  const border = isLight ? 'border-black/[0.08]' : 'border-white/[0.08]'
  const input = `w-full rounded-lg border px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-pink-500/40 ${isLight ? 'border-black/10 bg-white text-black/85' : 'border-white/10 bg-[#181218] text-white/90'}`

  const load = useCallback(async () => {
    setRefreshing(true)
    try {
      const next = await requestJson<ApiKeyData>('/api/admin/api-keys')
      setData(next)
      setError('')
      setUserId(current => {
        if (current) return current
        const marlon = next.users.find(user => user.is_active && (/^marlon(?:\s|$)/i.test(user.display_name) || /^marlon[.@]/i.test(user.email)))
        return marlon?.id || ''
      })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load API keys.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    setBaseUrl(`${window.location.origin}/api/v1`)
    void load()
  }, [load])

  const selectedUser = data.users.find(user => user.id === userId)
  const activeUsers = data.users.filter(user => user.is_active)

  async function createKey(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!name.trim() || !selectedUser?.is_active || !Number.isInteger(expiryDays) || expiryDays < 1 || expiryDays > 365) return
    setCreating(true)
    setError('')
    try {
      const created = await requestJson<{ key: ApiKey; token: string }>('/api/admin/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), user_id: userId, expires_in_days: expiryDays }),
      })
      setNewToken(created.token)
      setNewKeyName(created.key.name || name.trim())
      setCopyStatus('')
      await load()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not create the API key.')
    } finally {
      setCreating(false)
    }
  }

  async function copyToken() {
    try {
      await navigator.clipboard.writeText(newToken)
      setCopyStatus('Copied')
    } catch {
      setCopyStatus('Select the key above and copy it manually.')
    }
  }

  async function revokeKey(id: string) {
    setRevoking(id)
    setError('')
    try {
      await requestJson<{ ok: boolean }>(`/api/admin/api-keys?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
      setRevokeId(null)
      await load()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not revoke the API key.')
    } finally {
      setRevoking(null)
    }
  }

  if (loading) return <div className={`flex items-center gap-2 py-12 text-[13px] ${muted}`} role="status"><Spinner size={16} /> Loading API access…</div>

  return (
    <div className={`space-y-5 ${text}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="max-w-2xl">
          <h2 className="flex items-center gap-2 text-[15px] font-semibold"><KeyRound className="h-4 w-4" /> API access</h2>
          <p className={`mt-2 text-[13px] leading-6 ${muted}`}>Give Marlon a separate key to read and update dashboard data. Every request uses the selected team member’s current creator access and permissions. Revoking a key stops its access immediately.</p>
        </div>
        <Button onClick={() => void load()} loading={refreshing} aria-label="Refresh API keys"><RefreshCw className="h-3.5 w-3.5" /><span className="hidden sm:inline">Refresh</span></Button>
      </div>

      {error && <div role="alert" className={`rounded-xl border px-4 py-3 text-[13px] ${isLight ? 'border-red-500/20 bg-red-500/5 text-red-700' : 'border-red-400/20 bg-red-400/10 text-red-300'}`}>{error}</div>}

      {newToken && (
        <Card className="border-pink-500/30 p-4 sm:p-5">
          <h3 className="text-[14px] font-semibold">Save the key for {newKeyName}</h3>
          <p className={`mt-1 text-[13px] leading-6 ${muted}`}>This is the only time the full key is shown. Copy it and share it privately with its recipient.</p>
          <label htmlFor="new-api-token" className="sr-only">New API key</label>
          <textarea id="new-api-token" value={newToken} readOnly spellCheck={false} rows={2} onFocus={event => event.target.select()} className={`${input} mt-3 resize-none font-mono text-[12px]`} />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button onClick={() => void copyToken()}>{copyStatus === 'Copied' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {copyStatus === 'Copied' ? 'Copied' : 'Copy key'}</Button>
            <Button onClick={() => { setNewToken(''); setCopyStatus('') }}>I’ve saved this key</Button>
            {copyStatus && copyStatus !== 'Copied' && <span role="status" className={`text-[12px] ${muted}`}>{copyStatus}</span>}
          </div>
        </Card>
      )}

      <Card className="p-4 sm:p-5">
        <h3 className="text-[14px] font-semibold">Create a key</h3>
        <form onSubmit={event => void createKey(event)} className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1.4fr_0.7fr]">
            <div>
              <label htmlFor="api-key-name" className={`mb-1.5 block text-[12px] ${muted}`}>Key name</label>
              <input id="api-key-name" value={name} onChange={event => setName(event.target.value)} maxLength={80} required autoComplete="off" className={input} />
            </div>
            <div>
              <label htmlFor="api-key-user" className={`mb-1.5 block text-[12px] ${muted}`}>Use this team member’s permissions</label>
              <select id="api-key-user" value={userId} onChange={event => setUserId(event.target.value)} required className={input}>
                <option value="">Select a team member</option>
                {activeUsers.map(user => <option value={user.id} key={user.id}>{user.display_name || user.email}{user.is_super_admin ? ' · Super admin' : ''}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="api-key-expiry" className={`mb-1.5 block text-[12px] ${muted}`}>Expires in days</label>
              <input id="api-key-expiry" type="number" min={1} max={365} step={1} required value={Number.isNaN(expiryDays) ? '' : expiryDays} onChange={event => setExpiryDays(event.target.valueAsNumber)} className={input} />
            </div>
          </div>
          <p className={`text-[12px] leading-5 ${muted}`}>{selectedUser?.is_super_admin ? 'This key will have full operational access, including deleting creators and accounts.' : 'Assign the required creator and write permissions in Team or Roles before handing over the key.'} API keys cannot manage team access, passwords, other keys, or integration secrets.</p>
          <Button type="submit" variant="primary" loading={creating} disabled={!!newToken || !selectedUser?.is_active || !name.trim() || !Number.isInteger(expiryDays) || expiryDays < 1 || expiryDays > 365}>Create API key</Button>
          {newToken && <p className={`text-[12px] ${muted}`}>Save and dismiss the key above before creating another.</p>}
          {activeUsers.length === 0 && <p className={`text-[12px] ${muted}`}>Add an active team member in the Team tab first.</p>}
        </form>
      </Card>

      <Card className="overflow-hidden">
        <div className={`border-b px-4 py-3 ${border}`}><h3 className="text-[14px] font-semibold">Issued keys</h3></div>
        {data.keys.length === 0 ? <p className={`px-4 py-6 text-[13px] ${muted}`}>No API keys yet.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px]">
              <thead className={muted}><tr>{['Key / team member', 'Status', 'Expires', 'Last used', ''].map((label, index) => <th key={index} scope="col" className="whitespace-nowrap px-4 py-3 font-medium">{label}</th>)}</tr></thead>
              <tbody>{data.keys.map(key => {
                const expired = new Date(key.expires_at).getTime() <= Date.now()
                const disabled = !!key.revoked_at || expired || !key.user?.is_active
                const status = key.revoked_at ? 'Revoked' : expired ? 'Expired' : !key.user?.is_active ? 'User inactive' : 'Active'
                return <tr key={key.id} className={`border-t ${border}`}>
                  <td className="px-4 py-3"><div className="font-medium">{key.name}</div><div className={`mt-1 ${muted}`}>{key.user?.display_name || key.user?.email || 'Deleted user'} · <code>{key.prefix}…</code></div></td>
                  <td className="px-4 py-3"><span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] ${disabled ? (isLight ? 'bg-black/5 text-black/45' : 'bg-white/5 text-white/45') : (isLight ? 'bg-emerald-500/10 text-emerald-700' : 'bg-emerald-400/10 text-emerald-300')}`}>{status}</span></td>
                  <td className={`whitespace-nowrap px-4 py-3 ${muted}`}>{formatDate(key.expires_at)}</td>
                  <td className={`whitespace-nowrap px-4 py-3 ${muted}`}>{formatDate(key.last_used_at)}</td>
                  <td className="px-4 py-3 text-right">{!key.revoked_at && (revokeId === key.id ? <div className="flex justify-end gap-1"><Button variant="danger" onClick={() => void revokeKey(key.id)} loading={revoking === key.id}>Confirm revoke</Button><Button onClick={() => setRevokeId(null)} disabled={revoking === key.id}>Cancel</Button></div> : <Button variant="danger" onClick={() => setRevokeId(key.id)} disabled={revoking !== null} aria-label={`Revoke key ${key.name}`}>Revoke</Button>)}</td>
                </tr>
              })}</tbody>
            </table>
          </div>
        )}
      </Card>

      <Card className="p-4 sm:p-5">
        <h3 className="text-[14px] font-semibold">Connect to the API</h3>
        <p className={`mt-2 text-[13px] leading-6 ${muted}`}>Base URL: <code className={`break-all ${text}`}>{baseUrl}</code>. Send the key in the Authorization header. The discovery request below returns supported routes and permissions.</p>
        <pre className={`mt-3 overflow-x-auto rounded-lg p-3 text-[12px] leading-6 ${isLight ? 'bg-black/[0.04]' : 'bg-black/25'}`}><code>{`curl '${baseUrl}' \\\n  -H 'Authorization: Bearer YOUR_API_KEY'`}</code></pre>
        <p className={`mt-3 text-[12px] leading-5 ${muted}`}>Use the documented POST, PUT, PATCH, and DELETE methods to change data. Keep the key in a server environment variable; use a separate key for each integration.</p>
      </Card>

      <Card className="overflow-hidden">
        <div className={`border-b px-4 py-3 ${border}`}><h3 className="text-[14px] font-semibold">Recent API requests</h3><p className={`mt-1 text-[12px] ${muted}`}>Request paths and outcomes only. Keys and request bodies are never shown here.</p></div>
        {data.recentRequests.length === 0 ? <p className={`px-4 py-6 text-[13px] ${muted}`}>No API requests recorded yet.</p> : <div className="overflow-x-auto"><table className="w-full text-left text-[12px]">
          <thead className={muted}><tr>{['Time', 'Key', 'Request', 'Status'].map(label => <th key={label} scope="col" className="whitespace-nowrap px-4 py-3 font-medium">{label}</th>)}</tr></thead>
          <tbody>{data.recentRequests.map(request => <tr key={request.id} className={`border-t ${border}`}>
            <td className={`whitespace-nowrap px-4 py-3 ${muted}`}>{formatDate(request.created_at)}</td>
            <td className="px-4 py-3">{data.keys.find(key => key.id === request.key_id)?.name || 'Deleted key'}</td>
            <td className="px-4 py-3"><code className="whitespace-nowrap">{request.method} {request.path}</code></td>
            <td className={`px-4 py-3 ${request.status >= 400 ? (isLight ? 'text-red-600' : 'text-red-300') : (isLight ? 'text-emerald-700' : 'text-emerald-300')}`}>{request.status}</td>
          </tr>)}</tbody>
        </table></div>}
      </Card>
    </div>
  )
}
