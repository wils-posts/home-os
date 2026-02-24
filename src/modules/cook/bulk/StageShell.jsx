import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TopBar from '../../../shell/TopBar'

const STAGES = [
  { key: 'plan',   label: 'Plan' },
  { key: 'shop',   label: 'Shop' },
  { key: 'cook',   label: 'Cook' },
  { key: 'review', label: 'Review' },
]

const NEXT_STAGE = {
  plan:   'shop',
  shop:   'cook',
  cook:   'review',
  review: null,
}

export default function StageShell({
  currentStage,   // 'plan' | 'shop' | 'cook' | 'review'
  setStage,       // async fn to persist stage change
  onStartNew,     // async fn — archives current + starts new cycle
  children,
  nextLabel,      // override next button label
  onNext,         // override next behaviour
  hideNext,       // true on review stage
  bottomSlot,     // optional content pinned above the next button (used by PlanStage for notes)
}) {
  const navigate = useNavigate()
  const [confirmNew, setConfirmNew] = useState(false)
  const [starting, setStarting] = useState(false)

  async function handlePillClick(stage) {
    if (stage === currentStage) return
    await setStage(stage)
    navigate('/cook/bulk/' + stage)
  }

  async function handleNext() {
    if (onNext) { onNext(); return }
    const next = NEXT_STAGE[currentStage]
    if (!next) return
    await setStage(next)
    navigate('/cook/bulk/' + next)
  }

  async function handleStartNew() {
    setStarting(true)
    setConfirmNew(false)
    await onStartNew()
    setStarting(false)
  }

  const rightSlot = (
    <div className="flex items-center gap-2">
      {/* Start New Cook — plus-circle icon */}
      <button
        onClick={() => setConfirmNew(true)}
        aria-label="Start new cook"
        className="h-9 w-9 rounded-lg border border-[var(--border-subtle)] text-[var(--text-muted)] flex items-center justify-center active:scale-95 transition-transform"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="16" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
      </button>

      {/* Archive — box icon */}
      <button
        onClick={() => navigate('/cook/bulk/archive')}
        aria-label="View archive"
        className="h-9 w-9 rounded-lg border border-[var(--border-subtle)] text-[var(--text-muted)] flex items-center justify-center active:scale-95 transition-transform"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="21 8 21 21 3 21 3 8" />
          <rect x="1" y="3" width="22" height="5" />
          <line x1="10" y1="12" x2="14" y2="12" />
        </svg>
      </button>
    </div>
  )

  return (
    <div
      className="flex flex-col bg-[var(--surface-0)] text-[var(--text-primary)] max-w-md mx-auto"
      style={{ height: '100dvh' }}
    >
      <TopBar
        centre={null}
        right={rightSlot}
      />

      {/* Stage pills — centred, tappable */}
      <div className="shrink-0 flex justify-center gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
        {STAGES.map(s => (
          <button
            key={s.key}
            onClick={() => handlePillClick(s.key)}
            className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-colors active:scale-95 ${
              s.key === currentStage
                ? 'bg-[var(--action-surface)] text-[var(--text-heading)]'
                : 'border border-[var(--border-subtle)] text-[var(--text-muted)]'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Confirm new cook — modal overlay */}
      {confirmNew && (
        <div className="shrink-0 mx-4 mb-3 bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-2xl px-5 py-4 flex flex-col gap-3">
          <p className="text-sm text-[var(--text-muted)] text-center">
            Archive current cook and start fresh?
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
      )}

      {/* Stage content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {children}
      </div>

      {/* Bottom slot (e.g. Plan notes) — pinned above Next button */}
      {bottomSlot && (
        <div className="shrink-0 px-4 pt-3 pb-2 border-t border-[var(--border-subtle)] bg-[var(--surface-0)]">
          {bottomSlot}
        </div>
      )}

      {/* Next stage button */}
      {!hideNext && (
        <div className="shrink-0 px-4 py-4 border-t border-[var(--border-subtle)] bg-[var(--surface-0)]">
          <button
            onClick={handleNext}
            className="w-full h-12 rounded-2xl bg-[var(--action-surface)] text-[var(--text-heading)] font-semibold text-sm active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            {nextLabel ?? 'Next Stage'}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
