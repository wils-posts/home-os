import { useState } from 'react'

function fmt(n) {
  return '£' + Math.abs(n).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function BudgetHeader({ remaining, budget, totalSpent, onUpdateBudget }) {
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState('')

  function startEdit() {
    setEditValue(String(budget))
    setEditing(true)
  }

  async function confirmEdit() {
    const val = parseFloat(editValue)
    if (val > 0 && val !== budget) {
      await onUpdateBudget(editValue)
    }
    setEditing(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') confirmEdit()
    if (e.key === 'Escape') setEditing(false)
  }

  const isNegative = remaining < 0

  return (
    <div className="flex flex-col items-center pt-6 pb-4 px-4 gap-1">
      <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide mb-1">Remaining</p>
      <p className={`text-5xl font-bold ${isNegative ? 'text-need' : 'text-[var(--text-heading)]'}`}>
        {isNegative ? '-' : ''}{fmt(remaining)}
      </p>

      <div className="flex items-center gap-2 mt-1">
        {editing ? (
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-[var(--text-muted)]">£</span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              onBlur={confirmEdit}
              onKeyDown={handleKeyDown}
              autoFocus
              className="w-24 bg-[var(--surface-input)] border border-[var(--border-subtle)] rounded-lg px-2 py-0.5 text-sm text-[var(--text-primary)] focus:outline-none"
            />
            <span className="text-sm text-[var(--text-muted)]">budget</span>
            <button onClick={confirmEdit} className="text-[var(--text-muted)] active:scale-95 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-[var(--text-muted)]">{fmt(budget)} budget</span>
            <button
              onClick={startEdit}
              aria-label="Edit budget"
              className="text-[var(--text-muted)] active:scale-95 transition-transform"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <span className="text-[var(--text-muted)] text-sm">·</span>
            <span className="text-sm text-[var(--text-muted)]">{fmt(totalSpent)} spent</span>
          </div>
        )}
      </div>
    </div>
  )
}
