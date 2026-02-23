import { useRef, useState, useEffect } from 'react'
import StatePill from './StatePill'
import PinButton from './PinButton'
import StatePickerPopover from './StatePickerPopover'

export default function ItemRow({
  item, onCycleState, onTogglePin, onDelete, onUpdate,
  onMoveUp, onMoveDown, isFirst, isLast,
  pending, compact,
}) {
  const [swipeX, setSwipeX] = useState(0)
  const [swiping, setSwiping] = useState(false)
  const [pressing, setPressing] = useState(false)
  const [editing, setEditing] = useState(false)
  const [pickingState, setPickingState] = useState(false)
  const [editName, setEditName] = useState(item.name)
  const [editNote, setEditNote] = useState(item.note ?? '')
  const touchStartX = useRef(null)
  const touchStartY = useRef(null)
  const longPressTimer = useRef(null)
  const isScrolling = useRef(false)
  const lastActionAt = useRef(0)       // cooldown: ignore taps within 400ms of last action
  const nameInputRef = useRef(null)
  const DELETE_THRESHOLD = 72
  const LONGPRESS_MS = 650            // bumped from 500ms — harder to trigger accidentally
  const COOLDOWN_MS = 400

  function isOnCooldown() {
    return Date.now() - lastActionAt.current < COOLDOWN_MS
  }
  function markAction() {
    lastActionAt.current = Date.now()
  }

  // Auto-focus name input when entering edit mode
  useEffect(() => {
    if (editing && nameInputRef.current) {
      nameInputRef.current.focus()
    }
  }, [editing])

  // Keep edit state in sync if item updates externally
  useEffect(() => {
    if (!editing) {
      setEditName(item.name)
      setEditNote(item.note ?? '')
    }
  }, [item.name, item.note, editing])

  function cancelLongPress() {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
    setPressing(false)
  }

  function handleTouchStart(e) {
    // Don't start any row interaction while the state popover is open
    if (isOnCooldown() || pickingState) return
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    isScrolling.current = false
    setSwiping(true)
    setPressing(true)

    longPressTimer.current = setTimeout(() => {
      longPressTimer.current = null
      setPressing(false)
      markAction()
      setEditing(true)
    }, LONGPRESS_MS)
  }

  function handleTouchMove(e) {
    if (touchStartX.current === null || editing) return
    if (isScrolling.current) return

    const deltaX = e.touches[0].clientX - touchStartX.current
    const deltaY = e.touches[0].clientY - touchStartY.current

    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      isScrolling.current = true
      cancelLongPress()
      setSwipeX(0)
      return
    }

    // Cancel long-press once clearly swiping
    if (Math.abs(deltaX) > 10) cancelLongPress()

    // Only start moving the row after a 20px dead zone — reduces accidental reveals
    const SWIPE_DEADZONE = 20
    if (Math.abs(deltaX) < SWIPE_DEADZONE) return
    const effectiveDelta = deltaX < 0
      ? deltaX + SWIPE_DEADZONE   // shift left swipe: starts from 0 after deadzone
      : deltaX - SWIPE_DEADZONE
    setSwipeX(Math.max(-DELETE_THRESHOLD, Math.min(0, effectiveDelta)))
  }

  function handleTouchEnd() {
    setSwiping(false)
    isScrolling.current = false
    cancelLongPress()

    // Snap to fully open only if past 75% — anything less springs back
    if (swipeX <= -(DELETE_THRESHOLD * 0.75)) {
      setSwipeX(-DELETE_THRESHOLD)
    } else {
      setSwipeX(0)
    }
    touchStartX.current = null
  }

  function handleDelete(e) {
    e.preventDefault()
    setSwipeX(0)
    markAction()
    onDelete(item.id)
  }

  function handleRowTap() {
    if (swipeX !== 0) setSwipeX(0)
  }

  function handleConfirmEdit(e) {
    e.preventDefault()
    const name = editName.trim()
    if (!name) return
    markAction()
    onUpdate(item.id, { name, note: editNote.trim() || null })
    setEditing(false)
  }

  function handleCancelEdit(e) {
    e.preventDefault()
    markAction()
    setEditName(item.name)
    setEditNote(item.note ?? '')
    setEditing(false)
  }

  function handlePillTap(e) {
    e.preventDefault()
    if (isOnCooldown() || swipeX !== 0) return
    markAction()
    setPickingState(p => !p)
  }

  function handlePinTap(e) {
    e.preventDefault()
    if (isOnCooldown() || swipeX !== 0) return
    markAction()
    onTogglePin(item.id)
  }

  function handleStateSelect(state) {
    markAction()
    setPickingState(false)
    if (state !== item.state) onCycleState(item.id, state)
  }

  function handleMoveUp(e) {
    e.preventDefault()
    if (isOnCooldown()) return
    markAction()
    onMoveUp()
  }

  function handleMoveDown(e) {
    e.preventDefault()
    if (isOnCooldown()) return
    markAction()
    onMoveDown()
  }

  const py = compact ? 'py-1' : 'py-2'
  const gap = compact ? 'gap-2' : 'gap-3'
  const nameSize = compact ? 'text-sm' : 'text-base'
  const noteSize = compact ? 'text-xs' : 'text-sm'
  const showReorder = onMoveUp !== undefined || onMoveDown !== undefined

  return (
    <div className="relative overflow-hidden border-b border-zinc-700 last:border-b-0">
      {/* Delete button revealed on swipe */}
      {!editing && (
        <div className="absolute right-0 top-0 bottom-0 w-[72px] flex items-center justify-center bg-need">
          <button
            onTouchEnd={handleDelete}
            onClick={handleDelete}
            className="w-full h-full flex items-center justify-center"
            aria-label="Delete item"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-5 h-5">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4h6v2" />
            </svg>
          </button>
        </div>
      )}

      {/* Row content */}
      <div
        className={`relative flex items-center ${gap} px-4 ${py} transition-colors duration-75 ${pressing ? 'bg-zinc-700' : 'bg-zinc-800'}`}
        style={{
          transform: editing ? 'none' : `translateX(${swipeX}px) scale(${pressing ? 0.985 : 1})`,
          transition: swiping ? 'none' : pressing ? `transform ${LONGPRESS_MS}ms ease-out` : 'transform 0.2s ease',
        }}
        onTouchStart={editing ? undefined : handleTouchStart}
        onTouchMove={editing ? undefined : handleTouchMove}
        onTouchEnd={editing ? undefined : handleTouchEnd}
        onClick={editing ? undefined : handleRowTap}
      >
        {editing ? (
          /* Edit mode */
          <>
            <div className="flex-1 min-w-0 flex flex-col gap-1 py-1">
              <input
                ref={nameInputRef}
                type="text"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleConfirmEdit(e); if (e.key === 'Escape') handleCancelEdit(e) }}
                className={`w-full px-2 py-1 rounded border border-zinc-600 bg-zinc-700 text-zinc-100 font-medium focus:outline-none focus:ring-2 focus:ring-zinc-400 ${nameSize}`}
                placeholder="Item name"
              />
              <input
                type="text"
                value={editNote}
                onChange={e => setEditNote(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleConfirmEdit(e); if (e.key === 'Escape') handleCancelEdit(e) }}
                className={`w-full px-2 py-1 rounded border border-zinc-600 bg-zinc-700 text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-300 ${noteSize}`}
                placeholder="Add a note…"
              />
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onTouchEnd={handleConfirmEdit}
                onClick={handleConfirmEdit}
                className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg bg-ok text-white active:scale-95 transition-transform"
                aria-label="Confirm edit"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </button>
              <button
                onTouchEnd={handleCancelEdit}
                onClick={handleCancelEdit}
                className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg border border-zinc-600 text-zinc-400 active:scale-95 transition-transform"
                aria-label="Cancel edit"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </>
        ) : (
          /* Normal display mode */
          <>
            <div className="flex flex-col items-start shrink-0">
              <StatePill
                state={item.state}
                onTouchEnd={handlePillTap}
                onClick={handlePillTap}
                disabled={pending}
                compact={compact}
              />
              {pickingState && (
                <StatePickerPopover
                  current={item.state}
                  onSelect={handleStateSelect}
                  onClose={() => { markAction(); setPickingState(false) }}
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-medium text-zinc-100 truncate ${nameSize}`}>{item.name}</p>
              {item.note && (
                <p className={`text-zinc-400 truncate ${noteSize}`}>{item.note}</p>
              )}
            </div>

            {/* Reorder arrows for pinned items */}
            {showReorder && (
              <div className="flex flex-col gap-0.5 shrink-0">
                <button
                  onTouchEnd={onMoveUp ? handleMoveUp : undefined}
                  onClick={onMoveUp ? handleMoveUp : undefined}
                  disabled={isFirst}
                  className="min-w-[28px] min-h-[22px] flex items-center justify-center text-zinc-500 disabled:opacity-25 active:scale-95 transition-transform"
                  aria-label="Move up"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
                    <polyline points="18 15 12 9 6 15" />
                  </svg>
                </button>
                <button
                  onTouchEnd={onMoveDown ? handleMoveDown : undefined}
                  onClick={onMoveDown ? handleMoveDown : undefined}
                  disabled={isLast}
                  className="min-w-[28px] min-h-[22px] flex items-center justify-center text-zinc-500 disabled:opacity-25 active:scale-95 transition-transform"
                  aria-label="Move down"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
              </div>
            )}

            <PinButton
              pinned={item.pinned}
              onTouchEnd={handlePinTap}
              onClick={handlePinTap}
            />
          </>
        )}
      </div>
    </div>
  )
}
