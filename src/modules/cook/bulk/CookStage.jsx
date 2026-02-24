import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBulkCookData } from '../hooks/useBulkCookData'
import StageShell from './StageShell'

function formatTime(ts) {
  const d = new Date(ts)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatDate(ts) {
  const d = new Date(ts)
  const today = new Date()
  const isToday = d.toDateString() === today.toDateString()
  if (isToday) return null
  return d.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' })
}

export default function CookStage() {
  const navigate = useNavigate()
  const {
    cycle, selectedRecipes, cookLog, loading,
    setStage, startNewCycle,
    setPrepNotes,
    addLogEntry, deleteLogEntry,
  } = useBulkCookData()

  const [logInput, setLogInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const logEndRef = useRef(null)
  const inputRef = useRef(null)

  // Scroll to bottom when log grows
  useEffect(() => {
    if (cookLog.length > 0) {
      logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [cookLog.length])

  async function handleStartNew() {
    const newCycle = await startNewCycle()
    if (newCycle) navigate('/cook/bulk/plan')
  }

  async function handleLog() {
    if (!logInput.trim()) return
    setSubmitting(true)
    await addLogEntry(logInput)
    setLogInput('')
    setSubmitting(false)
    inputRef.current?.focus()
  }

  async function handleDeleteEntry(id) {
    setDeletingId(id)
    await deleteLogEntry(id)
    setDeletingId(null)
    setConfirmDeleteId(null)
  }

  // Log input bar — pinned above the Next Stage button via StageShell bottomSlot
  const logInputSlot = (
    <div className="flex gap-2">
      <input
        ref={inputRef}
        type="text"
        value={logInput}
        onChange={e => setLogInput(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') handleLog() }}
        placeholder="Add log entry…"
        className="flex-1 h-10 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-1)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--ring-focus)]"
      />
      <button
        onClick={handleLog}
        disabled={!logInput.trim() || submitting}
        className="h-10 px-4 rounded-xl bg-[var(--action-surface)] text-[var(--text-heading)] text-sm font-semibold active:scale-95 transition-transform disabled:opacity-50"
      >
        Log
      </button>
    </div>
  )

  if (loading || !cycle) {
    return (
      <div className="flex flex-col bg-[var(--surface-0)] max-w-md mx-auto items-center justify-center" style={{ height: '100dvh' }}>
        <div className="w-8 h-8 border-4 border-[var(--spinner-track)] border-t-[var(--spinner-head)] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <StageShell
      currentStage="cook"
      setStage={setStage}
      onStartNew={handleStartNew}
      bottomSlot={logInputSlot}
    >
      <div className="flex flex-col h-full px-4 pt-4 pb-2">

        {/* Recipe quick-access chips */}
        {selectedRecipes.length > 0 && (
          <div className="shrink-0 mb-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-2">
              Recipes
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedRecipes.map(recipe => (
                <button
                  key={recipe.id}
                  onClick={() => navigate('/cook/recipes/' + recipe.id)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-[var(--surface-1)] border border-[var(--border-subtle)] text-[var(--text-primary)] active:scale-95 transition-transform flex items-center gap-1"
                >
                  {recipe.title}
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Cook notes */}
        <div className="shrink-0 mb-4">
          <textarea
            defaultValue={cycle.prep_notes ?? ''}
            onBlur={e => setPrepNotes(e.target.value)}
            placeholder="Cook notes…"
            rows={3}
            className="w-full px-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-1)] text-[var(--text-primary)] text-sm placeholder:text-[var(--text-muted)] resize-none focus:outline-none focus:ring-1 focus:ring-[var(--ring-focus)] leading-relaxed"
          />
        </div>

        {/* Cook log — scrollable */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-3">
            Cook Log
          </p>

          {cookLog.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)] italic py-4 text-center">
              Log is empty — add your first entry below.
            </p>
          ) : (
            <div className="flex flex-col gap-1">
              {cookLog.map((entry, idx) => {
                const dateLabel = formatDate(entry.logged_at)
                const prevEntry = cookLog[idx - 1]
                const showDate = dateLabel && (!prevEntry || formatDate(prevEntry.logged_at) !== dateLabel)

                return (
                  <div key={entry.id}>
                    {showDate && (
                      <p className="text-[10px] text-[var(--text-muted)] text-center py-2 font-medium">
                        {dateLabel}
                      </p>
                    )}
                    <div className="flex items-start gap-3 py-2 border-b border-[var(--border-subtle)] last:border-b-0">
                      <span className="shrink-0 text-[11px] text-[var(--text-muted)] tabular-nums pt-0.5 w-12 text-right">
                        {formatTime(entry.logged_at)}
                      </span>
                      <p className="flex-1 text-sm text-[var(--text-primary)] leading-relaxed">
                        {entry.body}
                      </p>
                      {confirmDeleteId === entry.id ? (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="text-xs px-2 py-1 rounded border border-[var(--border-subtle)] text-[var(--text-muted)]"
                          >
                            Keep
                          </button>
                          <button
                            onClick={() => handleDeleteEntry(entry.id)}
                            disabled={deletingId === entry.id}
                            className="text-xs px-2 py-1 rounded bg-need text-white font-semibold disabled:opacity-60"
                          >
                            {deletingId === entry.id ? '…' : 'Del'}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(entry.id)}
                          className="shrink-0 w-6 h-6 flex items-center justify-center text-[var(--text-muted)] hover:text-need transition-colors"
                          aria-label="Delete entry"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
              <div ref={logEndRef} />
            </div>
          )}
        </div>

      </div>
    </StageShell>
  )
}
