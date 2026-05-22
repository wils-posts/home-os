import { useNavigate } from 'react-router-dom'
import TopBar from '../../shell/TopBar'
import { useSpenderData } from './hooks/useSpenderData'

function fmt(n) {
  return '£' + parseFloat(n || 0).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function fmtMonth(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

export default function SpenderArchiveView() {
  const navigate = useNavigate()
  const { archivedPeriods, loading } = useSpenderData()

  const backButton = (
    <button
      onClick={() => navigate(-1)}
      className="h-9 w-9 flex items-center justify-center rounded-lg border border-[var(--border-subtle)] text-[var(--text-muted)] active:scale-95 transition-transform"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>
  )

  return (
    <div
      className="bg-[var(--surface-0)] text-[var(--text-primary)] max-w-md mx-auto flex flex-col"
      style={{ height: '100dvh' }}
    >
      <TopBar
        centre={<span className="text-sm font-semibold text-[var(--text-heading)]">Past Months</span>}
        right={backButton}
      />

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[var(--spinner-track)] border-t-[var(--spinner-head)] rounded-full animate-spin" />
        </div>
      ) : archivedPeriods.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[var(--text-muted)] text-sm">No archived months yet.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
          {archivedPeriods.map(period => {
            const spent = period.total_spent || 0
            const remaining = period.budget_amount - spent
            return (
              <div
                key={period.id}
                className="bg-[var(--surface-1)] rounded-2xl border border-[var(--border-subtle)] px-4 py-4 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[var(--text-heading)]">{fmtMonth(period.created_at)}</span>
                  {period.pushed_to_savings && period.pushed_amount > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--action-surface)] text-[var(--text-heading)]">
                      Saved {fmt(period.pushed_amount)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
                  <span>{fmt(period.budget_amount)} budget</span>
                  <span>·</span>
                  <span>{fmt(spent)} spent</span>
                  <span>·</span>
                  <span className={remaining < 0 ? 'text-need' : ''}>{fmt(remaining)} left</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
