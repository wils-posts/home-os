import { useState, useRef, useEffect } from 'react'
import CompletePicker from './CompletePicker'

function formatDueDay(due_day) {
  if (!due_day) return null
  const [year, month, day] = due_day.split('-').map(Number)
  const dd = String(day).padStart(2, '0')
  const mm = String(month).padStart(2, '0')
  return `${dd}/${mm}/${year}`
}

export default function TaskRow({ task, onComplete, onUpdate, onDelete }) {
  const [swipeX, setSwipeX] = useState(0)
  const [swiping, setSwiping] = useState(false)
  const [pressing, setPressing] = useState(false)
  const [editing, setEditing] = useState(false)
  const [pickingComplete, setPickingComplete] = useState(false)

  const [editTitle, setEditTitle] = useState(task.title)
  const [editDueDay, setEditDueDay] = useState(task.due_day || '')
  const [editPriority, setEditPriority] = useState(task.is_priority)

  const touchStartX = useRef(null)
  const touchStartY = useRef(null)
  const longPressTimer = useRef(null)
  const isScrolling = useRef(false)
  const lastActionAt = useRef(0)
  const titleInputRef = useRef(null)

  const DELETE_THRESHOLD = 72
  const LONGPRESS_MS = 650
  const COOLDOWN_MS = 400

  function isOnCooldown() {
    return Date.now() - lastActionAt.current < COOLDOWN_MS
  }
  function markAction() {
    lastActionAt.current = Date.now()
  }

  useEffect(() => {
    if (editing && titleInputRef.current) titleInputRef.current.focus()
  }, [editing])

  useEffect(() => {
    if (!editing) {
      setEditTitle(task.title)
      setEditDueDay(task.due_day || '')
      setEditPriority(task.is_priority)
    }
  }, [task.title, task.due_day, task.is_priority, editing])

  function cancelLongPress() {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
    setPressing(false)
  }

  function handleTouchStart(e) {
    if (isOnCooldown() || pickingComplete) return
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

    if (Math.abs(deltaX) > 10) cancelLongPress()

    const SWIPE_DEADZONE = 20
    if (Math.abs(deltaX) < SWIPE_DEADZONE) return
    const effectiveDelta = deltaX < 0
      ? deltaX + SWIPE_DEADZONE
      : deltaX - SWIPE_DEADZONE
    setSwipeX(Math.max(-DELETE_THRESHOLD, Math.min(0, effectiveDelta)))
  }

  function handleTouchEnd() {
    setSwiping(false)
    isScrolling.current = false
    cancelLongPress()

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
    onDelete(task.id)
  }

  function handleRowTap() {
    if (swipeX !== 0) setSwipeX(0)
  }

  function handleConfirmEdit(e) {
    e.preventDefault()
    const trimmed = editTitle.trim()
    if (!trimmed) return
    markAction()
    onUpdate(task.id, {
      title: trimmed,
      due_day: editDueDay || null,
      is_priority: editPriority,
    })
    setEditing(false)
  }

  function handleCancelEdit(e) {
    e.preventDefault()
    markAction()
    setEditTitle(task.title)
    setEditDueDay(task.due_day || '')
    setEditPriority(task.is_priority)
    setEditing(false)
  }

  function handleCompleteBtn(e) {
    e.preventDefault()
    if (isOnCooldown() || swipeX !== 0) return
    markAction()
    setPickingComplete(true)
  }

  function handlePickComplete(value) {
    markAction()
    setPickingComplete(false)
    onComplete(task.id, value)
  }

  const formattedDue = formatDueDay(task.due_day)

  return (
    <div className="border-b border-[var(--border-subtle)] last:border-b-0">
      {/* Complete picker — shown inline above the row */}
      {pickingComplete && (
        <CompletePicker
          onSelect={handlePickComplete}
          onCancel={() => { markAction(); setPickingComplete(false) }}
        />
      )}

      <div className="relative overflow-hidden">
        {/* Delete zone revealed on swipe */}
        {!editing && (
          <div className="absolute right-0 top-0 bottom-0 w-[72px] flex items-center justify-center bg-need">
            <button
              onTouchEnd={handleDelete}
              onClick={handleDelete}
              className="w-full h-full flex items-center justify-center"
              aria-label="Delete task"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-5 h-5">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6M9 6V4h6v2" />
              </svg>
            </button>
          </div>
        )}

        {/* Row content */}
        <div
          className={`relative flex items-center gap-3 px-4 py-3 transition-colors duration-75 ${pressing ? 'bg-[var(--surface-2)]' : 'bg-[var(--surface-1)]'}`}
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
            <div className="flex-1 flex flex-col gap-2 py-1">
              <input
                ref={titleInputRef}
                type="text"
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleConfirmEdit(e); if (e.key === 'Escape') handleCancelEdit(e) }}
                className="w-full px-2 py-1 rounded border border-[var(--border-subtle)] bg-[var(--surface-2)] text-[var(--text-primary)] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--ring-focus)]"
                placeholder="Task title"
              />
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <label className="text-xs text-[var(--text-muted)] shrink-0">Due</label>
                  <input
                    type="date"
                    value={editDueDay}
                    onChange={e => setEditDueDay(e.target.value)}
                    className="flex-1 h-8 px-2 rounded border border-[var(--border-subtle)] bg-[var(--surface-2)] text-[var(--text-primary)] text-xs focus:outline-none focus:ring-1 focus:ring-[var(--ring-focus)]"
                  />
                </div>
                {/* Priority toggle in edit mode */}
                <button
                  type="button"
                  onClick={() => setEditPriority(p => !p)}
                  className={`flex items-center gap-1 text-xs px-2 py-1 rounded border transition-colors ${
                    editPriority
                      ? 'border-[var(--action-surface)] text-[var(--action-surface)]'
                      : 'border-[var(--border-subtle)] text-[var(--text-muted)]'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={editPriority ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                    <line x1="4" y1="22" x2="4" y2="15" />
                  </svg>
                  Priority
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onTouchEnd={handleConfirmEdit}
                  onClick={handleConfirmEdit}
                  className="flex-1 h-9 flex items-center justify-center rounded-lg bg-ok text-white text-sm font-medium active:scale-95 transition-transform"
                >
                  Save
                </button>
                <button
                  onTouchEnd={handleCancelEdit}
                  onClick={handleCancelEdit}
                  className="h-9 px-4 rounded-lg border border-[var(--border-subtle)] text-[var(--text-muted)] text-sm active:scale-95 transition-transform"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            /* Display mode */
            <>
              {/* Complete button */}
              <button
                onTouchEnd={handleCompleteBtn}
                onClick={handleCompleteBtn}
                aria-label="Mark complete"
                className="shrink-0 w-6 h-6 rounded-full border-2 border-[var(--border-subtle)] flex items-center justify-center active:scale-95 transition-transform"
              />

              {/* Title + due date inline */}
              <div className="flex-1 min-w-0 flex items-center gap-2">
                <p className="text-sm font-medium text-[var(--text-primary)] truncate">{task.title}</p>
                {formattedDue && (
                  <span className="text-xs text-[var(--text-muted)] shrink-0">Due: {formattedDue}</span>
                )}
              </div>

              {/* Priority flag — far right */}
              {task.is_priority && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0 text-need">
                  <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                  <line x1="4" y1="22" x2="4" y2="15" stroke="currentColor" />
                </svg>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
