import { useNavigate } from 'react-router-dom'
import { useBulkCookData } from '../hooks/useBulkCookData'
import StageShell from './StageShell'

export default function PrepStage() {
  const navigate = useNavigate()
  const {
    cycle, selectedRecipes, loading,
    setStage, startNewCycle,
    setPrepNotes,
  } = useBulkCookData()

  async function handleStartNew() {
    const newCycle = await startNewCycle()
    if (newCycle) navigate('/cook/bulk/plan')
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
      currentStage="prep"
      setStage={setStage}
      onStartNew={handleStartNew}
    >
      {/* Selected recipes */}
      <div className="px-4 pt-4 pb-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-3">
          This Cook — {selectedRecipes.length} {selectedRecipes.length === 1 ? 'Recipe' : 'Recipes'}
        </p>

        {selectedRecipes.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] italic py-4 text-center">
            No recipes selected — go back to Plan to add some.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {selectedRecipes.map(recipe => (
              <div
                key={recipe.id}
                className="flex items-center justify-between px-4 py-3 bg-[var(--surface-1)] rounded-2xl border border-[var(--border-subtle)]"
              >
                <span className="text-sm font-medium text-[var(--text-heading)] flex-1 min-w-0 mr-2 leading-snug">
                  {recipe.title}
                </span>
                <button
                  onClick={() => navigate('/cook/recipes/' + recipe.id)}
                  aria-label="View recipe"
                  className="shrink-0 h-8 w-8 flex items-center justify-center text-[var(--text-muted)] active:text-[var(--text-heading)] transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Prep notes */}
      <div className="px-4 pt-5 pb-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-3">
          Prep Notes
        </p>
        <textarea
          defaultValue={cycle.prep_notes ?? ''}
          onBlur={e => setPrepNotes(e.target.value)}
          placeholder="Defrost, chop, marinate — anything to prep before cooking…"
          rows={5}
          className="w-full px-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-1)] text-[var(--text-primary)] text-sm placeholder:text-[var(--text-muted)] resize-none focus:outline-none focus:ring-1 focus:ring-[var(--ring-focus)] leading-relaxed"
        />
      </div>
    </StageShell>
  )
}
