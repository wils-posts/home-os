import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../../shared/supabaseClient'

export default function NotesArea({ calendarId, selectedDay, initialNotes, userId, onSavingChange, onToast }) {
  const [localNotes, setLocalNotes] = useState(initialNotes || '')
  const isFocusedRef = useRef(false)
  const debounceRef = useRef(null)

  useEffect(() => {
    if (!isFocusedRef.current) {
      setLocalNotes(initialNotes || '')
    }
  }, [selectedDay, initialNotes])

  async function save(notes) {
    onSavingChange('saving')
    const { error } = await supabase
      .from('planner_day_notes')
      .upsert(
        { calendar_id: calendarId, day: selectedDay, notes, updated_by: userId, updated_at: new Date().toISOString() },
        { onConflict: 'calendar_id,day' }
      )
    if (error) {
      onToast({ message: "Couldn't save — please try again", type: 'error' })
      onSavingChange('')
    } else {
      const now = new Date()
      const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      onSavingChange(`Saved ${hhmm}`)
    }
  }

  function handleChange(e) {
    const val = e.target.value
    setLocalNotes(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => save(val), 800)
  }

  function handleBlur() {
    isFocusedRef.current = false
    clearTimeout(debounceRef.current)
    save(localNotes)
  }

  return (
    <textarea
      value={localNotes}
      onChange={handleChange}
      onFocus={() => { isFocusedRef.current = true }}
      onBlur={handleBlur}
      placeholder="Notes…"
      className="w-full bg-slate-800 text-white placeholder-slate-500 rounded-lg px-3 py-2.5 text-base outline-none focus:ring-1 focus:ring-slate-500 resize-none min-h-[80px]"
    />
  )
}
