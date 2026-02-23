import { useState } from 'react'
import ColorPicker from './ColorPicker'
import AddEntryForm from './AddEntryForm'
import EntryRow from './EntryRow'
import NotesArea from './NotesArea'
import { formatDayHeader } from '../utils/dateUtils'

const COLOR_KEY = 'homeplanner_last_color'

function getInitialColor() {
  return localStorage.getItem(COLOR_KEY) || 'blue'
}

export default function DayPad({ calendarId, selectedDay, session, entries, notes, onRefetch, onToast }) {
  const [activeColor, setActiveColor] = useState(getInitialColor)
  const [notesSaving, setNotesSaving] = useState('')

  function handleColorChange(color) {
    setActiveColor(color)
    localStorage.setItem(COLOR_KEY, color)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-zinc-900">

      {/* Fixed top: date + colour picker + add form */}
      <div className="shrink-0 px-4 pt-3 pb-2 flex flex-col gap-3">
        <h2 className="text-base font-bold text-white">
          {formatDayHeader(selectedDay)}
        </h2>
        <ColorPicker activeColor={activeColor} onChange={handleColorChange} />
        <AddEntryForm
          activeColor={activeColor}
          selectedDay={selectedDay}
          calendarId={calendarId}
          userId={session.user.id}
          onAdded={onRefetch}
          onToast={onToast}
        />
      </div>

      {/* Scrollable: entries only */}
      <div className="overflow-y-auto px-4 flex flex-col gap-2 min-h-0">
        {entries.length > 0 && (
          <div className="divide-y divide-zinc-700/60">
            {entries.map(entry => (
              <EntryRow
                key={entry.id}
                entry={entry}
                selectedDay={selectedDay}
                onDeleted={onRefetch}
                onUpdated={onRefetch}
                onToast={onToast}
              />
            ))}
          </div>
        )}
      </div>

      {/* Notes — fixed at bottom, never scrolls away */}
      <div className="shrink-0 px-4 pb-4 pt-2">
        <NotesArea
          calendarId={calendarId}
          selectedDay={selectedDay}
          initialNotes={notes}
          userId={session.user.id}
          onSavingChange={setNotesSaving}
          onToast={onToast}
        />
      </div>
    </div>
  )
}
