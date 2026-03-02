import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TopBar from '../../shell/TopBar'
import { useSaverData } from './hooks/useSaverData'
import GoalSetupModal from './components/GoalSetupModal'
import ContribModal from './components/ContribModal'
import SettingsPanel from './components/SettingsPanel'

function fmt(amount) {
  return (
    '£' +
    parseFloat(amount).toLocaleString('en-GB', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  )
}

function fmtDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function SaverView() {
  const navigate = useNavigate()
  const {
    goal,
    loading,
    totalSaved,
    cTotal,
    sTotal,
    cStreak,
    sStreak,
    cWeekTotal,
    sWeekTotal,
    remaining,
    weeklyNeeded,
    percent,
    createGoal,
    addContribution,
    archiveGoal,
    updateGoalSettings,
    resetGoal,
  } = useSaverData()

  const [showContrib, setShowContrib] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const rightSlot = (
    <div className="flex items-center gap-1">
      <button
        onClick={() => navigate('/saver/archive')}
        aria-label="Past goals"
        className="h-9 w-9 flex items-center justify-center rounded-lg border border-[var(--border-subtle)] text-[var(--text-muted)] active:scale-95 transition-transform"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="21 8 21 21 3 21 3 8" />
          <rect x="1" y="3" width="22" height="5" />
          <line x1="10" y1="12" x2="14" y2="12" />
        </svg>
      </button>
      <button
        onClick={() => setShowSettings(true)}
        aria-label="Settings"
        className="h-9 w-9 flex items-center justify-center rounded-lg border border-[var(--border-subtle)] text-[var(--text-muted)] active:scale-95 transition-transform"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--surface-0)]">
        <div className="w-8 h-8 border-4 border-[var(--spinner-track)] border-t-[var(--spinner-head)] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div
      className="bg-[var(--surface-0)] text-[var(--text-primary)] max-w-md mx-auto flex flex-col"
      style={{ height: '100dvh' }}
    >
      <TopBar centre={null} right={goal ? rightSlot : null} />

      {/* No goal: show setup modal */}
      {!goal && <GoalSetupModal onCreate={createGoal} />}

      {/* Goal reached: celebration overlay */}
      {goal && percent >= 100 && (
        <div className="fixed inset-0 z-50 bg-[var(--surface-0)] flex flex-col items-center justify-center px-6 text-center gap-6">
          <div className="text-5xl">🎉</div>
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-heading)]">Goal Reached!</h2>
            <p className="text-[var(--text-muted)] mt-2">You saved {fmt(totalSaved)}</p>
          </div>
          <button
            onClick={archiveGoal}
            className="h-12 px-8 rounded-xl bg-[var(--action-surface)] text-[var(--text-heading)] font-semibold active:scale-95 transition-transform"
          >
            Archive &amp; Start New
          </button>
        </div>
      )}

      {/* Main content */}
      {goal && percent < 100 && (
        <div className="flex-1 overflow-y-auto px-4 pb-6 flex flex-col gap-6">
          {/* Total Saved */}
          <div className="flex flex-col items-center pt-6 pb-2">
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide mb-2">Total Saved</p>
            <p className="text-5xl font-bold text-[var(--text-heading)]">{fmt(totalSaved)}</p>
          </div>

          {/* Progress bar */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-3 bg-[var(--surface-2)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--action-surface)] rounded-full transition-all duration-500"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <span className="text-sm text-[var(--text-muted)] shrink-0 w-10 text-right">
                {Math.round(percent)}%
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)] text-center">
              Deadline: {fmtDate(goal.deadline)}
            </p>
          </div>

          {/* Goal status */}
          <div className="flex flex-col items-center gap-1">
            <p className="text-[var(--text-primary)] font-medium">{fmt(remaining)} remaining</p>
            <p className="text-[var(--text-muted)] text-sm">{fmt(weeklyNeeded)} per week needed</p>
          </div>

          {/* Contributor cards */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'C', total: cTotal, streak: cStreak, weekTotal: cWeekTotal },
              { key: 'S', total: sTotal, streak: sStreak, weekTotal: sWeekTotal },
            ].map(({ key, total, streak, weekTotal }) => (
              <div
                key={key}
                className="bg-[var(--surface-1)] rounded-2xl border border-[var(--border-subtle)] p-4 flex flex-col gap-2"
              >
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-[var(--action-surface)] flex items-center justify-center text-sm font-bold text-[var(--text-heading)] shrink-0">
                    {key}
                  </div>
                  <span className="font-semibold text-[var(--text-heading)] text-sm">{fmt(total)}</span>
                </div>
                <div className="text-sm text-[var(--text-primary)]">
                  🔥 Streak: {streak}
                </div>
                <div className="text-xs text-[var(--text-muted)]">
                  This week: {fmt(weekTotal)} / {fmt(goal.weekly_streak_min)}
                </div>
              </div>
            ))}
          </div>

          {/* Add Contribution */}
          <button
            onClick={() => setShowContrib(true)}
            className="h-12 rounded-xl bg-[var(--action-surface)] text-[var(--text-heading)] font-semibold active:scale-95 transition-transform"
          >
            Add Contribution
          </button>
        </div>
      )}

      {showContrib && (
        <ContribModal
          onConfirm={addContribution}
          onClose={() => setShowContrib(false)}
        />
      )}

      {showSettings && goal && (
        <SettingsPanel
          goal={goal}
          onUpdate={updateGoalSettings}
          onReset={resetGoal}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}
