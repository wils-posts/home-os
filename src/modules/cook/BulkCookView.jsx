import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TopBar from '../../shell/TopBar'
import { useBulkCookData } from './hooks/useBulkCookData'

const STAGE_LABELS = {
  plan: 'Plan', shop: 'Shop', prep: 'Prep', cook: 'Cook', review: 'Review',
}

export default function BulkCookView() {
  const navigate = useNavigate()
  const { cycle, loading, startNewCycle } = useBulkCookData()
  const [confirmNew, setConfirmNew] = useState(false)
  const [starting, setStarting] = useState(false)

  async function handleStartNew() {
    setStarting(true)
    const newCycle = await startNewCycle()
    if (newCycle) navigate('/cook/bulk/plan')
    setStarting(false)
  }

  async function handleResume() {
    if (cycle) navigate('/cook/bulk/' + cycle.stage)
  }

  return (
    <div
      className="flex flex-col bg-[var(--surface-0)] text-[var(--text-primary)] max-w-md mx-auto"
      style={{ height: '100dvh' }}
    >
      <TopBar
        centre={<span className="text-sm font-semibold text-[var(--text-heading)]">Bulk Cook</span>}
      />

      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
        {loading ? (
          <div className="w-8 h-8 border-4 border-[var(--spinner-track)] border-t-[var(--spinner-head)] rounded-full animate-spin" />
        ) : cycle ? (
          /* Active cycle exists */
          <>
            <div className="text-center">
              <p className="text-[var(--text-muted)] text-sm mb-2">Active cook session</p>
              <span className="px-4 py-1.5 rounded-full text-sm font-semibold bg-[var(--action-surface)] text-[var(--text-heading)]">
                {STAGE_LABELS[cycle.stage] ?? cycle.stage}
              </span>
            </div>

            <button
              onClick={handleResume}
              className="w-full h-14 rounded-2xl bg-[var(--action-surface)] text-[var(--text-heading)] font-semibold text-base active:scale-95 transition-transform"
            >
              Resume Cook
            </button>

            {confirmNew ? (
              <div className="w-full bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-2xl px-5 py-4 flex flex-col gap-3">
                <p className="text-sm text-[var(--text-muted)] text-center">
                  Archive the current session and start fresh?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmNew(false)}
                    className="flex-1 h-10 rounded-xl border border-[var(--border-subtle)] text-[var(--text-muted)] text-sm active:scale-95 transition-transform"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleStartNew}
                    disabled={starting}
                    className="flex-1 h-10 rounded-xl bg-need text-white text-sm font-semibold active:scale-95 transition-transform disabled:opacity-60"
                  >
                    {starting ? '…' : 'Start New'}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setConfirmNew(true)}
                className="text-sm text-[var(--text-muted)] underline underline-offset-2 active:text-[var(--text-primary)] transition-colors"
              >
                Start new cook instead…
              </button>
            )}
          </>
        ) : (
          /* No active cycle */
          <>
            <div className="text-center">
              <p className="text-lg font-semibold text-[var(--text-heading)] mb-2">No active cook session</p>
              <p className="text-sm text-[var(--text-muted)]">Start a new bulk cook to begin planning.</p>
            </div>
            <button
              onClick={handleStartNew}
              disabled={starting}
              className="w-full h-14 rounded-2xl bg-[var(--action-surface)] text-[var(--text-heading)] font-semibold text-base active:scale-95 transition-transform disabled:opacity-60"
            >
              {starting ? 'Starting…' : 'Start New Cook'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
