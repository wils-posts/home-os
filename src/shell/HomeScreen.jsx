import { useNavigate } from 'react-router-dom'
import { useTheme } from '../shared/useTheme'
import { useTodoData } from '../modules/todo/hooks/useTodoData'

const TOOLS = [
  {
    id: 'planner',
    label: 'HomePlanner',
    route: '/planner',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    id: 'stock',
    label: 'HomeStock',
    route: '/stock',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
  },
  {
    id: 'cook',
    label: 'HomeCook',
    route: '/cook',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 8h14a1 1 0 0 1 1 1v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1z" />
        <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
        <path d="M2 10.5h2M20 10.5h2" />
      </svg>
    ),
  },
  {
    id: 'decider',
    label: 'HomeDecider',
    route: '/decider',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <circle cx="8" cy="8" r="1.2" fill="currentColor" stroke="none" />
        <circle cx="16" cy="8" r="1.2" fill="currentColor" stroke="none" />
        <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
        <circle cx="8" cy="16" r="1.2" fill="currentColor" stroke="none" />
        <circle cx="16" cy="16" r="1.2" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    id: 'saver',
    label: 'HomeSaver',
    route: '/saver',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 8C19 5.79 16.31 4 13 4H11C7.69 4 5 5.79 5 8C5 8 5 8.01 5 8C5 10.21 7.69 12 11 12H13C16.31 12 19 10.21 19 8Z" />
        <path d="M5 8V16C5 18.21 7.69 20 11 20H13C16.31 20 19 18.21 19 16V8" />
        <path d="M5 12C5 14.21 7.69 16 11 16H13C16.31 16 19 14.21 19 12" />
      </svg>
    ),
  },
]

export default function HomeScreen({ auth }) {
  const navigate = useNavigate()
  const { cycleTheme } = useTheme()
  const { totalCount, priorityCount } = useTodoData()

  return (
    <div
      className="bg-[var(--surface-0)] text-[var(--text-primary)] max-w-md mx-auto flex flex-col"
      style={{ height: '100dvh' }}
    >
      <div className="px-6 pt-8 pb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-heading)]">HomeOS</h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">Version 1.5</p>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <button
            onClick={cycleTheme}
            aria-label="Cycle theme"
            className="h-9 w-9 rounded-lg border border-[var(--border-subtle)] text-[var(--text-muted)] flex items-center justify-center active:scale-95 transition-transform"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12c0 5.52 4.48 10 10 10 1.1 0 2-.9 2-2v-.5c0-.55.45-1 1-1h1c2.76 0 5-2.24 5-5C21 7.03 16.97 2 12 2z" />
              <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" stroke="none" />
              <circle cx="14.5" cy="7.5" r="1.5" fill="currentColor" stroke="none" />
              <circle cx="7.5" cy="13.5" r="1.5" fill="currentColor" stroke="none" />
            </svg>
          </button>
          <button
            onClick={auth.signOut}
            className="h-9 px-3 rounded-lg border border-[var(--border-subtle)] text-[var(--text-muted)] text-sm active:scale-95 transition-transform"
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className="px-4 grid grid-cols-2 gap-3">
        {/* Standard tool cards */}
        {TOOLS.map(tool => (
          <button
            key={tool.id}
            onClick={() => navigate(tool.route)}
            className="flex flex-col items-center justify-center gap-3 p-6 bg-[var(--surface-1)] rounded-2xl border border-[var(--border-subtle)] active:scale-95 transition-transform"
          >
            <span className="text-[var(--text-muted)]">{tool.icon}</span>
            <span className="text-sm font-semibold text-[var(--text-primary)]">{tool.label}</span>
          </button>
        ))}

        {/* HomeTodo card — live task counts instead of icon */}
        <button
          onClick={() => navigate('/todo')}
          className="flex flex-col items-center justify-center gap-3 p-6 bg-[var(--surface-1)] rounded-2xl border border-[var(--border-subtle)] active:scale-95 transition-transform"
        >
          {/* Two count boxes */}
          <div className="flex items-center gap-3">
            {/* Total tasks */}
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold leading-none text-[var(--text-heading)]">
                {totalCount}
              </span>
              <span className="text-[10px] text-[var(--text-muted)] mt-1 uppercase tracking-wide">total</span>
            </div>

            <div className="w-px h-6 bg-[var(--border-subtle)]" />

            {/* Priority tasks */}
            <div className="flex flex-col items-center">
              <span className={`text-2xl font-bold leading-none ${priorityCount > 0 ? 'text-need' : 'text-[var(--text-muted)]'}`}>
                {priorityCount}
              </span>
              <span className="text-[10px] text-[var(--text-muted)] mt-1 uppercase tracking-wide">urgent</span>
            </div>
          </div>

          <span className="text-sm font-semibold text-[var(--text-primary)]">HomeTodo</span>
        </button>
      </div>
    </div>
  )
}
