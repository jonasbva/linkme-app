'use client'

import { useState } from 'react'

interface Tag {
  id: string
  name: string
  color: string
}

interface Props {
  creatorId: string
  allTags: Tag[]
  assignedTagIds: string[]
}

export default function TagManager({ creatorId, allTags: initialTags, assignedTagIds: initialAssigned }: Props) {
  const [tags, setTags] = useState<Tag[]>(initialTags)
  const [assigned, setAssigned] = useState<string[]>(initialAssigned)
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('#3b82f6')
  const [creating, setCreating] = useState(false)
  const [editingTag, setEditingTag] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('')

  async function toggleTag(tagId: string) {
    const isAssigned = assigned.includes(tagId)
    const action = isAssigned ? 'unassign_tag' : 'assign_tag'
    const res = await fetch('/api/admin/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, creator_id: creatorId, tag_id: tagId }),
    })
    if (res.ok) {
      setAssigned(prev => isAssigned ? prev.filter(id => id !== tagId) : [...prev, tagId])
    }
  }

  async function createTag() {
    if (!newName.trim()) return
    setCreating(true)
    try {
      const res = await fetch('/api/admin/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_tag', name: newName, color: newColor }),
      })
      if (res.ok) {
        const tag = await res.json()
        setTags(prev => [...prev, tag])
        setNewName('')
        setNewColor('#3b82f6')
        setShowCreate(false)
      }
    } finally {
      setCreating(false)
    }
  }

  async function updateTag(tagId: string) {
    const res = await fetch('/api/admin/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_tag', tag_id: tagId, name: editName, color: editColor }),
    })
    if (res.ok) {
      const updated = await res.json()
      setTags(prev => prev.map(t => t.id === tagId ? updated : t))
      setEditingTag(null)
    }
  }

  async function deleteTag(tagId: string) {
    if (!confirm('Delete this tag from all creators?')) return
    const res = await fetch('/api/admin/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete_tag', tag_id: tagId }),
    })
    if (res.ok) {
      setTags(prev => prev.filter(t => t.id !== tagId))
      setAssigned(prev => prev.filter(id => id !== tagId))
    }
  }

  const presetColors = ['#3b82f6', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b', '#10b981', '#06b6d4', '#6366f1', '#78716c']

  return (
    <div className="rounded-xl border border-white/[0.06] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[14px] font-semibold text-white/80">Tags</h3>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="text-[11px] text-white/40 hover:text-white/60 transition-colors"
        >
          {showCreate ? 'Cancel' : '+ New tag'}
        </button>
      </div>

      {/* Create new tag */}
      {showCreate && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
          <input
            type="text"
            placeholder="Tag name"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && createTag()}
            className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded px-2 py-1 text-[12px] text-white/80 outline-none focus:border-white/20"
          />
          <div className="flex gap-1">
            {presetColors.map(c => (
              <button
                key={c}
                onClick={() => setNewColor(c)}
                className={`w-5 h-5 rounded-full border-2 transition-colors ${newColor === c ? 'border-white/60' : 'border-transparent'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <button
            onClick={createTag}
            disabled={creating || !newName.trim()}
            className="px-3 py-1 text-[11px] bg-white/[0.08] rounded hover:bg-white/[0.12] text-white/70 disabled:opacity-40"
          >
            Create
          </button>
        </div>
      )}

      {/* Tag list */}
      <div className="flex flex-wrap gap-2">
        {tags.map(tag => {
          const isAssigned = assigned.includes(tag.id)
          const isEditing = editingTag === tag.id

          if (isEditing) {
            return (
              <div key={tag.id} className="flex items-center gap-1.5 p-2 rounded-lg bg-white/[0.03] border border-white/[0.08]">
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && updateTag(tag.id)}
                  className="w-20 bg-white/[0.04] border border-white/[0.08] rounded px-1.5 py-0.5 text-[11px] text-white/80 outline-none"
                />
                <div className="flex gap-0.5">
                  {presetColors.map(c => (
                    <button
                      key={c}
                      onClick={() => setEditColor(c)}
                      className={`w-4 h-4 rounded-full border ${editColor === c ? 'border-white/60' : 'border-transparent'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <button onClick={() => updateTag(tag.id)} className="text-[10px] text-white/50 hover:text-white/80">Save</button>
                <button onClick={() => setEditingTag(null)} className="text-[10px] text-white/30 hover:text-white/50">Cancel</button>
                <button onClick={() => deleteTag(tag.id)} className="text-[10px] text-red-400/60 hover:text-red-400">Del</button>
              </div>
            )
          }

          return (
            <button
              key={tag.id}
              onClick={() => toggleTag(tag.id)}
              onContextMenu={e => {
                e.preventDefault()
                setEditingTag(tag.id)
                setEditName(tag.name)
                setEditColor(tag.color)
              }}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all border ${
                isAssigned ? 'border-current' : 'border-transparent opacity-40 hover:opacity-70'
              }`}
              style={{
                color: tag.color,
                backgroundColor: isAssigned ? tag.color + '20' : tag.color + '10',
              }}
              title="Click to toggle, right-click to edit"
            >
              {isAssigned && '✓ '}{tag.name}
            </button>
          )
        })}
        {tags.length === 0 && !showCreate && (
          <p className="text-white/20 text-[12px]">No tags yet — create one to get started</p>
        )}
      </div>
    </div>
  )
}
