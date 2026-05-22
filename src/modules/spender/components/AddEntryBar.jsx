import { useState } from 'react'

export default function AddEntryBar({ onAdd }) {
  const [amount, setAmount] = useState('')
  const [label, setLabel] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const valid = amount && parseFloat(amount) > 0

  async function handleSubmit() {
    if (!valid || submitting) return
    setSubmitting(true)
    await onAdd(amount, label)
    setAmount('')
    setLabel('')
    setSubmitting(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div className="shrink-0 border-t border-[var(--border-subtle)] bg-[var(--surface-1)] px-4 py-3 flex items-center gap-2">
      <div className="flex items-center h-11 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-input)] gap-1.5 w-28 shrink-0">
        <span className="text-[var(--text-muted)]">£</span>
        <input
          type="number"
          min="0.01"
          step="0.01"
          placeholder="0.00"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full bg-transparent text-[var(--text-primary)] focus:outline-none"
        />
      </div>
      <input
        type="text"
        placeholder="What for? (optional)"
        value={label}
        onChange={e => setLabel(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 h-11 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-input)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none"
      />
      <button
        onClick={handleSubmit}
        disabled={!valid || submitting}
        className="h-11 w-11 shrink-0 rounded-xl bg-[var(--action-surface)] text-[var(--text-heading)] flex items-center justify-center disabled:opacity-40 active:scale-95 transition-transform"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    </div>
  )
}
