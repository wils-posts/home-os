import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TopBar from '../../../shell/TopBar'
import { useBulkCookData } from '../hooks/useBulkCookData'

function formatDate(ts) {
  if (!ts) return '—'
  return new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const STAGE_LABELS = {
  plan: 'Plan', shop: 'Shop', prep: 'Cook', cook: 'Cook', review: 'Review',
}

export default function BulkArchiveView() {
  const navigate = useNavigate()
  const { fetchArchivedCycles, deleteArchivedCycle } = useBulkCookData()

  const [cycles, setCycles] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    fetchArchivedCycles().then(data => {
      setCycles(data)
      setLoading(false)
    })
  }, []) // eslint-disable-line

  async function handleDelete(id) {
    setDeletingId(id)
    const ok = await deleteArchivedCycle(id)
    if (ok) {
      setCycles(prev => prev.filter(c => c.id !== id))
      setConfirmDeleteId(null)
      setExpandedId(null)
    }
    setDeletingId(null)
  }

  const backButton = (
    <button
      onClick={() => navigate(-1)}
      aria-label="Go back"
      className="h-9 w-9 rounded-lg border border-[var(--border-subtle)] text-[var(--text-muted)] flex items-center justify-center active:scale-95 transition-transform"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>
  )

  return (
    <div
      className="flex flex-col bg-[var(--surface-0)] text-[var(--text-primary)] max-w-md mx-auto"
      style={{ height: '100dvh' }}
    >
      <TopBar
        centre={
          <span className="text-sm font-semibold text-[var(--text-heading)]">Past Cooks</span>
        }
        right={backButton}
      />

      <div className="flex-1 overflow-y-auto min-h-0">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-[var(--spinner-track)] border-t-[var(--spinner-head)] rounded-full animate-spin" />
          </div>
        ) : cycles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <p className="text-sm text-[var(--text-muted)] italic">No archived cooks yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 px-4 py-4">
            {cycles.map(cycle => {
              const expanded = expandedId === cycle.id
              const confirmingDelete = confirmDeleteId === cycle.id

              return (
                <div
                  key={cycle.id}
                  className="bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden"
                >
                  {/* Card header — always visible */}
                  <button
                    onClick={() => setExpandedId(expanded ? null : cycle.id)}
                    className="w-full text-left px-4 py-4 flex items-start justify-between gap-3 active:bg-[var(--surface-0)] transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[var(--text-heading)]">
                        {formatDate(cycle.archived_at)}
                      </p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs text-[var(--text-muted)]">
                          {cycle.recipes.length} {cycle.recipes.length === 1 ? 'recipe' : 'recipes'}
                        </span>
                        {cycle.stage && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--surface-0)] border border-[var(--border-subtle)] text-[var(--text-muted)]">
                            {STAGE_LABELS[cycle.stage] ?? cycle.stage}
                          </span>
                        )}
                      </div>
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
                      className={`shrink-0 text-[var(--text-muted)] transition-transform mt-0.5 ${expanded ? 'rotate-180' : ''}`}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  {/* Expanded detail */}
                  {expanded && (
                    <div className="border-t border-[var(--border-subtle)] px-4 py-4 flex flex-col gap-5">

                      {/* Recipes */}
                      {cycle.recipes.length > 0 && (
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-2">
                            Recipes
                          </p>
                          <div className="flex flex-col gap-1">
                            {cycle.recipes.map((title, i) => (
                              <p key={i} className="text-sm text-[var(--text-primary)]">
                                · {title}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Cook notes */}
                      {cycle.prep_notes && (
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-2">
                            Cook Notes
                          </p>
                          <p className="text-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
                            {cycle.prep_notes}
                          </p>
                        </div>
                      )}

                      {/* Cook log */}
                      {cycle.log.length > 0 && (
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-2">
                            Cook Log
                          </p>
                          <div className="flex flex-col gap-1">
                            {cycle.log.map(entry => (
                              <div key={entry.id} className="flex items-start gap-3 py-1.5 border-b border-[var(--border-subtle)] last:border-b-0">
                                <span className="shrink-0 text-[11px] text-[var(--text-muted)] tabular-nums pt-0.5 w-12 text-right">
                                  {formatTime(entry.logged_at)}
                                </span>
                                <p className="flex-1 text-sm text-[var(--text-primary)] leading-relaxed">
                                  {entry.body}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Review notes */}
                      {cycle.review_notes && (
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-2">
                            Review Notes
                          </p>
                          <p className="text-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
                            {cycle.review_notes}
                          </p>
                        </div>
                      )}

                      {/* Delete */}
                      {confirmingDelete ? (
                        <div className="flex flex-col gap-3 pt-1">
                          <p className="text-sm text-[var(--text-muted)] text-center">
                            Delete this cook session permanently?
                          </p>
                          <div className="flex gap-3">
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="flex-1 h-10 rounded-xl border border-[var(--border-subtle)] text-[var(--text-muted)] text-sm active:scale-95 transition-transform"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleDelete(cycle.id)}
                              disabled={deletingId === cycle.id}
                              className="flex-1 h-10 rounded-xl bg-need text-white text-sm font-semibold active:scale-95 transition-transform disabled:opacity-60"
                            >
                              {deletingId === cycle.id ? 'Deleting…' : 'Delete'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(cycle.id)}
                          className="text-xs text-[var(--text-muted)] underline underline-offset-2 self-center active:text-need transition-colors"
                        >
                          Delete this cook
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
