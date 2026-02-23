import { useState } from 'react'
import { supabase } from '../../../shared/supabaseClient'
import { buildWeeklyDates } from '../utils/dateUtils'
import { generateUUID } from '../utils/uuidUtils'

export default function AddEntryForm({ activeColor, selectedDay, calendarId, userId, onAdded, onToast }) {
  const [text, setText] = useState('')
  const [repeat, setRepeat] = useState(false)
  const [untilDate, setUntilDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [batchMsg, setBatchMsg] = useState('')

  async function submit() {
    const trimmed = text.trim()
    if (!trimmed) return

    setSaving(true)
    setBatchMsg('')

    const now = new Date().toISOString()
    const baseRow = {
      calendar_id: calendarId,
      color: activeColor,
      text: trimmed,
      created_by: userId,
      created_at: now,
      updated_at: now,
    }

    if (repeat && untilDate && untilDate >= selectedDay) {
      const dates = buildWeeklyDates(selectedDay, untilDate)
      const batchId = generateUUID()
      setBatchMsg(`Creating ${dates.length} entries…`)
      const rows = dates.map(day => ({ ...baseRow, day, batch_id: batchId }))
      const { error } = await supabase.from('planner_day_entries').insert(rows)
      if (error) {
        onToast({ message: "Couldn't save — please try again", type: 'error' })
      } else {
        setText('')
        setBatchMsg('')
        onAdded()
      }
    } else {
      const { error } = await supabase.from('planner_day_entries').insert({ ...baseRow, day: selectedDay })
      if (error) {
        onToast({ message: "Couldn't save — please try again", type: 'error' })
      } else {
        setText('')
        onAdded()
      }
    }

    setSaving(false)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') submit() }}
          placeholder="Add entry…"
          disabled={saving}
          className="flex-1 bg-zinc-800 text-white placeholder-zinc-500 rounded-lg px-3 py-2.5 text-base outline-none focus:ring-1 focus:ring-zinc-500 min-w-0"
        />
        <button
          onClick={submit}
          disabled={saving || !text.trim()}
          className="bg-zinc-700 text-white rounded-lg px-4 py-2.5 text-base font-medium active:bg-zinc-600 disabled:opacity-40 shrink-0"
        >
          Add
        </button>
      </div>

      <div className="flex items-center gap-2 text-sm flex-wrap">
        <label className="flex items-center gap-2 text-zinc-400 cursor-pointer shrink-0">
          <input
            type="checkbox"
            checked={repeat}
            onChange={e => setRepeat(e.target.checked)}
            className="accent-zinc-400"
          />
          Repeat weekly until
        </label>
        {repeat && (
          <input
            type="date"
            value={untilDate}
            min={selectedDay}
            onChange={e => setUntilDate(e.target.value)}
            className="bg-zinc-800 text-white rounded px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-zinc-500"
          />
        )}
      </div>

      {batchMsg && <p className="text-xs text-zinc-400">{batchMsg}</p>}
    </div>
  )
}
