import { useState } from 'react'

export default function AddTaskBar({ onAdd }) {
  const [title, setTitle] = useState('')
  const [dueDay, setDueDay] = useState('')
  const [isPriority, setIsPriority] = useState(false)
  const [expanded, setExpanded] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    onAdd({ title: trimmed, due_day: dueDay || null, is_priority: isPriority })
    setTitle('')
    setDueDay('')
    setIsPriority(false)
    setExpanded(false)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-4 py-3 bg-[var(--surface-0)] border-t border-[var(--border-subtle)]"
    >
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={title}
          onChange={e => { setTitle(e.target.value); if (e.target.value && !expanded) setExpanded(true) }}
          onFocus={() => setExpanded(true)}
          placeholder="Add task…"
          enterKeyHint="done"
          className="flex-1 h-11 px-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-input)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring-focus)]"
        />
        {/* Priority toggle */}
        <button
          type="button"
          onClick={() => setIsPriority(p => !p)}
          aria-label="Toggle priority"
          className={`h-11 w-11 flex items-center justify-center rounded-lg border transition-colors ${
            isPriority
              ? 'border-[var(--action-surface)] text-[var(--action-surface)]'
              : 'border-[var(--border-subtle)] text-[var(--text-muted)]'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isPriority ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
        <button
          type="submit"
          className="h-11 px-4 bg-[var(--action-surface)] text-[var(--text-heading)] rounded-lg font-medium text-sm active:scale-95 transition-transform"
        >
          Add
        </button>
      </div>

      {/* Optional due date row, shown when input is focused */}
      {expanded && (
        <div className="flex items-center gap-2 mt-2">
          <label className="text-xs text-[var(--text-muted)] shrink-0">Due</label>
          <input
            type="date"
            value={dueDay}
            onChange={e => setDueDay(e.target.value)}
            className="flex-1 h-9 px-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-input)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--ring-focus)]"
          />
          <button
            type="button"
            onClick={() => { setExpanded(false); setDueDay('') }}
            className="text-xs text-[var(--text-muted)] px-2 py-1"
          >
            Cancel
          </button>
        </div>
      )}
    </form>
  )
}
