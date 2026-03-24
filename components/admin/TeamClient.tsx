'use client'

import { useState, useEffect } from 'react'
import { useTheme } from './ThemeProvider'

interface AdminUser {
  id: string
  email: string
  display_name: string
  is_active: boolean
  roles?: Role[]
  creator_access?: Creator[]
  permissions?: Permission[]
}

interface Role {
  id: string
  name: string
}

interface Creator {
  id: string
  display_name: string
}

interface Permission {
  creator_id: string
  types: string[]
}

const PERMISSION_TYPES = [
  'view_links',
  'view_social',
  'view_conversions',
  'edit_settings',
  'edit_links',
  'input_conversions',
  'edit_social',
]

export default function TeamClient() {
  const { resolved: theme } = useTheme()
  const isLight = theme === 'light'

  const [users, setUsers] = useState<AdminUser[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [creators, setCreators] = useState<Creator[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editTab, setEditTab] = useState<'basic' | 'roles' | 'creators' | 'permissions'>('basic')

  const [formData, setFormData] = useState({
    email: '',
    display_name: '',
    password: '',
  })

  const [editFormData, setEditFormData] = useState({
    email: '',
    display_name: '',
    is_active: true,
    roles: [] as string[],
    creator_ids: [] as string[],
    permissions: [] as Permission[],
  })

  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  // Fetch data on mount
  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      setLoading(true)
      const [usersRes, rolesRes, creatorsRes] = await Promise.all([
        fetch('/api/admin/team'),
        fetch('/api/admin/roles'),
        fetch('/api/admin/creators'),
      ])

      if (!usersRes.ok || !rolesRes.ok || !creatorsRes.ok) {
        throw new Error('Failed to fetch data')
      }

      const usersData = await usersRes.json()
      const rolesData = await rolesRes.json()
      const creatorsData = await creatorsRes.json()

      setUsers(usersData)
      setRoles(rolesData)
      setCreators(creatorsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  function openCreateModal() {
    setFormData({ email: '', display_name: '', password: '' })
    setShowCreateModal(true)
  }

  function closeCreateModal() {
    setShowCreateModal(false)
    setFormData({ email: '', display_name: '', password: '' })
  }

  function openEditModal(user: AdminUser) {
    setEditingUser(user)
    setEditFormData({
      email: user.email,
      display_name: user.display_name,
      is_active: user.is_active,
      roles: user.roles?.map(r => r.id) || [],
      creator_ids: user.creator_access?.map(c => c.id) || [],
      permissions: user.permissions || [],
    })
    setEditTab('basic')
    setShowEditModal(true)
  }

  function closeEditModal() {
    setShowEditModal(false)
    setEditingUser(null)
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.email || !formData.display_name || !formData.password) {
      setError('All fields are required')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_user',
          email: formData.email,
          display_name: formData.display_name,
          password: formData.password,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to create user')
      }

      await fetchData()
      closeCreateModal()
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleUpdateUser(e: React.FormEvent) {
    e.preventDefault()
    if (!editingUser) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_user',
          user_id: editingUser.id,
          email: editFormData.email,
          display_name: editFormData.display_name,
          is_active: editFormData.is_active,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to update user')
      }

      await fetchData()
      closeEditModal()
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()
    if (!editingUser) return

    const password = prompt('Enter new password:')
    if (!password) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_user',
          user_id: editingUser.id,
          password,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to reset password')
      }

      setError(null)
      alert('Password reset successfully')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSetRoles(e: React.FormEvent) {
    e.preventDefault()
    if (!editingUser) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set_roles',
          user_id: editingUser.id,
          role_ids: editFormData.roles,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to set roles')
      }

      await fetchData()
      closeEditModal()
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set roles')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSetCreatorAccess(e: React.FormEvent) {
    e.preventDefault()
    if (!editingUser) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set_creator_access',
          user_id: editingUser.id,
          creator_ids: editFormData.creator_ids,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to set creator access')
      }

      await fetchData()
      closeEditModal()
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set creator access')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSetPermissions(e: React.FormEvent) {
    e.preventDefault()
    if (!editingUser) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set_permissions',
          user_id: editingUser.id,
          permissions: editFormData.permissions,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to set permissions')
      }

      await fetchData()
      closeEditModal()
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set permissions')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeleteUser(userId: string, email: string) {
    if (!confirm(`Delete user "${email}"? This action cannot be undone.`)) return

    setDeleting(userId)
    try {
      const res = await fetch('/api/admin/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_user',
          user_id: userId,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to delete user')
      }

      await fetchData()
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user')
    } finally {
      setDeleting(null)
    }
  }

  const bgCard = isLight
    ? 'bg-black/[0.02] border border-black/[0.06]'
    : 'bg-white/[0.02] border border-white/[0.04]'
  const textPrimary = isLight ? 'text-black/90' : 'text-white/90'
  const textSecondary = isLight ? 'text-black/50' : 'text-white/50'
  const textTertiary = isLight ? 'text-black/25' : 'text-white/25'
  const inputBg = isLight
    ? 'bg-black/[0.03] border border-black/[0.08]'
    : 'bg-white/[0.04] border border-white/[0.08]'
  const inputFocus = isLight ? 'focus:border-black/20' : 'focus:border-white/20'

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className={`text-[13px] ${textSecondary}`}>Loading team data...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className={`text-xl font-semibold tracking-tight ${textPrimary}`}>Team Management</h1>
        <button
          onClick={openCreateModal}
          className="px-4 py-1.5 bg-white text-black text-[12px] font-medium rounded-lg hover:bg-white/90 transition-colors"
        >
          Invite user
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-[13px] text-red-400">
          {error}
        </div>
      )}

      {/* Users list */}
      <div className="space-y-2">
        {users.length === 0 ? (
          <div className={`text-center py-8 text-[13px] ${textTertiary}`}>No admin users yet</div>
        ) : (
          users.map(user => (
            <div
              key={user.id}
              className={`flex items-center justify-between p-4 rounded-xl ${bgCard} hover:border-white/[0.08] transition-all duration-150 group`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className={`text-[13px] font-medium ${textPrimary}`}>{user.display_name}</p>
                  {!user.is_active && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400`}>
                      Inactive
                    </span>
                  )}
                </div>
                <p className={`text-[12px] ${textTertiary}`}>{user.email}</p>
                {user.roles && user.roles.length > 0 && (
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {user.roles.map(role => (
                      <span
                        key={role.id}
                        className={`text-[10px] px-2 py-0.5 rounded-full ${isLight ? 'bg-blue-500/15 text-blue-600' : 'bg-blue-500/15 text-blue-400'}`}
                      >
                        {role.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                <button
                  onClick={() => openEditModal(user)}
                  className={`px-3 py-1.5 text-[11px] font-medium rounded-lg transition-colors ${
                    isLight
                      ? 'text-black/60 hover:text-black/80 hover:bg-black/5'
                      : 'text-white/60 hover:text-white/80 hover:bg-white/5'
                  }`}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteUser(user.id, user.email)}
                  disabled={deleting === user.id}
                  className={`px-3 py-1.5 text-[11px] font-medium rounded-lg transition-colors ${
                    deleting === user.id
                      ? 'opacity-50 cursor-not-allowed'
                      : 'text-red-400/60 hover:text-red-400 hover:bg-red-500/10'
                  }`}
                >
                  {deleting === user.id ? '...' : 'Delete'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div
            className={`${bgCard} rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto`}
            style={{ backgroundColor: isLight ? '#f8f8f8' : '#111' }}
          >
            <h2 className={`text-lg font-semibold mb-4 ${textPrimary}`}>Invite new user</h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className={`text-[12px] font-medium block mb-1.5 ${textSecondary}`}>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-3 py-2 text-[13px] rounded-lg outline-none ${inputBg} ${inputFocus} ${textPrimary}`}
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <label className={`text-[12px] font-medium block mb-1.5 ${textSecondary}`}>Display name</label>
                <input
                  type="text"
                  value={formData.display_name}
                  onChange={e => setFormData({ ...formData, display_name: e.target.value })}
                  className={`w-full px-3 py-2 text-[13px] rounded-lg outline-none ${inputBg} ${inputFocus} ${textPrimary}`}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className={`text-[12px] font-medium block mb-1.5 ${textSecondary}`}>Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className={`w-full px-3 py-2 text-[13px] rounded-lg outline-none ${inputBg} ${inputFocus} ${textPrimary}`}
                  placeholder="••••••••"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  className={`flex-1 px-4 py-2 text-[12px] font-medium rounded-lg transition-colors ${
                    isLight
                      ? 'text-black/60 hover:bg-black/5'
                      : 'text-white/60 hover:bg-white/5'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-white text-black text-[12px] font-medium rounded-lg hover:bg-white/90 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create user'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div
            className={`${bgCard} rounded-2xl p-6 w-full max-w-xl max-h-[80vh] overflow-y-auto`}
            style={{ backgroundColor: isLight ? '#f8f8f8' : '#111' }}
          >
            <h2 className={`text-lg font-semibold mb-4 ${textPrimary}`}>Edit user: {editingUser.display_name}</h2>

            {/* Tabs */}
            <div className="flex gap-1 mb-4 border-b border-white/[0.08]">
              {(['basic', 'roles', 'creators', 'permissions'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setEditTab(tab)}
                  className={`px-3 py-2 text-[12px] font-medium rounded-t-lg transition-colors ${
                    editTab === tab
                      ? isLight
                        ? 'text-black/80 border-b-2 border-black/80'
                        : 'text-white/80 border-b-2 border-white/80'
                      : isLight
                        ? 'text-black/40 hover:text-black/60'
                        : 'text-white/40 hover:text-white/60'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <form
              onSubmit={
                editTab === 'basic'
                  ? handleUpdateUser
                  : editTab === 'roles'
                    ? handleSetRoles
                    : editTab === 'creators'
                      ? handleSetCreatorAccess
                      : handleSetPermissions
              }
              className="space-y-4"
            >
              {/* Basic Info Tab */}
              {editTab === 'basic' && (
                <>
                  <div>
                    <label className={`text-[12px] font-medium block mb-1.5 ${textSecondary}`}>Email</label>
                    <input
                      type="email"
                      value={editFormData.email}
                      onChange={e => setEditFormData({ ...editFormData, email: e.target.value })}
                      className={`w-full px-3 py-2 text-[13px] rounded-lg outline-none ${inputBg} ${inputFocus} ${textPrimary}`}
                    />
                  </div>
                  <div>
                    <label className={`text-[12px] font-medium block mb-1.5 ${textSecondary}`}>Display name</label>
                    <input
                      type="text"
                      value={editFormData.display_name}
                      onChange={e => setEditFormData({ ...editFormData, display_name: e.target.value })}
                      className={`w-full px-3 py-2 text-[13px] rounded-lg outline-none ${inputBg} ${inputFocus} ${textPrimary}`}
                    />
                  </div>
                  <div>
                    <label className={`flex items-center gap-2 text-[12px] font-medium cursor-pointer`}>
                      <input
                        type="checkbox"
                        checked={editFormData.is_active}
                        onChange={e => setEditFormData({ ...editFormData, is_active: e.target.checked })}
                        className="w-4 h-4 rounded"
                      />
                      <span className={textPrimary}>Active</span>
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetPassword}
                    className={`w-full px-3 py-2 text-[12px] font-medium rounded-lg transition-colors ${
                      isLight
                        ? 'text-black/60 hover:bg-black/5'
                        : 'text-white/60 hover:bg-white/5'
                    }`}
                  >
                    Reset password
                  </button>
                </>
              )}

              {/* Roles Tab */}
              {editTab === 'roles' && (
                <div className="space-y-2">
                  {roles.map(role => (
                    <label key={role.id} className={`flex items-center gap-2 text-[13px] cursor-pointer`}>
                      <input
                        type="checkbox"
                        checked={editFormData.roles.includes(role.id)}
                        onChange={e => {
                          if (e.target.checked) {
                            setEditFormData({
                              ...editFormData,
                              roles: [...editFormData.roles, role.id],
                            })
                          } else {
                            setEditFormData({
                              ...editFormData,
                              roles: editFormData.roles.filter(r => r !== role.id),
                            })
                          }
                        }}
                        className="w-4 h-4 rounded"
                      />
                      <span className={textPrimary}>{role.name}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* Creator Access Tab */}
              {editTab === 'creators' && (
                <div className="space-y-2">
                  {creators.map(creator => (
                    <label key={creator.id} className={`flex items-center gap-2 text-[13px] cursor-pointer`}>
                      <input
                        type="checkbox"
                        checked={editFormData.creator_ids.includes(creator.id)}
                        onChange={e => {
                          if (e.target.checked) {
                            setEditFormData({
                              ...editFormData,
                              creator_ids: [...editFormData.creator_ids, creator.id],
                            })
                          } else {
                            setEditFormData({
                              ...editFormData,
                              creator_ids: editFormData.creator_ids.filter(c => c !== creator.id),
                            })
                          }
                        }}
                        className="w-4 h-4 rounded"
                      />
                      <span className={textPrimary}>{creator.display_name}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* Permissions Tab */}
              {editTab === 'permissions' && (
                <div className="space-y-4">
                  {editFormData.creator_ids.length === 0 ? (
                    <p className={`text-[12px] ${textTertiary}`}>Add creator access first to set permissions</p>
                  ) : (
                    creators
                      .filter(c => editFormData.creator_ids.includes(c.id))
                      .map(creator => {
                        const creatorPerms = editFormData.permissions.find(p => p.creator_id === creator.id)
                        return (
                          <div key={creator.id} className={`p-3 rounded-lg ${bgCard}`}>
                            <p className={`text-[12px] font-medium mb-2 ${textPrimary}`}>{creator.display_name}</p>
                            <div className="space-y-1.5">
                              {PERMISSION_TYPES.map(perm => (
                                <label key={perm} className={`flex items-center gap-2 text-[12px] cursor-pointer`}>
                                  <input
                                    type="checkbox"
                                    checked={creatorPerms?.types.includes(perm) || false}
                                    onChange={e => {
                                      const perms = editFormData.permissions.filter(p => p.creator_id !== creator.id)
                                      if (e.target.checked) {
                                        const existing = creatorPerms?.types || []
                                        perms.push({
                                          creator_id: creator.id,
                                          types: [...existing, perm],
                                        })
                                      } else if (creatorPerms) {
                                        const filtered = creatorPerms.types.filter(t => t !== perm)
                                        if (filtered.length > 0) {
                                          perms.push({
                                            creator_id: creator.id,
                                            types: filtered,
                                          })
                                        }
                                      }
                                      setEditFormData({
                                        ...editFormData,
                                        permissions: perms,
                                      })
                                    }}
                                    className="w-4 h-4 rounded"
                                  />
                                  <span className={textPrimary}>
                                    {perm.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )
                      })
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className={`flex-1 px-4 py-2 text-[12px] font-medium rounded-lg transition-colors ${
                    isLight
                      ? 'text-black/60 hover:bg-black/5'
                      : 'text-white/60 hover:bg-white/5'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-white text-black text-[12px] font-medium rounded-lg hover:bg-white/90 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
