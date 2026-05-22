import { useState } from 'react'
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
  const { archivedPeriods, loading, deletePeriod } = useSpenderData()
  const [expanded, setExpanded] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  async function handleDelete(id) {
    await deletePeriod(id)
    setConfirmDelete(null)
    setExpanded(null)
  }

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
        <div className="flex-1 overflow-y-auto min-h-0 px-4 py-4 flex flex-col gap-3">
          {archivedPeriods.map(period => {
            const spent = period.total_spent || 0
            const remaining = period.budget_amount - spent
            const isExpanded = expanded === period.id
            const deleting = confirmDelete === period.id

            return (
              <div
                key={period.id}
                className="bg-[var(--surface-1)] rounded-2xl border border-[var(--border-subtle)] overflow-hidden"
              >
                <button
                  onClick={() => setExpanded(isExpanded ? null : period.id)}
                  className="w-full px-4 py-3 flex items-center justify-between text-left active:bg-[var(--surface-2)] transition-colors"
                >
                  <div>
                    <p className="font-semibold text-[var(--text-heading)]">{fmtMonth(period.created_at)}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      {fmt(spent)} of {fmt(period.budget_amount)} spent
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {period.pushed_to_savings && period.pushed_amount > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--action-surface)] text-[var(--text-heading)]">
                        Saved {fmt(period.pushed_amount)}
                      </span>
                    )}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16" height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`text-[var(--text-muted)] transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 flex flex-col gap-3 border-t border-[var(--border-subtle)]">
                    <div className="grid grid-cols-3 gap-2 pt-3">
                      <div className="flex flex-col items-center">
                        <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Budget</p>
                        <p className="font-semibold text-[var(--text-heading)] mt-0.5">{fmt(period.budget_amount)}</p>
                      </div>
                      <div className="flex flex-col items-center">
                        <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Spent</p>
                        <p className="font-semibold text-[var(--text-heading)] mt-0.5">{fmt(spent)}</p>
                      </div>
                      <div className="flex flex-col items-center">
                        <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Left</p>
                        <p className={`font-semibold mt-0.5 ${remaining < 0 ? 'text-need' : 'text-[var(--text-heading)]'}`}>{fmt(remaining)}</p>
                      </div>
                    </div>

                    {!deleting ? (
                      <button
                        onClick={() => setConfirmDelete(period.id)}
                        className="h-9 rounded-lg border border-need/50 text-need text-sm active:scale-95 transition-transform"
                      >
                        Delete
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="flex-1 h-9 rounded-lg border border-[var(--border-subtle)] text-[var(--text-muted)] text-sm active:scale-95 transition-transform"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleDelete(period.id)}
                          className="flex-1 h-9 rounded-lg bg-need text-white text-sm font-semibold active:scale-95 transition-transform"
                        >
                          Confirm Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
