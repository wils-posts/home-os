import { useState } from 'react'
import { supabase } from '../../../shared/supabaseClient'
import ColorPicker from './ColorPicker'

// Pill appearance per colour
const PILL_STYLES = {
  blue:  { bg: 'bg-blue-500',  label: 'C' },
  green: { bg: 'bg-green-500', label: 'S' },
  red:   { bg: 'bg-red-500',   label: 'A' },
}

export default function EntryRow({ entry, selectedDay, onDeleted, onUpdated, onToast }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(entry.text)
  const [editColor, setEditColor] = useState(entry.color)
  const [saving, setSaving] = useState(false)
  // null = no prompt shown, 'confirm' = showing delete options
  const [deleteState, setDeleteState] = useState(null)

  const pill = PILL_STYLES[entry.color] || { bg: 'bg-zinc-500', label: '?' }

  async function handleSave() {
    setSaving(true)
    const { error } = await supabase
      .from('planner_day_entries')
      .update({ text: editText, color: editColor, updated_at: new Date().toISOString() })
      .eq('id', entry.id)
    setSaving(false)
    if (error) {
      onToast({ message: "Couldn't save — please try again", type: 'error' })
    } else {
      setIsEditing(false)
      onUpdated()
    }
  }

  async function handleDeleteOne() {
    setDeleteState(null)
    const { error } = await supabase
      .from('planner_day_entries')
      .delete()
      .eq('id', entry.id)
    if (error) {
      onToast({ message: "Couldn't delete — please try again", type: 'error' })
    } else {
      onDeleted()
    }
  }

  async function handleDeleteFuture() {
    setDeleteState(null)
    // Delete this entry + all future entries in the same batch from selectedDay onwards
    if (entry.batch_id) {
      const { error } = await supabase
        .from('planner_day_entries')
        .delete()
        .eq('batch_id', entry.batch_id)
        .gte('day', selectedDay)
      if (error) {
        onToast({ message: "Couldn't delete — please try again", type: 'error' })
      } else {
        onDeleted()
      }
    } else {
      // No batch — just delete the one
      handleDeleteOne()
    }
  }

  function handleCancel() {
    setEditText(entry.text)
    setEditColor(entry.color)
    setIsEditing(false)
  }

  // Edit mode
  if (isEditing) {
    return (
      <div className="flex flex-col gap-2 bg-[var(--surface-1)] rounded-lg p-3 my-1">
        <input
          type="text"
          value={editText}
          onChange={e => setEditText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSave() }}
          autoFocus
          className="bg-[var(--surface-2)] text-[var(--text-primary)] rounded-lg px-3 py-2 text-base outline-none focus:ring-1 focus:ring-[var(--ring-focus)]"
        />
        <ColorPicker activeColor={editColor} onChange={setEditColor} />
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-[var(--action-surface)] text-[var(--text-heading)] rounded-lg px-4 py-2 text-sm font-medium active:opacity-80 disabled:opacity-40"
          >
            Save
          </button>
          <button
            onClick={handleCancel}
            className="text-[var(--text-muted)] text-sm px-3 py-2"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  // Delete confirmation prompt
  if (deleteState === 'confirm') {
    return (
      <div className="flex flex-col gap-2 py-2.5 px-1">
        <p className="text-sm text-[var(--text-primary)] font-medium">Delete "{entry.text}"?</p>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleDeleteOne}
            className="bg-red-600 text-white rounded-lg px-3 py-2 text-sm font-medium active:bg-red-700"
          >
            Just this one
          </button>
          {entry.batch_id && (
            <button
              onClick={handleDeleteFuture}
              className="bg-red-600 text-white rounded-lg px-3 py-2 text-sm font-medium active:bg-red-700"
            >
              This + future
            </button>
          )}
          <button
            onClick={() => setDeleteState(null)}
            className="text-[var(--text-muted)] text-sm px-3 py-2"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  // Normal display
  return (
    <div className="flex items-center gap-3 py-2.5 px-1 min-h-[48px]">
      {/* Person pill badge */}
      <span className={`shrink-0 ${pill.bg} text-white text-sm font-bold rounded-full w-8 h-8 flex items-center justify-center`}>
        {pill.label}
      </span>
      {/* Entry text */}
      <span
        className="flex-1 text-base text-[var(--text-primary)] font-medium cursor-pointer"
        onClick={() => setIsEditing(true)}
      >
        {entry.text}
      </span>
      {/* Delete button — instant if no batch, prompt if repeated */}
      <button
        onClick={() => entry.batch_id ? setDeleteState('confirm') : handleDeleteOne()}
        aria-label="Delete entry"
        className="text-[var(--border-subtle)] active:text-[var(--text-muted)] text-xl leading-none px-1 min-w-[44px] text-center"
      >
        ×
      </button>
    </div>
  )
}
