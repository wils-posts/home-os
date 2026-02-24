import { useNavigate } from 'react-router-dom'
import TopBar from '../../shell/TopBar'

export default function CookView() {
  const navigate = useNavigate()

  return (
    <div
      className="flex flex-col bg-[var(--surface-0)] text-[var(--text-primary)] max-w-md mx-auto"
      style={{ height: '100dvh' }}
    >
      <TopBar
        centre={<span className="text-sm font-semibold text-[var(--text-heading)]">HomeCook</span>}
      />

      <div className="flex flex-col gap-4 px-4 pt-6">
        <MenuButton
          label="Start / Resume Bulk Cook"
          description="Plan and track a cooking session"
          onClick={() => navigate('/cook/bulk')}
        />
        <MenuButton
          label="View Recipe Library"
          description="Browse and manage your recipes"
          onClick={() => navigate('/cook/recipes')}
        />
      </div>
    </div>
  )
}

function MenuButton({ label, description, onClick, disabled }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className="w-full text-left px-5 py-5 bg-[var(--surface-1)] rounded-2xl border border-[var(--border-subtle)] active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <p className="font-semibold text-[var(--text-heading)]">{label}</p>
      <p className="text-sm text-[var(--text-muted)] mt-1">{description}</p>
    </button>
  )
}
