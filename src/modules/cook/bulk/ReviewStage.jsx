import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBulkCookData } from '../hooks/useBulkCookData'
import StageShell from './StageShell'

export default function ReviewStage() {
  const navigate = useNavigate()
  const {
    cycle, loading,
    setStage, startNewCycle,
    setReviewNotes, archiveCycle,
  } = useBulkCookData()

  const [confirmArchive, setConfirmArchive] = useState(false)
  const [archiving, setArchiving] = useState(false)

  async function handleStartNew() {
    const newCycle = await startNewCycle()
    if (newCycle) navigate('/cook/bulk/plan')
  }

  async function handleArchive() {
    setArchiving(true)
    await archiveCycle()
    navigate('/cook/bulk')
  }

  if (loading || !cycle) {
    return (
      <div className="flex flex-col bg-[var(--surface-0)] max-w-md mx-auto items-center justify-center" style={{ height: '100dvh' }}>
        <div className="w-8 h-8 border-4 border-[var(--spinner-track)] border-t-[var(--spinner-head)] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <StageShell
      currentStage="review"
      setStage={setStage}
      onStartNew={handleStartNew}
      hideNext
    >
      {/* Review notes */}
      <div className="px-4 pt-4 pb-4">
        <textarea
          defaultValue={cycle.review_notes ?? ''}
          onBlur={e => setReviewNotes(e.target.value)}
          placeholder="Review notes…"
          rows={8}
          className="w-full px-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-1)] text-[var(--text-primary)] text-sm placeholder:text-[var(--text-muted)] resize-none focus:outline-none focus:ring-1 focus:ring-[var(--ring-focus)] leading-relaxed"
        />
      </div>

      {/* Archive action */}
      <div className="px-4 pb-8">
        {confirmArchive ? (
          <div className="bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-2xl px-5 py-4 flex flex-col gap-3">
            <p className="text-sm text-[var(--text-muted)] text-center">
              Archive this cook session? It will become read-only.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmArchive(false)}
                className="flex-1 h-10 rounded-xl border border-[var(--border-subtle)] text-[var(--text-muted)] text-sm active:scale-95 transition-transform"
              >
                Cancel
              </button>
              <button
                onClick={handleArchive}
                disabled={archiving}
                className="flex-1 h-10 rounded-xl bg-ok text-white text-sm font-semibold active:scale-95 transition-transform disabled:opacity-60"
              >
                {archiving ? 'Archiving…' : 'Archive Cook'}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setConfirmArchive(true)}
            className="w-full h-12 rounded-2xl border-2 border-ok text-ok font-semibold text-sm active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="21 8 21 21 3 21 3 8" />
              <rect x="1" y="3" width="22" height="5" />
              <line x1="10" y1="12" x2="14" y2="12" />
            </svg>
            Archive This Cook
          </button>
        )}
      </div>
    </StageShell>
  )
}
