import { useState } from 'react'

function fmt(n) {
  return '£' + Math.abs(n).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function CloseMonthSheet({ remaining, onConfirm, onCancel }) {
  const [pushToSavings, setPushToSavings] = useState(remaining > 0)
  const [submitting, setSubmitting] = useState(false)

  async function handleConfirm() {
    if (submitting) return
    setSubmitting(true)
    await onConfirm(pushToSavings)
    setSubmitting(false)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end">
      <div className="w-full max-w-md mx-auto bg-[var(--surface-1)] rounded-t-2xl px-6 pt-5 pb-8 flex flex-col gap-5">
        <div className="w-10 h-1 rounded-full bg-[var(--border-subtle)] mx-auto" />

        <div>
          <h2 className="text-lg font-bold text-[var(--text-heading)]">Close this month?</h2>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Your spending history will be archived and you can start a new month.
          </p>
        </div>

        {remaining > 0 && (
          <div className="bg-[var(--surface-0)] rounded-xl p-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">Record {fmt(remaining)} as saved</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">Log the leftover in your archive</p>
            </div>
            <button
              onClick={() => setPushToSavings(v => !v)}
              className={`relative w-11 h-6 rounded-full shrink-0 transition-colors ${pushToSavings ? 'bg-[var(--action-surface)]' : 'bg-[var(--surface-2)]'}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${pushToSavings ? 'translate-x-5' : 'translate-x-0'}`}
              />
            </button>
          </div>
        )}

        {remaining <= 0 && (
          <div className="bg-[var(--surface-0)] rounded-xl p-4">
            <p className="text-sm text-[var(--text-muted)]">
              {remaining < 0
                ? `You overspent by ${fmt(Math.abs(remaining))} this month.`
                : 'Nothing left to save this month.'}
            </p>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <button
            onClick={handleConfirm}
            disabled={submitting}
            className="h-12 rounded-xl bg-[var(--action-surface)] text-[var(--text-heading)] font-semibold disabled:opacity-40 active:scale-95 transition-transform"
          >
            {submitting ? 'Closing…' : 'Close Month'}
          </button>
          <button
            onClick={onCancel}
            className="h-12 rounded-xl border border-[var(--border-subtle)] text-[var(--text-muted)] font-medium active:scale-95 transition-transform"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
