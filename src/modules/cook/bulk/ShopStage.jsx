import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBulkCookData } from '../hooks/useBulkCookData'
import StageShell from './StageShell'

export default function ShopStage() {
  const navigate = useNavigate()
  const {
    cycle, selectedRecipes, shopItems, loading,
    setStage, startNewCycle,
    generateShopList, toggleShopItem, updateShopItem, addShopItem, deleteShopItem,
  } = useBulkCookData()

  const [regenerateConfirm, setRegenerateConfirm] = useState(false)
  const [generatingList, setGeneratingList] = useState(false)
  // Track which item is being edited inline
  const [editingId, setEditingId] = useState(null)
  const generatedRef = useRef(false)

  // Auto-generate on first enter if list is empty
  useEffect(() => {
    if (loading || generatedRef.current || !cycle) return
    generatedRef.current = true
    if (shopItems.length === 0 && selectedRecipes.length > 0) {
      setGeneratingList(true)
      generateShopList(selectedRecipes).finally(() => setGeneratingList(false))
    }
  }, [loading, cycle, shopItems.length, selectedRecipes]) // eslint-disable-line

  async function handleRegenerate() {
    setRegenerateConfirm(false)
    setGeneratingList(true)
    await generateShopList(selectedRecipes)
    setGeneratingList(false)
  }

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

  // Show unchecked first, then checked
  const sorted = [...shopItems].sort((a, b) => {
    if (a.checked !== b.checked) return a.checked ? 1 : -1
    return a.sort_order - b.sort_order
  })

  return (
    <StageShell
      currentStage="shop"
      setStage={setStage}
      onStartNew={handleStartNew}
    >
      {/* Header row */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
          Shopping List
          {shopItems.length > 0 && (
            <span className="ml-2 font-normal normal-case tracking-normal">
              — {shopItems.filter(i => i.checked).length}/{shopItems.length} got
            </span>
          )}
        </p>

        {regenerateConfirm ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--text-muted)]">Overwrite edits?</span>
            <button
              onClick={() => setRegenerateConfirm(false)}
              className="text-xs px-2 py-1 rounded border border-[var(--border-subtle)] text-[var(--text-muted)]"
            >
              Cancel
            </button>
            <button
              onClick={handleRegenerate}
              className="text-xs px-2 py-1 rounded bg-need text-white font-semibold"
            >
              Yes
            </button>
          </div>
        ) : (
          <button
            onClick={() => setRegenerateConfirm(true)}
            className="text-xs px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] text-[var(--text-muted)] active:scale-95 transition-transform"
          >
            Regenerate
          </button>
        )}
      </div>

      {/* List body */}
      {generatingList ? (
        <div className="flex justify-center py-10">
          <div className="w-6 h-6 border-4 border-[var(--spinner-track)] border-t-[var(--spinner-head)] rounded-full animate-spin" />
        </div>
      ) : shopItems.length === 0 ? (
        <div className="px-4 py-8 text-center">
          {selectedRecipes.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)] italic">No recipes selected yet — go back to Plan to add some.</p>
          ) : (
            <p className="text-sm text-[var(--text-muted)] italic">No items yet. Tap Regenerate to build list from selected recipes.</p>
          )}
        </div>
      ) : (
        <div className="border-t border-[var(--border-subtle)] mx-0">
          {sorted.map(item => (
            <ShopItemRow
              key={item.id}
              item={item}
              editing={editingId === item.id}
              onToggle={() => toggleShopItem(item.id)}
              onEdit={() => setEditingId(item.id)}
              onBlur={() => setEditingId(null)}
              onUpdate={(changes) => updateShopItem(item.id, changes)}
              onDelete={() => deleteShopItem(item.id)}
            />
          ))}
        </div>
      )}

      {/* Add item */}
      <div className="px-4 pt-3 pb-2">
        <button
          onClick={async () => {
            await addShopItem()
            // The new item will appear; we could set editingId but we don't have it yet
          }}
          className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add item
        </button>
      </div>
    </StageShell>
  )
}

function ShopItemRow({ item, editing, onToggle, onEdit, onBlur, onUpdate, onDelete }) {
  const nameRef = useRef(null)
  const qtyRef = useRef(null)

  useEffect(() => {
    if (editing && nameRef.current) nameRef.current.focus()
  }, [editing])

  return (
    <div className={`flex items-center gap-3 px-4 py-3 border-b border-[var(--border-subtle)] ${item.checked ? 'opacity-50' : ''}`}>
      {/* Checkbox */}
      <button
        onClick={onToggle}
        className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
          item.checked ? 'border-ok bg-ok' : 'border-[var(--border-subtle)]'
        }`}
      >
        {item.checked && (
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </button>

      {/* Qty */}
      {editing ? (
        <input
          ref={qtyRef}
          defaultValue={item.qty_text}
          onBlur={e => onUpdate({ qty_text: e.target.value })}
          placeholder="qty"
          className="w-14 text-sm text-[var(--text-muted)] bg-transparent border-b border-[var(--border-subtle)] focus:outline-none tabular-nums text-right"
        />
      ) : (
        <span
          onClick={onEdit}
          className={`shrink-0 w-14 text-right text-sm tabular-nums text-[var(--text-muted)] ${item.checked ? 'line-through' : ''}`}
        >
          {item.qty_text || ''}
        </span>
      )}

      {/* Name */}
      {editing ? (
        <input
          ref={nameRef}
          defaultValue={item.name}
          onBlur={e => { onUpdate({ name: e.target.value }); onBlur() }}
          onKeyDown={e => { if (e.key === 'Enter') { onUpdate({ name: e.target.value }); onBlur() } }}
          className="flex-1 text-sm font-medium text-[var(--text-primary)] bg-transparent border-b border-[var(--border-subtle)] focus:outline-none"
        />
      ) : (
        <span
          onClick={onEdit}
          className={`flex-1 text-sm font-medium text-[var(--text-primary)] ${item.checked ? 'line-through' : ''}`}
        >
          {item.name || <span className="text-[var(--text-muted)] italic">tap to name</span>}
        </span>
      )}

      {/* Delete */}
      <button
        onClick={onDelete}
        aria-label="Remove item"
        className="shrink-0 w-7 h-7 flex items-center justify-center text-[var(--text-muted)] hover:text-need transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  )
}
