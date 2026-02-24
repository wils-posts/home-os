import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import TopBar from '../../../shell/TopBar'

const STAGES = [
  { key: 'plan',   label: 'Plan' },
  { key: 'shop',   label: 'Shop' },
  { key: 'prep',   label: 'Prep' },
  { key: 'cook',   label: 'Cook' },
  { key: 'review', label: 'Review' },
]

const NEXT_STAGE = {
  plan:   'shop',
  shop:   'prep',
  prep:   'cook',
  cook:   'review',
  review: null,
}

export default function StageShell({
  currentStage,   // 'plan' | 'shop' | 'prep' | 'cook' | 'review'
  setStage,       // async fn to persist stage change
  onStartNew,     // async fn — archives + starts new, then navigate
  children,
  nextLabel,      // override next button label (default "Next Stage →")
  onNext,         // override next behaviour (default: advance stage + navigate)
  hideNext,       // true on review stage
}) {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmNew, setConfirmNew] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!menuOpen) return
    function handler(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
        setConfirmNew(false)
      }
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('touchstart', handler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('touchstart', handler)
    }
  }, [menuOpen])

  async function handleNext() {
    if (onNext) { onNext(); return }
    const next = NEXT_STAGE[currentStage]
    if (!next) return
    await setStage(next)
    navigate('/cook/bulk/' + next)
  }

  async function handleJump(stage) {
    setMenuOpen(false)
    setConfirmNew(false)
    await setStage(stage)
    navigate('/cook/bulk/' + stage)
  }

  async function handleStartNew() {
    setMenuOpen(false)
    setConfirmNew(false)
    await onStartNew()
  }

  const burgerButton = (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => { setMenuOpen(o => !o); setConfirmNew(false) }}
        aria-label="Stage menu"
        className="h-9 w-9 rounded-lg border border-[var(--border-subtle)] text-[var(--text-muted)] flex items-center justify-center active:scale-95 transition-transform"
      >
        {/* Burger / hamburger icon */}
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6"  x2="21" y2="6"  />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-11 z-50 w-52 bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-xl shadow-lg overflow-hidden">
          {/* Jump to stage */}
          {STAGES.map(s => (
            <button
              key={s.key}
              onClick={() => handleJump(s.key)}
              className={`w-full px-4 py-3 text-left text-sm transition-colors flex items-center justify-between
                ${s.key === currentStage
                  ? 'text-[var(--text-heading)] font-semibold bg-[var(--surface-2)]'
                  : 'text-[var(--text-primary)] hover:bg-[var(--surface-2)] active:bg-[var(--surface-2)]'
                }`}
            >
              {s.label}
              {s.key === currentStage && (
                <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">current</span>
              )}
            </button>
          ))}

          <div className="h-px bg-[var(--border-subtle)]" />

          {/* Start new */}
          {confirmNew ? (
            <div className="px-4 py-3 flex flex-col gap-2">
              <p className="text-xs text-[var(--text-muted)]">Archive current cook and start fresh?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmNew(false)}
                  className="flex-1 h-8 rounded-lg border border-[var(--border-subtle)] text-[var(--text-muted)] text-xs active:scale-95 transition-transform"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStartNew}
                  className="flex-1 h-8 rounded-lg bg-need text-white text-xs font-semibold active:scale-95 transition-transform"
                >
                  Start New
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirmNew(true)}
              className="w-full px-4 py-3 text-left text-sm text-need hover:bg-[var(--surface-2)] active:bg-[var(--surface-2)] transition-colors"
            >
              Start New Cook…
            </button>
          )}
        </div>
      )}
    </div>
  )

  return (
    <div
      className="flex flex-col bg-[var(--surface-0)] text-[var(--text-primary)] max-w-md mx-auto"
      style={{ height: '100dvh' }}
    >
      <TopBar
        centre={
          <span className="text-sm font-semibold text-[var(--text-heading)]">
            {STAGES.find(s => s.key === currentStage)?.label ?? 'Bulk Cook'}
          </span>
        }
        right={burgerButton}
      />

      {/* Stage pills */}
      <div className="shrink-0 flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
        {STAGES.map(s => (
          <span
            key={s.key}
            className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              s.key === currentStage
                ? 'bg-[var(--action-surface)] text-[var(--text-heading)]'
                : 'border border-[var(--border-subtle)] text-[var(--text-muted)]'
            }`}
          >
            {s.label}
          </span>
        ))}
      </div>

      {/* Stage content */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>

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
