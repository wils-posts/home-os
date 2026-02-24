import { useState } from 'react'

export default function ItemsList({ items, onAdd, onUpdate, onDelete }) {
  const [open, setOpen] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editLabel, setEditLabel] = useState('')

  function handleAdd() {
    if (!newLabel.trim()) return
    onAdd(newLabel.trim(), 1)
    setNewLabel('')
  }

  function startEdit(item) {
    setEditingId(item.id)
    setEditLabel(item.label)
  }

  function commitEdit(item) {
    if (editLabel.trim() && editLabel.trim() !== item.label) {
      onUpdate(item.id, { label: editLabel.trim() })
    }
    setEditingId(null)
  }

  return (
    <div className="border-t border-[var(--border-subtle)]">
      {/* Collapsible header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-[var(--surface-1)] active:bg-[var(--surface-2)] transition-colors"
      >
        <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
          Items ({items.length})
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2"
          className={`w-4 h-4 text-[var(--text-muted)] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="bg-[var(--surface-1)]">
          {items.map(item => (
            <div key={item.id} className="flex items-center gap-2 px-4 py-2 border-b border-[var(--border-subtle)] last:border-b-0">
              {editingId === item.id ? (
                <input
                  autoFocus
                  type="text"
                  value={editLabel}
                  onChange={e => setEditLabel(e.target.value)}
                  onBlur={() => commitEdit(item)}
                  onKeyDown={e => { if (e.key === 'Enter') commitEdit(item); if (e.key === 'Escape') setEditingId(null) }}
                  className="flex-1 h-8 px-2 rounded border border-[var(--border-subtle)] bg-[var(--surface-2)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--ring-focus)]"
                />
              ) : (
                <span
                  onClick={() => startEdit(item)}
                  className="flex-1 text-sm text-[var(--text-primary)] cursor-pointer truncate"
                >
                  {item.label}
                </span>
              )}

              {/* Weight input */}
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-xs text-[var(--text-muted)]">W:</span>
                <input
                  type="number"
                  value={item.weight}
                  min="0.5"
                  step="0.5"
                  onChange={e => {
                    const w = parseFloat(e.target.value)
                    if (w >= 0.5) onUpdate(item.id, { weight: w })
                  }}
                  className="w-14 h-7 px-1 rounded border border-[var(--border-subtle)] bg-[var(--surface-2)] text-[var(--text-primary)] text-xs text-center focus:outline-none focus:ring-1 focus:ring-[var(--ring-focus)]"
                />
              </div>

              {/* Delete */}
              <button
                onClick={() => onDelete(item.id)}
                className="w-7 h-7 flex items-center justify-center text-[var(--text-muted)] hover:text-need active:scale-95 transition-transform shrink-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}

          {/* Add row */}
          <div className="flex gap-2 px-4 py-2">
            <input
              type="text"
              value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              placeholder="Add item…"
              className="flex-1 h-9 px-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-2)] text-[var(--text-primary)] text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--ring-focus)]"
            />
            <button
              onClick={handleAdd}
              disabled={!newLabel.trim()}
              className="h-9 px-4 rounded-lg bg-[var(--action-surface)] text-[var(--text-heading)] text-sm font-medium disabled:opacity-40 active:scale-95 transition-transform"
            >
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
