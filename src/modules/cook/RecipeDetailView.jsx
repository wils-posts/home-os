import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import TopBar from '../../shell/TopBar'
import { useCookData } from './hooks/useCookData'

export default function RecipeDetailView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { recipes, loading, deleteRecipe } = useCookData()

  const recipe = recipes.find(r => r.id === id) ?? null

  const [checkedIds, setCheckedIds] = useState(new Set())
  const [notesOpen, setNotesOpen] = useState(false)
  const [kebabOpen, setKebabOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const kebabRef = useRef(null)

  // Close kebab on outside click
  useEffect(() => {
    if (!kebabOpen) return
    function handler(e) {
      if (kebabRef.current && !kebabRef.current.contains(e.target)) {
        setKebabOpen(false)
        setConfirmDelete(false)
      }
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('touchstart', handler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('touchstart', handler)
    }
  }, [kebabOpen])

  function toggleChecked(idx) {
    setCheckedIds(prev => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  async function handleDelete() {
    setDeleting(true)
    await deleteRecipe(id)
    navigate('/cook/recipes')
  }

  const kebabButton = (
    <div className="relative" ref={kebabRef}>
      <button
        onClick={() => { setKebabOpen(o => !o); setConfirmDelete(false) }}
        aria-label="Recipe options"
        className="h-9 w-9 rounded-lg border border-[var(--border-subtle)] text-[var(--text-muted)] flex items-center justify-center active:scale-95 transition-transform"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none">
          <circle cx="12" cy="5" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="12" cy="19" r="1.5" />
        </svg>
      </button>

      {kebabOpen && (
        <div className="absolute right-0 top-11 z-50 w-44 bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-xl shadow-lg overflow-hidden">
          {confirmDelete ? (
            <div className="px-4 py-3 flex flex-col gap-2">
              <p className="text-xs text-[var(--text-muted)]">Delete this recipe?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => { setConfirmDelete(false) }}
                  className="flex-1 h-8 rounded-lg border border-[var(--border-subtle)] text-[var(--text-muted)] text-xs active:scale-95 transition-transform"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 h-8 rounded-lg bg-need text-white text-xs font-semibold active:scale-95 transition-transform disabled:opacity-60"
                >
                  {deleting ? '…' : 'Delete'}
                </button>
              </div>
            </div>
          ) : (
            <>
              <button
                onClick={() => { setKebabOpen(false); navigate('/cook/recipes/' + id + '/edit') }}
                className="w-full px-4 py-3 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--surface-2)] active:bg-[var(--surface-2)] transition-colors"
              >
                Edit
              </button>
              <div className="h-px bg-[var(--border-subtle)]" />
              <button
                onClick={() => setConfirmDelete(true)}
                className="w-full px-4 py-3 text-left text-sm text-need transition-colors hover:bg-[var(--surface-2)] active:bg-[var(--surface-2)]"
              >
                Delete
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )

  if (loading) {
    return (
      <div className="flex flex-col bg-[var(--surface-0)] max-w-md mx-auto" style={{ height: '100dvh' }}>
        <TopBar centre={<span className="text-sm font-semibold text-[var(--text-heading)]">Recipe</span>} />
        <div className="flex justify-center pt-16">
          <div className="w-8 h-8 border-4 border-[var(--spinner-track)] border-t-[var(--spinner-head)] rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="flex flex-col bg-[var(--surface-0)] max-w-md mx-auto" style={{ height: '100dvh' }}>
        <TopBar centre={<span className="text-sm font-semibold text-[var(--text-heading)]">Recipe</span>} />
        <div className="px-5 pt-12 text-center">
          <p className="text-[var(--text-muted)] text-sm">Recipe not found.</p>
          <button
            onClick={() => navigate('/cook/recipes')}
            className="mt-4 text-sm text-[var(--action-surface)] underline"
          >
            Back to library
          </button>
        </div>
      </div>
    )
  }

  const ingredients = recipe.ingredients ?? []
  const steps = recipe.steps ?? []
  const tags = recipe.tags ?? []

  return (
    <div
      className="flex flex-col bg-[var(--surface-0)] text-[var(--text-primary)] max-w-md mx-auto"
      style={{ height: '100dvh' }}
    >
      <TopBar
        centre={
          <span className="text-sm font-semibold text-[var(--text-heading)] truncate max-w-[180px] block">
            {recipe.title}
          </span>
        }
        right={kebabButton}
      />

      <div className="flex-1 overflow-y-auto pb-8">
        {/* Title */}
        <h1 className="text-2xl font-bold text-[var(--text-heading)] px-5 pt-5 pb-2 leading-tight">
          {recipe.title}
        </h1>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 px-5 pb-4">
            {tags.map(tag => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full text-xs font-medium bg-[var(--surface-2)] text-[var(--text-muted)]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Ingredients */}
        {ingredients.length > 0 && (
          <section className="mt-1">
            <p className="px-5 py-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
              Ingredients
            </p>
            <div className="border-t border-[var(--border-subtle)]">
              {ingredients.map((ing, idx) => {
                const checked = checkedIds.has(idx)
                return (
                  <button
                    key={idx}
                    onClick={() => toggleChecked(idx)}
                    className="w-full text-left flex items-start gap-3 px-4 py-3 border-b border-[var(--border-subtle)] active:bg-[var(--surface-1)] transition-colors"
                  >
                    {/* Checkbox */}
                    <span
                      className={`shrink-0 mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        checked
                          ? 'border-[var(--action-surface)] bg-[var(--action-surface)]'
                          : 'border-[var(--border-subtle)]'
                      }`}
                    >
                      {checked && (
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </span>

                    {/* Qty */}
                    {ing.qtyText ? (
                      <span className={`shrink-0 w-16 text-right text-sm tabular-nums transition-colors ${checked ? 'text-[var(--text-muted)] line-through' : 'text-[var(--text-muted)]'}`}>
                        {ing.qtyText}
                      </span>
                    ) : (
                      <span className="shrink-0 w-16" />
                    )}

                    {/* Name + note */}
                    <div className="flex-1 min-w-0">
                      <span className={`text-sm font-medium block leading-snug transition-colors ${checked ? 'text-[var(--text-muted)] line-through' : 'text-[var(--text-primary)]'}`}>
                        {ing.name}
                      </span>
                      {ing.note && (
                        <span className="text-xs text-[var(--text-muted)] mt-0.5 block">{ing.note}</span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </section>
        )}

        {/* Method */}
        {steps.length > 0 && (
          <section className="mt-4">
            <p className="px-5 py-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
              Method
            </p>
            <div className="px-5 flex flex-col gap-5 pt-1 pb-2">
              {steps.map((step, idx) => (
                <div key={idx} className="flex gap-4 items-start">
                  <span className="shrink-0 w-5 text-sm font-bold text-[var(--text-muted)] pt-0.5 tabular-nums">
                    {idx + 1}
                  </span>
                  <p className="flex-1 text-base leading-relaxed text-[var(--text-primary)]">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Notes — collapsible */}
        {recipe.notes && (
          <section className="mt-4 border-t border-[var(--border-subtle)]">
            <button
              onClick={() => setNotesOpen(o => !o)}
              className="w-full flex items-center justify-between px-5 py-3 text-left"
            >
              <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
                Notes
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16" height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`text-[var(--text-muted)] transition-transform ${notesOpen ? 'rotate-180' : ''}`}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {notesOpen && (
              <p className="px-5 pb-5 text-sm text-[var(--text-muted)] leading-relaxed whitespace-pre-wrap">
                {recipe.notes}
              </p>
            )}
          </section>
        )}
      </div>
    </div>
  )
}
