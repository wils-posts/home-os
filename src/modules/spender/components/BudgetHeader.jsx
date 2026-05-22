import { useState } from 'react'

function fmt(n) {
  return '£' + Math.abs(n).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function BudgetHeader({ remaining, budget, totalSpent, onUpdateBudget }) {
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState('')
  const [adding, setAdding] = useState(false)
  const [addValue, setAddValue] = useState('')

  function startEdit() {
    setAdding(false)
    setEditValue(String(budget))
    setEditing(true)
  }

  async function confirmEdit() {
    const val = parseFloat(editValue)
    if (val > 0 && val !== budget) {
      await onUpdateBudget(val)
    }
    setEditing(false)
  }

  function startAdd() {
    setEditing(false)
    setAddValue('')
    setAdding(true)
  }

  async function confirmAdd() {
    const val = parseFloat(addValue)
    if (val > 0) {
      await onUpdateBudget(budget + val)
    }
    setAdding(false)
  }

  const isNegative = remaining < 0

  return (
    <div className="flex flex-col items-center pt-6 pb-4 px-4 gap-1">
      <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide mb-1">Remaining</p>
      <p className={`text-5xl font-bold ${isNegative ? 'text-need' : 'text-[var(--text-heading)]'}`}>
        {isNegative ? '-' : ''}{fmt(remaining)}
      </p>

      <div className="flex items-center gap-1.5 mt-1">
        {editing ? (
          <>
            <span className="text-sm text-[var(--text-muted)]">£</span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              onBlur={confirmEdit}
              onKeyDown={e => { if (e.key === 'Enter') confirmEdit(); if (e.key === 'Escape') setEditing(false) }}
              autoFocus
              className="w-20 bg-[var(--surface-input)] border border-[var(--border-subtle)] rounded-lg px-2 py-0.5 text-sm text-[var(--text-primary)] focus:outline-none"
            />
            <span className="text-sm text-[var(--text-muted)]">budget</span>
            <button onClick={confirmEdit} className="text-[var(--text-muted)] active:scale-95 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </button>
          </>
        ) : adding ? (
          <>
            <span className="text-sm text-[var(--text-muted)]">{fmt(budget)} +</span>
            <span className="text-sm text-[var(--text-muted)]">£</span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              value={addValue}
              onChange={e => setAddValue(e.target.value)}
              onBlur={confirmAdd}
              onKeyDown={e => { if (e.key === 'Enter') confirmAdd(); if (e.key === 'Escape') setAdding(false) }}
              autoFocus
              className="w-20 bg-[var(--surface-input)] border border-[var(--border-subtle)] rounded-lg px-2 py-0.5 text-sm text-[var(--text-primary)] focus:outline-none"
            />
            <button onClick={confirmAdd} className="text-[var(--text-muted)] active:scale-95 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </button>
          </>
        ) : (
          <>
            <span className="text-sm text-[var(--text-muted)]">{fmt(budget)} budget</span>
            <button onClick={startEdit} aria-label="Edit budget" className="text-[var(--text-muted)] active:scale-95 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button onClick={startAdd} aria-label="Add to budget" className="text-[var(--text-muted)] active:scale-95 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
            </button>
            <span className="text-[var(--text-muted)] text-sm">·</span>
            <span className="text-sm text-[var(--text-muted)]">{fmt(totalSpent)} spent</span>
          </>
        )}
      </div>
    </div>
  )
}
