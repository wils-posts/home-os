function fmt(n) {
  return '£' + parseFloat(n).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function fmtTime(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function EntryRow({ entry, onDelete }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border-subtle)]">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--text-primary)] truncate">
          {entry.label ? entry.label : <span className="text-[var(--text-muted)] font-normal italic">No label</span>}
        </p>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">{fmtTime(entry.created_at)}</p>
      </div>
      <span className="text-sm font-semibold text-[var(--text-heading)] shrink-0">
        -{fmt(entry.amount)}
      </span>
      <button
        onClick={() => onDelete(entry.id)}
        aria-label="Delete entry"
        className="shrink-0 text-[var(--text-muted)] active:scale-95 transition-transform ml-1"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14H6L5 6" />
          <path d="M10 11v6M14 11v6" />
          <path d="M9 6V4h6v2" />
        </svg>
      </button>
    </div>
  )
}
