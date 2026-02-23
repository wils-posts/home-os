import { useState } from 'react'

export default function AddItemBar({ onAdd }) {
  const [value, setValue] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const name = value.trim()
    if (!name) return
    onAdd(name)
    setValue('')
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="fixed bottom-0 left-0 right-0 flex items-center gap-2 px-4 py-3 bg-[var(--surface-0)] border-t border-[var(--border-subtle)]"
    >
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Add item…"
        enterKeyHint="done"
        className="flex-1 h-11 px-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-input)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring-focus)]"
      />
      <button
        type="submit"
        className="h-11 px-4 bg-[var(--action-surface)] text-[var(--text-heading)] rounded-lg font-medium text-sm active:scale-95 transition-transform"
      >
        Add
      </button>
    </form>
  )
}
