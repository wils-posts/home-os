import { useState } from 'react'
import TopBar from '../../../shell/TopBar'

export default function SetBudgetModal({ onStart, previousBudget = null }) {
  const [amount, setAmount] = useState(previousBudget ? String(previousBudget) : '')
  const [submitting, setSubmitting] = useState(false)

  const valid = amount && parseFloat(amount) > 0

  async function handleSubmit() {
    if (!valid || submitting) return
    setSubmitting(true)
    await onStart(amount)
    setSubmitting(false)
  }

  return (
    <div className="fixed inset-0 z-50 bg-[var(--surface-0)] flex flex-col">
      <TopBar centre={null} right={null} />
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-sm flex flex-col gap-6">
          <div className="text-center">
            <h2 className="text-xl font-bold text-[var(--text-heading)]">
              {previousBudget ? 'New Month' : 'Set your budget'}
            </h2>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              How much do you have to spend this month?
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Budget</label>
            <div className="flex items-center h-11 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-input)] gap-2">
              <span className="text-[var(--text-muted)]">£</span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                autoFocus
                className="flex-1 bg-transparent text-[var(--text-primary)] focus:outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!valid || submitting}
            className="h-12 rounded-xl bg-[var(--action-surface)] text-[var(--text-heading)] font-semibold disabled:opacity-40 active:scale-95 transition-transform"
          >
            {submitting ? 'Starting…' : 'Start Month'}
          </button>
        </div>
      </div>
    </div>
  )
}
