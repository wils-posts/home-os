import { useState } from 'react'

export default function GoalSetupModal({ onCreate }) {
  const [target, setTarget] = useState('')
  const [deadline, setDeadline] = useState('')
  const [weeklyMin, setWeeklyMin] = useState('5.00')
  const [submitting, setSubmitting] = useState(false)

  const valid = target && parseFloat(target) > 0 && deadline

  async function handleSubmit() {
    if (!valid || submitting) return
    setSubmitting(true)
    await onCreate(target, deadline, weeklyMin || '5')
    setSubmitting(false)
  }

  return (
    <div className="fixed inset-0 z-50 bg-[var(--surface-0)] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="text-center">
          <h2 className="text-xl font-bold text-[var(--text-heading)]">Set a Goal</h2>
          <p className="text-sm text-[var(--text-muted)] mt-1">What are you saving towards?</p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Target Amount</label>
            <div className="flex items-center h-11 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-input)] gap-2">
              <span className="text-[var(--text-muted)]">£</span>
              <input
                type="number"
                min="1"
                step="0.01"
                placeholder="0.00"
                value={target}
                onChange={e => setTarget(e.target.value)}
                className="flex-1 bg-transparent text-[var(--text-primary)] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Deadline</label>
            <input
              type="date"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              className="h-11 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-input)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--ring-focus)] w-full"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Weekly Streak Minimum</label>
            <div className="flex items-center h-11 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-input)] gap-2">
              <span className="text-[var(--text-muted)]">£</span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="5.00"
                value={weeklyMin}
                onChange={e => setWeeklyMin(e.target.value)}
                className="flex-1 bg-transparent text-[var(--text-primary)] focus:outline-none"
              />
            </div>
            <p className="text-xs text-[var(--text-muted)]">Minimum to save each week to maintain your streak</p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!valid || submitting}
          className="h-12 rounded-xl bg-[var(--action-surface)] text-[var(--text-heading)] font-semibold disabled:opacity-40 active:scale-95 transition-transform"
        >
          {submitting ? 'Creating…' : 'Create Goal'}
        </button>
      </div>
    </div>
  )
}
