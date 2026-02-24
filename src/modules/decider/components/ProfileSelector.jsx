import { useState } from 'react'

export default function ProfileSelector({ profiles, activeProfileId, onSwitch, onCreate, onRename, onDelete }) {
  const [creatingName, setCreatingName] = useState('')
  const [creating, setCreating] = useState(false)
  const [renamingId, setRenamingId] = useState(null)
  const [renamingName, setRenamingName] = useState('')

  function handleCreate() {
    if (creating) {
      if (creatingName.trim()) onCreate(creatingName.trim())
      setCreating(false)
      setCreatingName('')
    } else {
      setCreating(true)
    }
  }

  function handleRename(profile) {
    if (renamingId === profile.id) {
      if (renamingName.trim()) onRename(profile.id, renamingName.trim())
      setRenamingId(null)
      setRenamingName('')
    } else {
      setRenamingId(profile.id)
      setRenamingName(profile.name)
    }
  }

  const activeProfile = profiles.find(p => p.id === activeProfileId)

  return (
    <div className="px-4 py-2 border-b border-[var(--border-subtle)] bg-[var(--surface-1)]">
      <div className="flex items-center gap-2">
        {/* Profile dropdown */}
        <select
          value={activeProfileId ?? ''}
          onChange={e => onSwitch(e.target.value)}
          className="flex-1 h-9 px-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-2)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--ring-focus)]"
        >
          {profiles.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        {/* New profile button */}
        <button
          onClick={handleCreate}
          title="New profile"
          className="h-9 w-9 flex items-center justify-center rounded-lg border border-[var(--border-subtle)] text-[var(--text-muted)] active:scale-95 transition-transform"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>

        {/* Rename button */}
        <button
          onClick={() => activeProfile && handleRename(activeProfile)}
          title="Rename profile"
          className="h-9 w-9 flex items-center justify-center rounded-lg border border-[var(--border-subtle)] text-[var(--text-muted)] active:scale-95 transition-transform"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>

        {/* Delete button */}
        <button
          onClick={() => activeProfileId && profiles.length > 1 && onDelete(activeProfileId)}
          disabled={profiles.length <= 1}
          title="Delete profile"
          className="h-9 w-9 flex items-center justify-center rounded-lg border border-[var(--border-subtle)] text-[var(--text-muted)] disabled:opacity-30 active:scale-95 transition-transform"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6M9 6V4h6v2" />
          </svg>
        </button>
      </div>

      {/* Inline create input */}
      {creating && (
        <div className="flex gap-2 mt-2">
          <input
            autoFocus
            type="text"
            value={creatingName}
            onChange={e => setCreatingName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') { setCreating(false); setCreatingName('') } }}
            placeholder="New profile name…"
            className="flex-1 h-8 px-2 rounded border border-[var(--border-subtle)] bg-[var(--surface-2)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--ring-focus)]"
          />
          <button onClick={handleCreate} className="h-8 px-3 rounded bg-ok text-white text-xs font-medium">Create</button>
          <button onClick={() => { setCreating(false); setCreatingName('') }} className="h-8 px-3 rounded border border-[var(--border-subtle)] text-[var(--text-muted)] text-xs">Cancel</button>
        </div>
      )}

      {/* Inline rename input */}
      {renamingId && (
        <div className="flex gap-2 mt-2">
          <input
            autoFocus
            type="text"
            value={renamingName}
            onChange={e => setRenamingName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') { onRename(renamingId, renamingName.trim()); setRenamingId(null) }
              if (e.key === 'Escape') setRenamingId(null)
            }}
            className="flex-1 h-8 px-2 rounded border border-[var(--border-subtle)] bg-[var(--surface-2)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--ring-focus)]"
          />
          <button onClick={() => { onRename(renamingId, renamingName.trim()); setRenamingId(null) }} className="h-8 px-3 rounded bg-ok text-white text-xs font-medium">Save</button>
          <button onClick={() => setRenamingId(null)} className="h-8 px-3 rounded border border-[var(--border-subtle)] text-[var(--text-muted)] text-xs">Cancel</button>
        </div>
      )}
    </div>
  )
}
