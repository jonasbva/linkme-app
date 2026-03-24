'use client'

import { useEffect, useState } from 'react'
import { useTheme } from './ThemeProvider'

interface Creator {
  id: string
  display_name: string
  slug: string
}

interface Permission {
  creator_id: string
  permission_type: string
}

interface Role {
  id: string
  name: string
  description: string
  grant_all_creators: boolean
  all_creators_permissions: string[]
  creator_access: string[]
  permissions: Permission[]
}

const PERMISSION_TYPES = [
  { key: 'view_links', label: 'View Link Analysis' },
  { key: 'view_social', label: 'View Social Media' },
  { key: 'view_conversions', label: 'View Conversions' },
  { key: 'edit_settings', label: 'Edit Settings' },
  { key: 'edit_links', label: 'Edit Links' },
  { key: 'input_conversions', label: 'Input Conversions' },
  { key: 'edit_social', label: 'Edit Social Media' },
]

export default function RolesClient() {
  const { resolved } = useTheme()
  const isLight = resolved === 'light'

  const [roles, setRoles] = useState<Role[]>([])
  const [creators, setCreators] = useState<Creator[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)

  const [createForm, setCreateForm] = useState({ name: '', description: '' })
  const [editForm, setEditForm] = useState({ name: '', description: '' })
  const [grantAllCreators, setGrantAllCreators] = useState(false)
  const [allCreatorsPerms, setAllCreatorsPerms] = useState<Set<string>>(new Set())
  const [selectedCreators, setSelectedCreators] = useState<Set<string>>(new Set())
  const [permissions, setPermissions] = useState<Map<string, Set<string>>>(new Map())

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [rolesRes, creatorsRes] = await Promise.all([
          fetch('/api/admin/roles'),
          fetch('/api/admin/creators'),
        ])

        if (rolesRes.ok) {
          const rolesData = await rolesRes.json()
          setRoles(Array.isArray(rolesData) ? rolesData : [])
        }
        if (creatorsRes.ok) {
          const creatorsData = await creatorsRes.json()
          setCreators(Array.isArray(creatorsData) ? creatorsData : [])
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleCreateRole = async () => {
    if (!createForm.name.trim()) return

    try {
      const res = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_role',
          name: createForm.name,
          description: createForm.description,
        }),
      })

      if (res.ok) {
        const newRole = await res.json()
        setRoles([...roles, newRole])
        setCreateForm({ name: '', description: '' })
        setShowCreateModal(false)
      }
    } catch (error) {
      console.error('Failed to create role:', error)
    }
  }

  const handleEditRole = (role: Role) => {
    setEditingRole(role)
    setEditForm({ name: role.name, description: role.description })
    setSelectedCreators(new Set(role.creator_access))
    setGrantAllCreators(role.grant_all_creators || false)
    setAllCreatorsPerms(new Set(role.all_creators_permissions || []))

    // Initialize permissions map
    const permMap = new Map<string, Set<string>>()
    role.permissions.forEach((perm) => {
      if (!permMap.has(perm.creator_id)) {
        permMap.set(perm.creator_id, new Set())
      }
      permMap.get(perm.creator_id)!.add(perm.permission_type)
    })
    setPermissions(permMap)

    setShowEditModal(true)
  }

  const handleToggleAllCreatorsPerm = (permKey: string) => {
    const newPerms = new Set(allCreatorsPerms)
    if (newPerms.has(permKey)) {
      newPerms.delete(permKey)
    } else {
      newPerms.add(permKey)
    }
    setAllCreatorsPerms(newPerms)
  }

  const handleToggleCreator = (creatorId: string) => {
    const newSelected = new Set(selectedCreators)
    if (newSelected.has(creatorId)) {
      newSelected.delete(creatorId)
      // Also remove permissions for this creator
      const newPerms = new Map(permissions)
      newPerms.delete(creatorId)
      setPermissions(newPerms)
    } else {
      newSelected.add(creatorId)
      // Initialize empty permission set for this creator
      if (!permissions.has(creatorId)) {
        const newPerms = new Map(permissions)
        newPerms.set(creatorId, new Set())
        setPermissions(newPerms)
      }
    }
    setSelectedCreators(newSelected)
  }

  const handleTogglePermission = (creatorId: string, permissionType: string) => {
    const newPerms = new Map(permissions)
    if (!newPerms.has(creatorId)) {
      newPerms.set(creatorId, new Set())
    }
    const creatorPerms = newPerms.get(creatorId)!
    if (creatorPerms.has(permissionType)) {
      creatorPerms.delete(permissionType)
    } else {
      creatorPerms.add(permissionType)
    }
    setPermissions(newPerms)
  }

  const handleSaveEdit = async () => {
    if (!editingRole || !editForm.name.trim()) return

    try {
      // 1. Update basic role info + grant_all_creators settings
      await fetch('/api/admin/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_role',
          role_id: editingRole.id,
          name: editForm.name,
          description: editForm.description,
          grant_all_creators: grantAllCreators,
          all_creators_permissions: Array.from(allCreatorsPerms),
        }),
      })

      // 2. Update creator access
      await fetch('/api/admin/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set_creator_access',
          role_id: editingRole.id,
          creator_ids: Array.from(selectedCreators),
        }),
      })

      // 3. Update permissions
      const permissionsArray = Array.from(permissions.entries()).map(([creator_id, types]) => ({
        creator_id,
        types: Array.from(types),
      }))

      await fetch('/api/admin/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set_permissions',
          role_id: editingRole.id,
          permissions: permissionsArray,
        }),
      })

      // Refresh data
      const rolesRes = await fetch('/api/admin/roles')
      if (rolesRes.ok) {
        setRoles(await rolesRes.json())
      }

      setShowEditModal(false)
      setEditingRole(null)
    } catch (error) {
      console.error('Failed to save role:', error)
    }
  }

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('Are you sure you want to delete this role?')) return

    try {
      const res = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_role',
          role_id: roleId,
        }),
      })

      if (res.ok) {
        setRoles(roles.filter((r) => r.id !== roleId))
      }
    } catch (error) {
      console.error('Failed to delete role:', error)
    }
  }

  if (loading) {
    return (
      <div className={`p-6 ${isLight ? 'text-black/60' : 'text-white/70'}`}>
        Loading roles...
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className={`text-2xl font-bold mb-2 ${isLight ? 'text-black/90' : 'text-white/90'}`}>
          Roles Management
        </h1>
        <p className={`text-[13px] ${isLight ? 'text-black/50' : 'text-white/60'}`}>
          Manage roles and their permissions for creators
        </p>
      </div>

      {/* Create Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 rounded-lg bg-white text-black text-[13px] font-medium hover:opacity-90 transition"
        >
          Create Role
        </button>
      </div>

      {/* Roles List */}
      <div className="space-y-3">
        {roles.map((role) => (
          <div
            key={role.id}
            className={`${isLight ? 'bg-black/[0.02] border-black/[0.06]' : 'bg-white/[0.05] border-white/[0.08]'} border rounded-xl p-4`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className={`text-[13px] font-semibold ${isLight ? 'text-black/90' : 'text-white/95'}`}>
                  {role.name}
                </h3>
                {role.description && (
                  <p className={`text-[12px] mt-1 ${isLight ? 'text-black/50' : 'text-white/60'}`}>
                    {role.description}
                  </p>
                )}
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleEditRole(role)}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition ${
                    isLight
                      ? 'bg-black/5 text-black/70 hover:bg-black/10'
                      : 'bg-white/[0.08] text-white/80 hover:bg-white/[0.12]'
                  }`}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteRole(role.id)}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition ${
                    isLight
                      ? 'bg-red-500/10 text-red-600 hover:bg-red-500/20'
                      : 'bg-red-500/15 text-red-400 hover:bg-red-500/25'
                  }`}
                >
                  Delete
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-6 text-[12px]">
              <div>
                <span className={isLight ? 'text-black/50' : 'text-white/60'}>Creators: </span>
                {role.grant_all_creators ? (
                  <span className="font-semibold text-emerald-500">All creators</span>
                ) : (
                  <span className={`font-semibold ${isLight ? 'text-black/70' : 'text-white/80'}`}>
                    {role.creator_access.length}
                  </span>
                )}
              </div>
              <div>
                <span className={isLight ? 'text-black/50' : 'text-white/60'}>Permissions: </span>
                <span className={`font-semibold ${isLight ? 'text-black/70' : 'text-white/80'}`}>
                  {role.grant_all_creators
                    ? (role.all_creators_permissions || []).length
                    : role.permissions.length}
                </span>
              </div>
            </div>
          </div>
        ))}

        {roles.length === 0 && (
          <div
            className={`${isLight ? 'bg-black/[0.02] border-black/[0.06]' : 'bg-white/[0.05] border-white/[0.08]'} border rounded-xl p-8 text-center`}
          >
            <p className={isLight ? 'text-black/50' : 'text-white/60'}>No roles created yet</p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div
            className={`${isLight ? 'bg-white border-black/[0.08]' : 'bg-[#1a1a1a] border-white/[0.10]'} border rounded-2xl p-6 w-full max-w-lg`}
          >
            <h2 className={`text-lg font-bold mb-4 ${isLight ? 'text-black/90' : 'text-white/95'}`}>
              Create New Role
            </h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className={`block text-[12px] font-medium mb-2 ${isLight ? 'text-black/70' : 'text-white/80'}`}>
                  Role Name
                </label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="e.g., Content Manager"
                  className={`w-full px-3 py-2 rounded-lg text-[13px] border transition ${
                    isLight
                      ? 'bg-black/[0.03] border-black/[0.08] text-black/90 placeholder-black/40'
                      : 'bg-white/[0.06] border-white/[0.10] text-white/95 placeholder-white/40'
                  } focus:outline-none focus:ring-2 focus:ring-white/20`}
                />
              </div>

              <div>
                <label className={`block text-[12px] font-medium mb-2 ${isLight ? 'text-black/70' : 'text-white/80'}`}>
                  Description
                </label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder="Optional description..."
                  className={`w-full px-3 py-2 rounded-lg text-[13px] border transition resize-none ${
                    isLight
                      ? 'bg-black/[0.03] border-black/[0.08] text-black/90 placeholder-black/40'
                      : 'bg-white/[0.06] border-white/[0.10] text-white/95 placeholder-white/40'
                  } focus:outline-none focus:ring-2 focus:ring-white/20`}
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setCreateForm({ name: '', description: '' })
                }}
                className={`flex-1 px-4 py-2 rounded-lg text-[13px] font-medium transition ${
                  isLight
                    ? 'bg-black/5 text-black/70 hover:bg-black/10'
                    : 'bg-white/[0.08] text-white/80 hover:bg-white/[0.12]'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRole}
                disabled={!createForm.name.trim()}
                className="flex-1 px-4 py-2 rounded-lg bg-white text-black text-[13px] font-medium hover:opacity-90 disabled:opacity-50 transition"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div
            className={`${isLight ? 'bg-white border-black/[0.08]' : 'bg-[#1a1a1a] border-white/[0.10]'} border rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto`}
          >
            <h2 className={`text-lg font-bold mb-6 ${isLight ? 'text-black/90' : 'text-white/95'}`}>
              Edit Role
            </h2>

            {/* Section 1: Basic Info */}
            <div className={`mb-8 pb-8 border-b ${isLight ? 'border-black/[0.08]' : 'border-white/[0.10]'}`}>
              <h3 className={`text-[13px] font-semibold mb-4 ${isLight ? 'text-black/70' : 'text-white/80'}`}>
                Basic Information
              </h3>

              <div className="space-y-4">
                <div>
                  <label className={`block text-[12px] font-medium mb-2 ${isLight ? 'text-black/70' : 'text-white/80'}`}>
                    Role Name
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg text-[13px] border transition ${
                      isLight
                        ? 'bg-black/[0.03] border-black/[0.08] text-black/90 placeholder-black/40'
                        : 'bg-white/[0.06] border-white/[0.10] text-white/95 placeholder-white/40'
                    } focus:outline-none focus:ring-2 focus:ring-white/20`}
                  />
                </div>

                <div>
                  <label className={`block text-[12px] font-medium mb-2 ${isLight ? 'text-black/70' : 'text-white/80'}`}>
                    Description
                  </label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg text-[13px] border transition resize-none ${
                      isLight
                        ? 'bg-black/[0.03] border-black/[0.08] text-black/90 placeholder-black/40'
                        : 'bg-white/[0.06] border-white/[0.10] text-white/95 placeholder-white/40'
                    } focus:outline-none focus:ring-2 focus:ring-white/20`}
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Creator Access */}
            <div className={`mb-8 pb-8 border-b ${isLight ? 'border-black/[0.08]' : 'border-white/[0.10]'}`}>
              <h3 className={`text-[13px] font-semibold mb-4 ${isLight ? 'text-black/70' : 'text-white/80'}`}>
                Creator Access
              </h3>

              {/* For All Creators Toggle */}
              <label
                className={`flex items-center p-3 rounded-lg cursor-pointer transition mb-4 ${
                  grantAllCreators
                    ? isLight ? 'bg-emerald-50 border border-emerald-200' : 'bg-emerald-500/10 border border-emerald-500/20'
                    : isLight ? 'bg-black/[0.03] hover:bg-black/[0.05]' : 'bg-white/[0.05] hover:bg-white/[0.08]'
                }`}
              >
                <input
                  type="checkbox"
                  checked={grantAllCreators}
                  onChange={() => setGrantAllCreators(!grantAllCreators)}
                  className="mr-3 w-4 h-4 cursor-pointer"
                />
                <div>
                  <div className={`text-[13px] font-medium ${isLight ? 'text-black/90' : 'text-white/95'}`}>
                    Apply to all creators
                  </div>
                  <div className={`text-[12px] ${isLight ? 'text-black/50' : 'text-white/60'}`}>
                    Permissions apply to all current and future creators automatically
                  </div>
                </div>
              </label>

              {/* All Creators Permissions */}
              {grantAllCreators && (
                <div className={`p-4 rounded-lg mb-4 ${
                  isLight
                    ? 'bg-emerald-50/50 border border-emerald-200/50'
                    : 'bg-emerald-500/5 border border-emerald-500/15'
                }`}>
                  <div className={`text-[13px] font-semibold mb-3 ${isLight ? 'text-black/90' : 'text-white/95'}`}>
                    Permissions for all creators
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {PERMISSION_TYPES.map((perm) => (
                      <label
                        key={perm.key}
                        className={`flex items-center p-2 rounded-lg cursor-pointer transition ${
                          isLight
                            ? 'bg-black/[0.03] hover:bg-black/[0.05]'
                            : 'bg-white/[0.06] hover:bg-white/[0.10]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={allCreatorsPerms.has(perm.key)}
                          onChange={() => handleToggleAllCreatorsPerm(perm.key)}
                          className="mr-2 w-4 h-4 cursor-pointer"
                        />
                        <span className={`text-[12px] ${isLight ? 'text-black/80' : 'text-white/90'}`}>
                          {perm.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Individual Creator Checkboxes (hidden when grant_all_creators is on) */}
              {!grantAllCreators && (
                <div className="space-y-2">
                  {creators.map((creator) => (
                    <label
                      key={creator.id}
                      className={`flex items-center p-3 rounded-lg cursor-pointer transition ${
                        isLight
                          ? 'bg-black/[0.03] hover:bg-black/[0.05]'
                          : 'bg-white/[0.05] hover:bg-white/[0.08]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedCreators.has(creator.id)}
                        onChange={() => handleToggleCreator(creator.id)}
                        className="mr-3 w-4 h-4 cursor-pointer"
                      />
                      <div>
                        <div className={`text-[13px] font-medium ${isLight ? 'text-black/90' : 'text-white/95'}`}>
                          {creator.display_name}
                        </div>
                        <div className={`text-[12px] ${isLight ? 'text-black/50' : 'text-white/60'}`}>
                          @{creator.slug}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Section 3: Permissions Per Creator (only when not using grant_all_creators) */}
            {!grantAllCreators && selectedCreators.size > 0 && (
              <div className="mb-8">
                <h3 className={`text-[13px] font-semibold mb-4 ${isLight ? 'text-black/70' : 'text-white/80'}`}>
                  Permissions Per Creator
                </h3>

                <div className="space-y-6">
                  {Array.from(selectedCreators).map((creatorId) => {
                    const creator = creators.find((c) => c.id === creatorId)
                    if (!creator) return null

                    const creatorPerms = permissions.get(creatorId) || new Set()

                    return (
                      <div
                        key={creatorId}
                        className={`p-4 rounded-lg ${
                          isLight
                            ? 'bg-black/[0.03] border border-black/[0.06]'
                            : 'bg-white/[0.05] border border-white/[0.08]'
                        }`}
                      >
                        <div className={`text-[13px] font-semibold mb-3 ${isLight ? 'text-black/90' : 'text-white/95'}`}>
                          {creator.display_name}
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          {PERMISSION_TYPES.map((perm) => (
                            <label
                              key={perm.key}
                              className={`flex items-center p-2 rounded-lg cursor-pointer transition ${
                                isLight
                                  ? 'bg-black/[0.03] hover:bg-black/[0.05]'
                                  : 'bg-white/[0.06] hover:bg-white/[0.10]'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={creatorPerms.has(perm.key)}
                                onChange={() => handleTogglePermission(creatorId, perm.key)}
                                className="mr-2 w-4 h-4 cursor-pointer"
                              />
                              <span className={`text-[12px] ${isLight ? 'text-black/80' : 'text-white/90'}`}>
                                {perm.label}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditingRole(null)
                }}
                className={`flex-1 px-4 py-2 rounded-lg text-[13px] font-medium transition ${
                  isLight
                    ? 'bg-black/5 text-black/70 hover:bg-black/10'
                    : 'bg-white/[0.08] text-white/80 hover:bg-white/[0.12]'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={!editForm.name.trim()}
                className="flex-1 px-4 py-2 rounded-lg bg-white text-black text-[13px] font-medium hover:opacity-90 disabled:opacity-50 transition"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
