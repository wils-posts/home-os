import { useState } from 'react'

export default function SettingsPanel({ goal, onUpdate, onReset, onClose }) {
  const [target, setTarget] = useState(String(goal.target_amount))
  const [deadline, setDeadline] = useState(goal.deadline)
  const [weeklyMin, setWeeklyMin] = useState(String(goal.weekly_streak_min))
  const [resetConfirm, setResetConfirm] = useState(false)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (saving) return
    setSaving(true)
    await onUpdate({ targetAmount: target, deadline, weeklyMin })
    setSaving(false)
    onClose()
  }

  async function handleReset() {
    await onReset()
    setResetConfirm(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/50" onClick={onClose} />
      <div className="w-72 bg-[var(--surface-1)] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--border-subtle)]">
          <h2 className="font-semibold text-[var(--text-heading)]">Settings</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-[var(--text-muted)]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Target Amount</label>
            <div className="flex items-center h-10 px-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-2)] gap-2">
              <span className="text-[var(--text-muted)] text-sm">£</span>
              <input
                type="number"
                min="1"
                step="0.01"
                value={target}
                onChange={e => setTarget(e.target.value)}
                className="flex-1 bg-transparent text-[var(--text-primary)] text-sm focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Deadline</label>
            <input
              type="date"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              className="h-10 px-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-2)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--ring-focus)]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Weekly Streak Minimum</label>
            <div className="flex items-center h-10 px-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-2)] gap-2">
              <span className="text-[var(--text-muted)] text-sm">£</span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={weeklyMin}
                onChange={e => setWeeklyMin(e.target.value)}
                className="flex-1 bg-transparent text-[var(--text-primary)] text-sm focus:outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="h-10 rounded-lg bg-[var(--action-surface)] text-[var(--text-heading)] text-sm font-semibold disabled:opacity-40 active:scale-95 transition-transform"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>

          <div className="border-t border-[var(--border-subtle)] pt-4">
            {!resetConfirm ? (
              <button
                onClick={() => setResetConfirm(true)}
                className="w-full h-10 rounded-lg border border-need/50 text-need text-sm font-medium active:scale-95 transition-transform"
              >
                Reset Goal
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <p className="text-xs text-[var(--text-muted)] text-center">
                  This clears all contributions. Goal settings are kept.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setResetConfirm(false)}
                    className="flex-1 h-9 rounded-lg border border-[var(--border-subtle)] text-[var(--text-muted)] text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReset}
                    className="flex-1 h-9 rounded-lg bg-need text-white text-sm font-semibold active:scale-95 transition-transform"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
