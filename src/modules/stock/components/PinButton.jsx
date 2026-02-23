export default function PinButton({ pinned, onTouchEnd, onClick }) {
  return (
    <button
      onTouchEnd={onTouchEnd}
      onClick={onClick}
      className="min-w-[44px] min-h-[44px] flex items-center justify-center text-[var(--text-muted)] active:scale-95 transition-transform"
      aria-label={pinned ? 'Unpin item' : 'Pin item'}
    >
      {pinned ? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[var(--text-primary)]">
          <path d="M16 12V4h1a1 1 0 0 0 0-2H7a1 1 0 0 0 0 2h1v8l-2 2v2h5v5l1 1 1-1v-5h5v-2l-2-2z"/>
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
          <path d="M16 12V4h1a1 1 0 0 0 0-2H7a1 1 0 0 0 0 2h1v8l-2 2v2h5v5l1 1 1-1v-5h5v-2l-2-2z"/>
        </svg>
      )}
    </button>
  )
}
