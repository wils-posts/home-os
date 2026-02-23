import { useNavigate } from 'react-router-dom'

export default function TopBar({ centre, right }) {
  const navigate = useNavigate()

  return (
    <div className="shrink-0 px-4 pt-3 pb-2 grid grid-cols-[44px_1fr_auto] items-center bg-[var(--surface-0)]">
      {/* Left: home button */}
      <button
        onClick={() => navigate('/')}
        aria-label="Home"
        className="h-9 w-9 flex items-center justify-center text-[var(--text-muted)] active:text-[var(--text-heading)] transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      </button>

      {/* Centre slot */}
      <div className="flex items-center justify-center">
        {centre}
      </div>

      {/* Right slot */}
      <div className="flex items-center gap-2 justify-end">
        {right}
      </div>
    </div>
  )
}
