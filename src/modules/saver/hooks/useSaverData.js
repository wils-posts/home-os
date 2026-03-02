import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../../shared/supabaseClient'

// ── Streak helpers ────────────────────────────────────────────────────────────

function getISOWeekStart(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day // adjust to Monday
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function toWeekKey(date) {
  const s = getISOWeekStart(date)
  return `${s.getFullYear()}-${s.getMonth()}-${s.getDate()}`
}

function calcStreak(contributions, weeklyMin, contributor) {
  const mine = contributions.filter(c => c.contributor === contributor)
  const weekTotals = {}
  for (const c of mine) {
    const key = toWeekKey(new Date(c.contributed_at))
    weekTotals[key] = (weekTotals[key] || 0) + parseFloat(c.amount)
  }
  let streak = 0
  const weekStart = getISOWeekStart(new Date())
  weekStart.setDate(weekStart.getDate() - 7) // start from previous completed week
  for (let i = 0; i < 104; i++) {
    const key = toWeekKey(weekStart)
    if ((weekTotals[key] || 0) >= weeklyMin) {
      streak++
      weekStart.setDate(weekStart.getDate() - 7)
    } else {
      break
    }
  }
  return streak
}

function getCurrentWeekTotal(contributions, contributor) {
  const key = toWeekKey(new Date())
  return contributions
    .filter(c => c.contributor === contributor && toWeekKey(new Date(c.contributed_at)) === key)
    .reduce((sum, c) => sum + parseFloat(c.amount), 0)
}

function weeksUntilDeadline(deadlineStr) {
  if (!deadlineStr) return 1
  const now = new Date()
  const deadline = new Date(deadlineStr + 'T00:00:00')
  const weeks = Math.ceil((deadline - now) / (7 * 24 * 60 * 60 * 1000))
  return Math.max(weeks, 1)
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useSaverData() {
  const [goal, setGoal] = useState(null)
  const [contributions, setContributions] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchGoal = useCallback(async () => {
    const { data, error } = await supabase
      .from('saver_goals')
      .select('*')
      .eq('status', 'active')
      .maybeSingle()
    if (!error) setGoal(data ?? null)
    return data ?? null
  }, [])

  const fetchContributions = useCallback(async (goalId) => {
    const { data, error } = await supabase
      .from('saver_contributions')
      .select('*')
      .eq('goal_id', goalId)
      .order('contributed_at', { ascending: true })
    if (!error && data) setContributions(data)
  }, [])

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const g = await fetchGoal()
    if (g) await fetchContributions(g.id)
    else setContributions([])
    setLoading(false)
  }, [fetchGoal, fetchContributions])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  useEffect(() => {
    const channel = supabase
      .channel('saver-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'saver_goals' }, () => fetchAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'saver_contributions' }, () => fetchAll())
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [fetchAll])

  // ── Mutations ───────────────────────────────────────────────────────────────

  async function createGoal(targetAmount, deadline, weeklyMin) {
    const { data, error } = await supabase
      .from('saver_goals')
      .insert({
        target_amount: parseFloat(targetAmount),
        deadline,
        weekly_streak_min: parseFloat(weeklyMin) || 5,
      })
      .select()
      .single()
    if (!error && data) {
      setGoal(data)
      setContributions([])
    }
  }

  async function addContribution(contributor, amount) {
    if (!goal) return
    const { error } = await supabase
      .from('saver_contributions')
      .insert({
        goal_id: goal.id,
        contributor,
        amount: parseFloat(amount),
      })
    if (!error) await fetchContributions(goal.id)
  }

  async function archiveGoal() {
    if (!goal) return
    await supabase
      .from('saver_goals')
      .update({ status: 'archived', archived_at: new Date().toISOString() })
      .eq('id', goal.id)
    setGoal(null)
    setContributions([])
  }

  async function updateGoalSettings({ targetAmount, deadline, weeklyMin }) {
    if (!goal) return
    const { data, error } = await supabase
      .from('saver_goals')
      .update({
        target_amount: parseFloat(targetAmount),
        deadline,
        weekly_streak_min: parseFloat(weeklyMin) || 5,
      })
      .eq('id', goal.id)
      .select()
      .single()
    if (!error && data) setGoal(data)
  }

  async function resetGoal() {
    if (!goal) return
    await supabase.from('saver_goals').delete().eq('id', goal.id)
    setGoal(null)
    setContributions([])
  }

  async function fetchArchivedGoals() {
    const { data, error } = await supabase
      .from('saver_goals')
      .select('*, saver_contributions(contributor, amount)')
      .eq('status', 'archived')
      .order('archived_at', { ascending: false })
    if (error) return []
    return data ?? []
  }

  async function deleteArchivedGoal(id) {
    const { error } = await supabase.from('saver_goals').delete().eq('id', id)
    return !error
  }

  // ── Derived ─────────────────────────────────────────────────────────────────

  const totalSaved = contributions.reduce((sum, c) => sum + parseFloat(c.amount), 0)
  const cTotal = contributions
    .filter(c => c.contributor === 'C')
    .reduce((sum, c) => sum + parseFloat(c.amount), 0)
  const sTotal = contributions
    .filter(c => c.contributor === 'S')
    .reduce((sum, c) => sum + parseFloat(c.amount), 0)
  const weeklyMin = goal?.weekly_streak_min ?? 5
  const cStreak = calcStreak(contributions, weeklyMin, 'C')
  const sStreak = calcStreak(contributions, weeklyMin, 'S')
  const cWeekTotal = getCurrentWeekTotal(contributions, 'C')
  const sWeekTotal = getCurrentWeekTotal(contributions, 'S')
  const targetAmount = goal?.target_amount ?? 0
  const remaining = Math.max(0, targetAmount - totalSaved)
  const weeklyNeeded = remaining > 0 ? remaining / weeksUntilDeadline(goal?.deadline) : 0
  const percent = targetAmount > 0 ? Math.min(100, (totalSaved / targetAmount) * 100) : 0

  return {
    goal,
    contributions,
    loading,
    totalSaved,
    cTotal,
    sTotal,
    cStreak,
    sStreak,
    cWeekTotal,
    sWeekTotal,
    remaining,
    weeklyNeeded,
    percent,
    createGoal,
    addContribution,
    archiveGoal,
    updateGoalSettings,
    resetGoal,
    fetchArchivedGoals,
    deleteArchivedGoal,
  }
}
