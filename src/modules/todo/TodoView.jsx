import { useNavigate } from 'react-router-dom'
import { useTodoData } from './hooks/useTodoData'
import TopBar from '../../shell/TopBar'
import TaskRow from './components/TaskRow'
import AddTaskBar from './components/AddTaskBar'

export default function TodoView({ auth }) {
  const navigate = useNavigate()
  const {
    activeTasks,
    loading,
    addTask,
    updateTask,
    completeTask,
    deleteTask,
  } = useTodoData()

  const rightSlot = (
    <>
      <button
        disabled
        aria-label="Notifications (coming soon)"
        className="h-9 w-9 rounded-lg border border-[var(--border-subtle)] text-[var(--text-muted)] flex items-center justify-center opacity-50"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      </button>
      <button
        onClick={() => navigate('/todo/archive')}
        className="h-9 px-3 rounded-lg border border-[var(--border-subtle)] text-[var(--text-muted)] text-sm active:scale-95 transition-transform"
      >
        Archive
      </button>
    </>
  )

  return (
    <div
      className="bg-[var(--surface-0)] text-[var(--text-primary)] max-w-md mx-auto flex flex-col"
      style={{ height: '100dvh' }}
    >
      <TopBar centre={null} right={rightSlot} />

      <main className="flex-1 overflow-y-auto pb-32">
        {loading ? (
          <div className="flex justify-center pt-16">
            <div className="w-8 h-8 border-4 border-[var(--spinner-track)] border-t-[var(--spinner-head)] rounded-full animate-spin" />
          </div>
        ) : (
          <div className="mt-2">
            {(() => {
              const urgent = activeTasks.filter(t => t.is_priority)
              const standard = activeTasks.filter(t => !t.is_priority)
              return (
                <>
                  <div className="px-4 py-1.5 flex items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-need">Urgent</span>
                  </div>
                  {urgent.length > 0
                    ? urgent.map(task => (
                        <TaskRow key={task.id} task={task} onComplete={completeTask} onUpdate={updateTask} onDelete={deleteTask} />
                      ))
                    : <p className="px-4 py-2 text-sm text-[var(--text-muted)] italic">No urgent tasks</p>
                  }

                  <div className="px-4 py-1.5 flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">Tasks</span>
                  </div>
                  {standard.length > 0
                    ? standard.map(task => (
                        <TaskRow key={task.id} task={task} onComplete={completeTask} onUpdate={updateTask} onDelete={deleteTask} />
                      ))
                    : <p className="px-4 py-2 text-sm text-[var(--text-muted)] italic">No tasks — add one below</p>
                  }
                </>
              )
            })()}
          </div>
        )}
      </main>

      <AddTaskBar onAdd={(taskData) => addTask(taskData, auth.session)} />
    </div>
  )
}
