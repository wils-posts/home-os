import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import TopBar from '../../shell/TopBar'
import { useCookData } from './hooks/useCookData'

export default function RecipeEditView() {
  const { id } = useParams()        // undefined for /cook/recipes/new
  const isNew = !id
  const navigate = useNavigate()
  const { recipes, loading, addRecipe, updateRecipe } = useCookData()

  // Form state
  const [title, setTitle] = useState('')
  const [tags, setTags] = useState([])
  const [tagInput, setTagInput] = useState('')
  const [ingredients, setIngredients] = useState([{ qtyText: '', name: '', note: '' }])
  const [steps, setSteps] = useState([''])
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [initialised, setInitialised] = useState(false)

  const tagInputRef = useRef(null)

  // Pre-fill form when editing an existing recipe
  useEffect(() => {
    if (initialised) return
    if (isNew) {
      setInitialised(true)
      return
    }
    if (loading) return
    const recipe = recipes.find(r => r.id === id)
    if (!recipe) return
    setTitle(recipe.title ?? '')
    setTags(recipe.tags ?? [])
    setIngredients(
      (recipe.ingredients ?? []).length > 0
        ? recipe.ingredients.map(i => ({ qtyText: i.qtyText ?? '', name: i.name ?? '', note: i.note ?? '' }))
        : [{ qtyText: '', name: '', note: '' }]
    )
    setSteps(
      (recipe.steps ?? []).length > 0
        ? recipe.steps
        : ['']
    )
    setNotes(recipe.notes ?? '')
    setInitialised(true)
  }, [id, isNew, loading, recipes, initialised])

  // ── Tag helpers ──────────────────────────────────────
  function commitTag() {
    const trimmed = tagInput.trim().toLowerCase()
    if (trimmed && !tags.includes(trimmed)) {
      setTags(t => [...t, trimmed])
    }
    setTagInput('')
  }

  function handleTagKeyDown(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      commitTag()
    } else if (e.key === 'Backspace' && tagInput === '' && tags.length > 0) {
      setTags(t => t.slice(0, -1))
    }
  }

  function removeTag(tag) {
    setTags(t => t.filter(x => x !== tag))
  }

  // ── Ingredient helpers ───────────────────────────────
  function updateIngredient(idx, field, value) {
    setIngredients(prev => prev.map((ing, i) => i === idx ? { ...ing, [field]: value } : ing))
  }

  function addIngredient() {
    setIngredients(prev => [...prev, { qtyText: '', name: '', note: '' }])
  }

  function removeIngredient(idx) {
    setIngredients(prev => prev.filter((_, i) => i !== idx))
  }

  // ── Step helpers ─────────────────────────────────────
  function updateStep(idx, value) {
    setSteps(prev => prev.map((s, i) => i === idx ? value : s))
  }

  function addStep() {
    setSteps(prev => [...prev, ''])
  }

  function removeStep(idx) {
    setSteps(prev => prev.filter((_, i) => i !== idx))
  }

  // ── Save ─────────────────────────────────────────────
  async function handleSave() {
    setError('')
    const trimmedTitle = title.trim()
    if (!trimmedTitle) { setError('Title is required.'); return }

    const cleanIngredients = ingredients.filter(i => i.name.trim())
    if (cleanIngredients.length === 0) { setError('Add at least one ingredient.'); return }

    const cleanSteps = steps.filter(s => s.trim())
    if (cleanSteps.length === 0) { setError('Add at least one step.'); return }

    const payload = {
      title: trimmedTitle,
      tags,
      ingredients: cleanIngredients.map(i => ({
        qtyText: i.qtyText.trim(),
        name: i.name.trim(),
        note: i.note.trim() || null,
      })),
      steps: cleanSteps.map(s => s.trim()),
      notes: notes.trim() || null,
    }

    setSaving(true)
    if (isNew) {
      const inserted = await addRecipe(payload)
      if (inserted) {
        navigate('/cook/recipes/' + inserted.id)
      } else {
        setError('Failed to save. Please try again.')
        setSaving(false)
      }
    } else {
      await updateRecipe(id, payload)
      navigate('/cook/recipes/' + id)
    }
  }

  const saveButton = (
    <button
      onClick={handleSave}
      disabled={saving}
      className="h-9 px-4 rounded-lg bg-[var(--action-surface)] text-[var(--text-heading)] text-sm font-semibold active:scale-95 transition-transform disabled:opacity-60"
    >
      {saving ? 'Saving…' : 'Save'}
    </button>
  )

  if (!isNew && (loading || !initialised)) {
    return (
      <div className="flex flex-col bg-[var(--surface-0)] max-w-md mx-auto" style={{ height: '100dvh' }}>
        <TopBar centre={<span className="text-sm font-semibold text-[var(--text-heading)]">Edit Recipe</span>} />
        <div className="flex justify-center pt-16">
          <div className="w-8 h-8 border-4 border-[var(--spinner-track)] border-t-[var(--spinner-head)] rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div
      className="flex flex-col bg-[var(--surface-0)] text-[var(--text-primary)] max-w-md mx-auto"
      style={{ height: '100dvh' }}
    >
      <TopBar
        centre={
          <span className="text-sm font-semibold text-[var(--text-heading)]">
            {isNew ? 'New Recipe' : 'Edit Recipe'}
          </span>
        }
        right={saveButton}
      />

      <div className="flex-1 overflow-y-auto pb-8">
        {/* Error banner */}
        {error && (
          <div className="mx-4 mt-3 px-4 py-2 rounded-xl bg-need/10 text-need text-sm">
            {error}
          </div>
        )}

        {/* ── Title ─────────────────────────────────── */}
        <div className="px-4 pt-5 pb-3">
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Recipe title"
            className="w-full text-xl font-bold bg-transparent text-[var(--text-heading)] placeholder:text-[var(--text-muted)] placeholder:font-normal focus:outline-none border-b border-[var(--border-subtle)] pb-2"
          />
        </div>

        {/* ── Tags ──────────────────────────────────── */}
        <SectionHeader>Tags</SectionHeader>
        <div className="px-4 pb-4">
          <div className="flex flex-wrap gap-2 items-center min-h-[36px] px-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-1)]">
            {tags.map(tag => (
              <span
                key={tag}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--surface-2)] text-[var(--text-primary)]"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)] leading-none"
                  aria-label={`Remove tag ${tag}`}
                >
                  ×
                </button>
              </span>
            ))}
            <input
              ref={tagInputRef}
              type="text"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              onBlur={commitTag}
              placeholder={tags.length === 0 ? 'Add tag, press Enter…' : ''}
              className="flex-1 min-w-[100px] bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none"
            />
          </div>
        </div>

        {/* ── Ingredients ───────────────────────────── */}
        <SectionHeader>Ingredients</SectionHeader>
        <div className="px-4 flex flex-col gap-2 pb-2">
          {ingredients.map((ing, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="text"
                value={ing.qtyText}
                onChange={e => updateIngredient(idx, 'qtyText', e.target.value)}
                placeholder="Qty"
                className="w-16 h-9 px-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-1)] text-[var(--text-primary)] text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--ring-focus)]"
              />
              <input
                type="text"
                value={ing.name}
                onChange={e => updateIngredient(idx, 'name', e.target.value)}
                placeholder="Ingredient"
                className="flex-1 h-9 px-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-1)] text-[var(--text-primary)] text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--ring-focus)]"
              />
              <input
                type="text"
                value={ing.note}
                onChange={e => updateIngredient(idx, 'note', e.target.value)}
                placeholder="Note"
                className="flex-1 h-9 px-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-1)] text-[var(--text-primary)] text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--ring-focus)]"
              />
              {ingredients.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeIngredient(idx)}
                  aria-label="Remove ingredient"
                  className="shrink-0 w-8 h-8 flex items-center justify-center text-[var(--text-muted)] hover:text-need transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addIngredient}
            className="mt-1 flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors self-start"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add ingredient
          </button>
        </div>

        {/* ── Method ────────────────────────────────── */}
        <SectionHeader>Method</SectionHeader>
        <div className="px-4 flex flex-col gap-2 pb-2">
          {steps.map((step, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="shrink-0 w-6 pt-2 text-sm font-bold text-[var(--text-muted)] tabular-nums text-right">
                {idx + 1}
              </span>
              <textarea
                value={step}
                onChange={e => updateStep(idx, e.target.value)}
                placeholder={`Step ${idx + 1}…`}
                rows={2}
                className="flex-1 px-2 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-1)] text-[var(--text-primary)] text-sm placeholder:text-[var(--text-muted)] resize-none focus:outline-none focus:ring-1 focus:ring-[var(--ring-focus)] leading-relaxed"
              />
              {steps.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeStep(idx)}
                  aria-label="Remove step"
                  className="shrink-0 w-8 h-8 flex items-center justify-center text-[var(--text-muted)] hover:text-need transition-colors mt-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addStep}
            className="mt-1 flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors self-start"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add step
          </button>
        </div>

        {/* ── Notes ─────────────────────────────────── */}
        <SectionHeader>Notes</SectionHeader>
        <div className="px-4 pb-6">
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Optional notes, tips, variations…"
            rows={4}
            className="w-full px-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-1)] text-[var(--text-primary)] text-sm placeholder:text-[var(--text-muted)] resize-none focus:outline-none focus:ring-1 focus:ring-[var(--ring-focus)] leading-relaxed"
          />
        </div>
      </div>
    </div>
  )
}

function SectionHeader({ children }) {
  return (
    <p className="px-4 pt-4 pb-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
      {children}
    </p>
  )
}
