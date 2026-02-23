// Inline chooser shown when user taps the complete button on a task.
// Shows C (blue) / S (green) / A (red) / Cancel

const OPTIONS = [
  { value: 'c', label: 'C', color: 'bg-blue-500 text-white' },
  { value: 's', label: 'S', color: 'bg-ok text-white' },
  { value: 'a', label: 'A', color: 'bg-need text-white' },
]

export default function CompletePicker({ onSelect, onCancel }) {
  return (
    <div className="flex items-center gap-2 py-2 px-4 bg-[var(--surface-2)] border-b border-[var(--border-subtle)]">
      <span className="text-xs text-[var(--text-muted)] mr-1">Who completed it?</span>
      {OPTIONS.map(opt => (
        <button
          key={opt.value}
          onClick={() => onSelect(opt.value)}
          className={`w-9 h-9 rounded-full text-sm font-bold active:scale-95 transition-transform ${opt.color}`}
        >
          {opt.label}
        </button>
      ))}
      <button
        onClick={onCancel}
        className="ml-auto text-xs text-[var(--text-muted)] px-2 py-1 rounded border border-[var(--border-subtle)] active:scale-95 transition-transform"
      >
        Cancel
      </button>
    </div>
  )
}
