import { useNavigate } from 'react-router-dom'
import { useTodoData } from './hooks/useTodoData'
import TopBar from '../../shell/TopBar'

const COMPLETED_BY_LABEL = { c: 'C', s: 'S', a: 'A' }
const COMPLETED_BY_COLOR = {
  c: 'bg-blue-500 text-white',
  s: 'bg-ok text-white',
  a: 'bg-need text-white',
}

function formatDateTime(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatDueDay(due_day) {
  if (!due_day) return null
  const [year, month, day] = due_day.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export default function ArchiveView({ auth }) {
  const navigate = useNavigate()
  const { archivedTasks, loading, uncompleteTask, deleteTask } = useTodoData()

  const rightSlot = (
    <button
      onClick={() => navigate('/todo')}
      className="h-9 px-3 rounded-lg border border-[var(--border-subtle)] text-[var(--text-muted)] text-sm active:scale-95 transition-transform"
    >
      Back
    </button>
  )

  return (
    <div
      className="bg-[var(--surface-0)] text-[var(--text-primary)] max-w-md mx-auto flex flex-col"
      style={{ height: '100dvh' }}
    >
      <TopBar centre={null} right={rightSlot} />

      <main className="flex-1 overflow-y-auto pb-8">
        {loading ? (
          <div className="flex justify-center pt-16">
            <div className="w-8 h-8 border-4 border-[var(--spinner-track)] border-t-[var(--spinner-head)] rounded-full animate-spin" />
          </div>
        ) : archivedTasks.length === 0 ? (
          <p className="text-center text-[var(--text-muted)] text-sm pt-12">
            No completed tasks yet.
          </p>
        ) : (
          <div className="mt-2">
            {archivedTasks.map(task => (
              <div
                key={task.id}
                className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border-subtle)] last:border-b-0 bg-[var(--surface-1)]"
              >
                {/* Completed-by badge */}
                <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${COMPLETED_BY_COLOR[task.completed_by] ?? 'bg-[var(--surface-2)] text-[var(--text-muted)]'}`}>
                  {COMPLETED_BY_LABEL[task.completed_by] ?? '?'}
                </div>

                {/* Title + meta */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-muted)] line-through truncate">
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs text-[var(--text-muted)]">
                      {formatDateTime(task.completed_at)}
                    </p>
                    {task.due_day && (
                      <p className="text-xs text-[var(--text-muted)]">
                        · due {formatDueDay(task.due_day)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Undo button */}
                <button
                  onClick={() => uncompleteTask(task.id)}
                  aria-label="Undo completion"
                  className="shrink-0 h-8 px-2 rounded border border-[var(--border-subtle)] text-[var(--text-muted)] text-xs active:scale-95 transition-transform"
                >
                  Undo
                </button>

                {/* Delete button */}
                <button
                  onClick={() => deleteTask(task.id)}
                  aria-label="Delete task"
                  className="shrink-0 h-8 w-8 flex items-center justify-center rounded border border-[var(--border-subtle)] text-[var(--text-muted)] active:scale-95 transition-transform"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6M14 11v6M9 6V4h6v2" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
