import { useState } from 'react'

export default function SectionAccordion({ title, items, defaultOpen, onMarkAllOk, children }) {
  const [open, setOpen] = useState(defaultOpen ?? false)

  if (items.length === 0) return null

  return (
    <div className="mb-1">
      <div className="flex items-center bg-[var(--surface-1)] hover:bg-[var(--surface-2)] transition-colors">
        <button
          onClick={() => setOpen(o => !o)}
          className="flex-1 flex items-center justify-between px-4 py-3"
        >
          <span className="font-semibold text-[var(--text-muted)] text-sm uppercase tracking-wide">
            {title}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-[var(--text-muted)] bg-[var(--surface-2)] rounded-full px-2 py-0.5">
              {items.length}
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={`w-4 h-4 text-[var(--text-muted)] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </button>

        {/* Mark all OK button — only shown when onMarkAllOk is provided */}
        {onMarkAllOk && (
          <button
            onClick={e => { e.stopPropagation(); onMarkAllOk() }}
            className="px-3 py-3 text-xs text-[var(--text-muted)] hover:text-ok font-medium shrink-0 active:scale-95 transition-transform"
            aria-label="Mark all as OK"
          >
            ✓ All
          </button>
        )}
      </div>

      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-[3000px]' : 'max-h-0'}`}>
        <div className="bg-[var(--surface-1)]">
          {children}
        </div>
      </div>
    </div>
  )
}
