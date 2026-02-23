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
    <button
      onClick={() => navigate('/todo/archive')}
      className="h-9 px-3 rounded-lg border border-[var(--border-subtle)] text-[var(--text-muted)] text-sm active:scale-95 transition-transform"
    >
      Archive
    </button>
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
        ) : activeTasks.length === 0 ? (
          <p className="text-center text-[var(--text-muted)] text-sm pt-12">
            No active tasks. Add one below.
          </p>
        ) : (
          <div className="mt-2">
            {activeTasks.map(task => (
              <TaskRow
                key={task.id}
                task={task}
                onComplete={completeTask}
                onUpdate={updateTask}
                onDelete={deleteTask}
              />
            ))}
          </div>
        )}
      </main>

      <AddTaskBar onAdd={(taskData) => addTask(taskData, auth.session)} />
    </div>
  )
}
