import CalendarCell from './CalendarCell'
import { buildCalendarCells } from '../utils/dateUtils'

const DAY_HEADERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export default function CalendarGrid({ viewYear, viewMonth, selectedDay, todayStr, onDaySelect, monthData }) {
  const cells = buildCalendarCells(viewYear, viewMonth)

  return (
    <div className="flex flex-col h-full">
      <div className="grid grid-cols-7 mb-0.5">
        {DAY_HEADERS.map((d, i) => (
          <div key={i} className="text-center text-xs text-[var(--text-muted)] py-0.5 font-medium">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 grid-rows-6 flex-1 border-l border-t border-[var(--border-subtle)]/20">
        {cells.map(({ dayStr, dayNum, isCurrentMonth }) => {
          const data = monthData[dayStr] || {}
          return (
            <CalendarCell
              key={dayStr}
              dayStr={dayStr}
              dayNum={dayNum}
              isCurrentMonth={isCurrentMonth}
              isToday={dayStr === todayStr}
              isSelected={dayStr === selectedDay}
              colors={data.colors || []}
              hasNotes={data.hasNotes || false}
              onSelect={onDaySelect}
            />
          )
        })}
      </div>
    </div>
  )
}
