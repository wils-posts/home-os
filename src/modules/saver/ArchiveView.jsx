import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import TopBar from '../../shell/TopBar'
import { useSaverData } from './hooks/useSaverData'

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
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function SaverArchiveView() {
  const navigate = useNavigate()
  const { fetchArchivedGoals, deleteArchivedGoal } = useSaverData()
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  useEffect(() => {
    fetchArchivedGoals().then(data => {
      setGoals(data)
      setLoading(false)
    })
  }, [])

  async function handleDelete(id) {
    await deleteArchivedGoal(id)
    setGoals(prev => prev.filter(g => g.id !== id))
    setConfirmDelete(null)
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
        centre={<span className="text-sm font-semibold text-[var(--text-heading)]">Past Goals</span>}
        right={backButton}
      />

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[var(--spinner-track)] border-t-[var(--spinner-head)] rounded-full animate-spin" />
        </div>
      ) : goals.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[var(--text-muted)] text-sm">No archived goals yet.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
          {goals.map(goal => {
            const contribs = goal.saver_contributions ?? []
            const totalSaved = contribs.reduce((sum, c) => sum + parseFloat(c.amount), 0)
            const cTotal = contribs
              .filter(c => c.contributor === 'C')
              .reduce((sum, c) => sum + parseFloat(c.amount), 0)
            const sTotal = contribs
              .filter(c => c.contributor === 'S')
              .reduce((sum, c) => sum + parseFloat(c.amount), 0)
            const isExpanded = expanded === goal.id
            const deleteConfirming = confirmDelete === goal.id

            return (
              <div
                key={goal.id}
                className="bg-[var(--surface-1)] rounded-2xl border border-[var(--border-subtle)] overflow-hidden"
              >
                <button
                  onClick={() => setExpanded(isExpanded ? null : goal.id)}
                  className="w-full px-4 py-3 flex items-center justify-between text-left active:bg-[var(--surface-2)] transition-colors"
                >
                  <div>
                    <p className="font-semibold text-[var(--text-heading)]">
                      {fmt(goal.target_amount)} goal
                    </p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      Archived {fmtDate(goal.archived_at)}
                    </p>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
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
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 flex flex-col gap-3 border-t border-[var(--border-subtle)]">
                    <div className="grid grid-cols-3 gap-2 pt-3">
                      <div className="flex flex-col items-center">
                        <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Total</p>
                        <p className="font-semibold text-[var(--text-heading)] mt-0.5">{fmt(totalSaved)}</p>
                      </div>
                      <div className="flex flex-col items-center">
                        <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide">C</p>
                        <p className="font-semibold text-[var(--text-heading)] mt-0.5">{fmt(cTotal)}</p>
                      </div>
                      <div className="flex flex-col items-center">
                        <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide">S</p>
                        <p className="font-semibold text-[var(--text-heading)] mt-0.5">{fmt(sTotal)}</p>
                      </div>
                    </div>

                    <p className="text-xs text-[var(--text-muted)]">
                      Deadline: {fmtDate(goal.deadline)}
                    </p>

                    {!deleteConfirming ? (
                      <button
                        onClick={() => setConfirmDelete(goal.id)}
                        className="h-9 rounded-lg border border-need/50 text-need text-sm active:scale-95 transition-transform"
                      >
                        Delete
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="flex-1 h-9 rounded-lg border border-[var(--border-subtle)] text-[var(--text-muted)] text-sm"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleDelete(goal.id)}
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
