import { STATE_LABELS, STATE_COLORS } from '../lib/constants'

export default function StatePill({ state, onTouchEnd, onClick, disabled, compact }) {
  const size = compact
    ? 'min-w-[40px] min-h-[40px] text-xs px-2'
    : 'min-w-[48px] min-h-[48px] text-sm px-3'

  return (
    <button
      onTouchEnd={onTouchEnd}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${size} rounded-full font-semibold
        flex items-center justify-center shrink-0
        transition-opacity duration-150
        ${STATE_COLORS[state] ?? 'bg-slate-400 text-white'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}
      `}
    >
      {STATE_LABELS[state] ?? state}
    </button>
  )
}
