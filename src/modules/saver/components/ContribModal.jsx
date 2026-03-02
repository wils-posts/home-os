import { useState } from 'react'

const QUICK = [2, 5, 10, 20]

export default function ContribModal({ onConfirm, onClose }) {
  const [amount, setAmount] = useState('')
  const [contributor, setContributor] = useState('C')
  const [submitting, setSubmitting] = useState(false)

  const numAmount = parseFloat(amount)
  const valid = numAmount > 0

  function selectQuick(val) {
    setAmount(String(val))
  }

  async function handleConfirm() {
    if (!valid || submitting) return
    setSubmitting(true)
    await onConfirm(contributor, numAmount)
    setSubmitting(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div
        className="w-full max-w-md mx-auto bg-[var(--surface-1)] rounded-t-2xl border-t border-[var(--border-subtle)] px-4 pt-4 pb-8 flex flex-col gap-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-[var(--text-heading)]">Add Contribution</h3>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-lg text-[var(--text-muted)]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Contributor selector */}
        <div className="flex gap-2">
          {['C', 'S'].map(c => (
            <button
              key={c}
              onClick={() => setContributor(c)}
              className={`flex-1 h-10 rounded-xl text-sm font-semibold transition-colors ${
                contributor === c
                  ? 'bg-[var(--action-surface)] text-[var(--text-heading)]'
                  : 'border border-[var(--border-subtle)] text-[var(--text-muted)]'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Quick amount buttons */}
        <div className="flex gap-2">
          {QUICK.map(val => (
            <button
              key={val}
              onClick={() => selectQuick(val)}
              className={`flex-1 h-10 rounded-xl text-sm font-medium transition-colors ${
                amount === String(val)
                  ? 'bg-[var(--action-surface)] text-[var(--text-heading)]'
                  : 'border border-[var(--border-subtle)] text-[var(--text-muted)]'
              }`}
            >
              £{val}
            </button>
          ))}
        </div>

        {/* Custom amount */}
        <div className="flex items-center h-11 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-input)] gap-2">
          <span className="text-[var(--text-muted)]">£</span>
          <input
            type="number"
            min="0.01"
            step="0.01"
            placeholder="Custom amount"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="flex-1 bg-transparent text-[var(--text-primary)] focus:outline-none"
          />
        </div>

        <button
          onClick={handleConfirm}
          disabled={!valid || submitting}
          className="h-12 rounded-xl bg-[var(--action-surface)] text-[var(--text-heading)] font-semibold disabled:opacity-40 active:scale-95 transition-transform"
        >
          {submitting ? 'Saving…' : 'Confirm'}
        </button>
      </div>
    </div>
  )
}
