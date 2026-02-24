import { useNavigate } from 'react-router-dom'
import { useBulkCookData } from '../hooks/useBulkCookData'
import { useCookData } from '../hooks/useCookData'
import StageShell from './StageShell'

export default function PlanStage() {
  const navigate = useNavigate()
  const {
    cycle, selectedRecipes, loading,
    setStage, startNewCycle,
    addRecipeToCycle, removeRecipeFromCycle,
    setPlanNotes,
  } = useBulkCookData()

  const { recipes: allRecipes, loading: recipesLoading } = useCookData()

  // Only show bulk-tagged recipes
  const bulkRecipes = allRecipes.filter(r => (r.tags ?? []).includes('bulk'))
  const selectedIds = new Set(selectedRecipes.map(r => r.id))

  async function handleStartNew() {
    const newCycle = await startNewCycle()
    if (newCycle) navigate('/cook/bulk/plan')
  }

  function toggleRecipe(recipeId) {
    if (selectedIds.has(recipeId)) {
      removeRecipeFromCycle(recipeId)
    } else {
      addRecipeToCycle(recipeId)
    }
  }

  if (loading || !cycle) {
    return (
      <div className="flex flex-col bg-[var(--surface-0)] max-w-md mx-auto items-center justify-center" style={{ height: '100dvh' }}>
        <div className="w-8 h-8 border-4 border-[var(--spinner-track)] border-t-[var(--spinner-head)] rounded-full animate-spin" />
      </div>
    )
  }

  const planNotesSlot = (
    <textarea
      defaultValue={cycle.plan_notes ?? ''}
      onBlur={e => setPlanNotes(e.target.value)}
      placeholder="Plan notes…"
      rows={3}
      className="w-full px-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-1)] text-[var(--text-primary)] text-sm placeholder:text-[var(--text-muted)] resize-none focus:outline-none focus:ring-1 focus:ring-[var(--ring-focus)] leading-relaxed"
    />
  )

  return (
    <StageShell
      currentStage="plan"
      setStage={setStage}
      onStartNew={handleStartNew}
      bottomSlot={planNotesSlot}
    >
      {/* Recipe selection — fills available space and scrolls internally */}
      <div className="flex flex-col h-full px-4 pt-4 pb-2">
        <p className="shrink-0 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-3">
          Select Recipes
          {bulkRecipes.length > 0 && (
            <span className="ml-2 font-normal normal-case tracking-normal">
              — {selectedIds.size} of {bulkRecipes.length} selected
            </span>
          )}
        </p>

        <div className="flex-1 overflow-y-auto min-h-0 -mx-1 px-1">
          {recipesLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-4 border-[var(--spinner-track)] border-t-[var(--spinner-head)] rounded-full animate-spin" />
            </div>
          ) : bulkRecipes.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-[var(--text-muted)] italic">No recipes tagged "bulk" yet.</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">Add the "bulk" tag to recipes in the Recipe Library.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2 pb-2">
              {bulkRecipes.map(recipe => {
                const selected = selectedIds.has(recipe.id)
                return (
                  <div
                    key={recipe.id}
                    className={`flex items-center rounded-2xl border ${
                      selected
                        ? 'bg-[var(--action-surface)] border-[var(--action-surface)]'
                        : 'bg-[var(--surface-1)] border-[var(--border-subtle)]'
                    }`}
                  >
                    {/* Toggle area */}
                    <button
                      onClick={() => toggleRecipe(recipe.id)}
                      className="flex-1 text-left px-4 py-4 active:scale-95 transition-transform"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          selected ? 'border-[var(--text-heading)] bg-[var(--text-heading)]' : 'border-[var(--border-subtle)]'
                        }`}>
                          {selected && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--surface-0)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold leading-snug text-sm text-[var(--text-heading)]">
                            {recipe.title}
                          </p>
                          {(recipe.tags ?? []).filter(t => t !== 'bulk').length > 0 && (
                            <p className="text-xs text-[var(--text-muted)] mt-0.5">
                              {recipe.tags.filter(t => t !== 'bulk').join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>

                    {/* View recipe */}
                    <button
                      onClick={() => navigate('/cook/recipes/' + recipe.id)}
                      aria-label="View recipe"
                      className="shrink-0 h-full px-3 flex items-center text-[var(--text-muted)] active:text-[var(--text-heading)] transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </StageShell>
  )
}
