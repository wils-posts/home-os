const BAR_COLORS = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  red: 'bg-red-500',
}

const COLOR_ORDER = ['blue', 'green', 'red']

export default function CalendarCell({ dayStr, dayNum, isCurrentMonth, isToday, isSelected, colors = [], hasNotes, onSelect }) {
  const visibleColors = COLOR_ORDER.filter(c => colors.includes(c))

  return (
    <button
      onClick={() => onSelect(dayStr)}
      className={`relative flex flex-col justify-between p-0.5 w-full h-full border-r border-b border-[var(--border-subtle)]/50
        ${isSelected ? 'bg-[var(--border-subtle)]' : isToday ? 'bg-[var(--surface-2)]/50' : ''}
      `}
    >
      <div className="flex justify-center w-full">
        <span className={`text-xs leading-none font-semibold ${!isCurrentMonth ? 'text-[var(--border-subtle)]' : isSelected ? 'text-[var(--text-heading)]' : 'text-[var(--text-primary)]'}`}>
          {dayNum}
        </span>
        {hasNotes && (
          <span className="text-[9px] leading-none opacity-60">📝</span>
        )}
      </div>
      {visibleColors.length > 0 && (
        <div className="flex gap-px w-full">
          {visibleColors.map(c => (
            <span key={c} className={`h-1 flex-1 rounded-sm ${BAR_COLORS[c]}`} />
          ))}
        </div>
      )}
    </button>
  )
}
