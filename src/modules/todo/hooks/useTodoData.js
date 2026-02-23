import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../../shared/supabaseClient'

function sortActiveTasks(tasks) {
  return [...tasks].sort((a, b) => {
    // 1) priority first
    if (a.is_priority !== b.is_priority) return a.is_priority ? -1 : 1
    // 2) within same priority group: tasks with due_day before tasks without
    if (a.due_day && !b.due_day) return -1
    if (!a.due_day && b.due_day) return 1
    // 3) both have due_day: earliest first (applies within both priority and non-priority groups)
    if (a.due_day && b.due_day) {
      if (a.due_day < b.due_day) return -1
      if (a.due_day > b.due_day) return 1
    }
    // 4) both have no due_day: newest created first
    return new Date(b.created_at) - new Date(a.created_at)
  })
}

export function useTodoData() {
  const [activeTasks, setActiveTasks] = useState([])
  const [archivedTasks, setArchivedTasks] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchActive = useCallback(async () => {
    const { data, error } = await supabase
      .from('todo_tasks')
      .select('*')
      .is('completed_at', null)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setActiveTasks(sortActiveTasks(data))
    }
  }, [])

  const fetchArchive = useCallback(async () => {
    const { data, error } = await supabase
      .from('todo_tasks')
      .select('*')
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })

    if (!error && data) {
      setArchivedTasks(data)
    }
  }, [])

  const fetchAll = useCallback(async () => {
    setLoading(true)
    await Promise.all([fetchActive(), fetchArchive()])
    setLoading(false)
  }, [fetchActive, fetchArchive])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  useEffect(() => {
    const channel = supabase
      .channel('todo-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'todo_tasks' }, () => {
        fetchActive()
        fetchArchive()
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [fetchActive, fetchArchive])

  async function addTask({ title, due_day = null, is_priority = false }, session) {
    const { error } = await supabase.from('todo_tasks').insert({
      title: title.trim(),
      due_day: due_day || null,
      is_priority,
      created_by: session.user.id,
    })
    if (!error) fetchActive()
  }

  async function updateTask(id, changes) {
    const { error } = await supabase
      .from('todo_tasks')
      .update({ ...changes, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (!error) fetchActive()
  }

  async function completeTask(id, completedBy) {
    const { error } = await supabase
      .from('todo_tasks')
      .update({
        completed_at: new Date().toISOString(),
        completed_by: completedBy,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
    if (!error) {
      fetchActive()
      fetchArchive()
    }
  }

  async function uncompleteTask(id) {
    const { error } = await supabase
      .from('todo_tasks')
      .update({
        completed_at: null,
        completed_by: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
    if (!error) {
      fetchActive()
      fetchArchive()
    }
  }

  async function deleteTask(id) {
    const { error } = await supabase.from('todo_tasks').delete().eq('id', id)
    if (!error) {
      fetchActive()
      fetchArchive()
    }
  }

  const priorityCount = activeTasks.filter(t => t.is_priority).length

  return {
    activeTasks,
    archivedTasks,
    loading,
    totalCount: activeTasks.length,
    priorityCount,
    addTask,
    updateTask,
    completeTask,
    uncompleteTask,
    deleteTask,
  }
}
