import { useNavigate } from 'react-router-dom'

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
]

export default function HomeScreen() {
  const navigate = useNavigate()

  return (
    <div
      className="bg-slate-900 text-slate-100 max-w-md mx-auto flex flex-col"
      style={{ height: '100dvh' }}
    >
      <div className="px-6 pt-8 pb-6">
        <h1 className="text-2xl font-bold text-white">HomeOS</h1>
        <p className="text-slate-400 text-sm mt-1">Your household, all in one place</p>
      </div>

      <div className="px-4 grid grid-cols-2 gap-3">
        {TOOLS.map(tool => (
          <button
            key={tool.id}
            onClick={() => navigate(tool.route)}
            className="flex flex-col items-center justify-center gap-3 p-6 bg-slate-800 rounded-2xl border border-slate-700 active:scale-95 transition-transform"
          >
            <span className="text-slate-300">{tool.icon}</span>
            <span className="text-sm font-semibold text-slate-100">{tool.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
