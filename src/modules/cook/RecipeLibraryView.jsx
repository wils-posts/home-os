import { useState, useMemo, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import TopBar from '../../shell/TopBar'
import { useCookData } from './hooks/useCookData'

const SCROLL_KEY = 'recipeLibraryScroll'

export default function RecipeLibraryView() {
  const navigate = useNavigate()
  const { recipes, loading } = useCookData()
  const [search, setSearch] = useState('')
  const [activeTag, setActiveTag] = useState(null)
  const listRef = useRef(null)
  const restoredRef = useRef(false)

  // Restore scroll position once recipes have loaded and list is rendered
  useEffect(() => {
    if (loading || restoredRef.current || !listRef.current) return
    const saved = sessionStorage.getItem(SCROLL_KEY)
    if (saved) {
      listRef.current.scrollTop = parseInt(saved, 10)
      sessionStorage.removeItem(SCROLL_KEY)
    }
    restoredRef.current = true
  }, [loading, recipes])

  // Save scroll position before navigating to a recipe
  function handleRecipeClick(id) {
    if (listRef.current) {
      sessionStorage.setItem(SCROLL_KEY, listRef.current.scrollTop)
    }
    navigate('/cook/recipes/' + id)
  }

  // Derive unique tags from all recipes
  const allTags = useMemo(() => {
    const tagSet = new Set()
    recipes.forEach(r => (r.tags ?? []).forEach(t => tagSet.add(t)))
    return [...tagSet].sort((a, b) => a.localeCompare(b))
  }, [recipes])

  // Filter recipes by search and active tag
  const filtered = useMemo(() => {
    let result = recipes
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter(r => r.title.toLowerCase().includes(q))
    }
    if (activeTag) {
      result = result.filter(r => (r.tags ?? []).includes(activeTag))
    }
    return result
  }, [recipes, search, activeTag])

  const newButton = (
    <button
      onClick={() => navigate('/cook/recipes/new')}
      aria-label="New recipe"
      className="h-9 w-9 rounded-lg border border-[var(--border-subtle)] text-[var(--text-muted)] flex items-center justify-center active:scale-95 transition-transform"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    </button>
  )

  return (
    <div
      className="flex flex-col bg-[var(--surface-0)] text-[var(--text-primary)] max-w-md mx-auto"
      style={{ height: '100dvh' }}
    >
      <TopBar
        centre={null}
        right={newButton}
      />

      {/* Search bar */}
      <div className="px-4 pt-3 pb-2 shrink-0">
        <div className="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16" height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search recipes…"
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-1)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring-focus)]"
          />
        </div>
      </div>

      {/* Tag filter chips */}
      {allTags.length > 0 && (
        <div className="shrink-0 overflow-x-auto flex gap-2 px-4 pb-3 scrollbar-hide">
          <button
            onClick={() => setActiveTag(null)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeTag === null
                ? 'bg-[var(--action-surface)] text-[var(--text-heading)]'
                : 'border border-[var(--border-subtle)] text-[var(--text-muted)]'
            }`}
          >
            All
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag === activeTag ? null : tag)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeTag === tag
                  ? 'bg-[var(--action-surface)] text-[var(--text-heading)]'
                  : 'border border-[var(--border-subtle)] text-[var(--text-muted)]'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Recipe list */}
      <main ref={listRef} className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center pt-16">
            <div className="w-8 h-8 border-4 border-[var(--spinner-track)] border-t-[var(--spinner-head)] rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="px-5 pt-12 text-center text-sm text-[var(--text-muted)] italic">
            {search || activeTag ? 'No recipes match your search.' : 'No recipes yet. Tap + to add one.'}
          </p>
        ) : (
          <div className="flex flex-col gap-2 px-4 pt-2 pb-6">
            {filtered.map(recipe => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onClick={() => handleRecipeClick(recipe.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function RecipeCard({ recipe, onClick }) {
  const tags = recipe.tags ?? []
  const shown = tags.slice(0, 3)
  const extra = tags.length - shown.length

  return (
    <button
      onClick={onClick}
      className="w-full text-left px-5 py-4 bg-[var(--surface-1)] rounded-2xl border border-[var(--border-subtle)] active:scale-95 transition-transform"
    >
      <p className="font-semibold text-[var(--text-heading)] leading-snug">{recipe.title}</p>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {shown.map(tag => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[var(--surface-2)] text-[var(--text-muted)]"
            >
              {tag}
            </span>
          ))}
          {extra > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[var(--surface-2)] text-[var(--text-muted)]">
              +{extra} more
            </span>
          )}
        </div>
      )}
    </button>
  )
}
