import { STATE_LABELS, STATE_COLORS } from '../lib/constants'

const STATES = ['NEED', 'LOW', 'OK']

export default function StatePickerPopover({ current, onSelect, onClose }) {
  function handleOverlay(e) {
    e.preventDefault()
    e.stopPropagation()
    onClose()
  }

  function handleSelect(e, state) {
    e.preventDefault()
    e.stopPropagation()
    onSelect(state)
  }

  return (
    <>
      {/* Fullscreen overlay — absorbs outside taps completely */}
      <div
        className="fixed inset-0 z-10"
        onTouchEnd={handleOverlay}
        onClick={handleOverlay}
      />

      {/* Picker buttons — above the overlay */}
      <div className="relative z-20 flex items-center gap-2 py-1">
        {STATES.map(state => {
          const isCurrent = state === current
          return (
            <button
              key={state}
              onTouchEnd={e => handleSelect(e, state)}
              onClick={e => handleSelect(e, state)}
              className={`
                min-w-[48px] min-h-[40px] px-3 rounded-full text-sm font-semibold
                flex items-center justify-center shrink-0 transition-all duration-100
                ${isCurrent
                  ? `${STATE_COLORS[state]} ring-2 ring-offset-2 ring-[var(--ring-focus)] ring-offset-[var(--surface-1)]`
                  : `${STATE_COLORS[state]} opacity-40 active:opacity-100`
                }
              `}
              aria-label={`Set state to ${STATE_LABELS[state]}`}
            >
              {STATE_LABELS[state]}
            </button>
          )
        })}
      </div>
    </>
  )
}
