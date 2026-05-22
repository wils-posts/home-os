import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../../shared/supabaseClient'

export function useSpenderData() {
  const [activePeriod, setActivePeriod] = useState(null)
  const [entries, setEntries] = useState([])
  const [archivedPeriods, setArchivedPeriods] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    const { data: periodData } = await supabase
      .from('spender_periods')
      .select('*')
      .is('closed_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    setActivePeriod(periodData || null)

    if (periodData) {
      const { data: entryData } = await supabase
        .from('spender_entries')
        .select('*')
        .eq('period_id', periodData.id)
        .order('created_at', { ascending: false })
      setEntries(entryData || [])
    } else {
      setEntries([])
    }

    const { data: archiveData } = await supabase
      .from('spender_periods')
      .select('*')
      .not('closed_at', 'is', null)
      .order('closed_at', { ascending: false })
    setArchivedPeriods(archiveData || [])
  }, [])

  useEffect(() => {
    setLoading(true)
    fetchAll().then(() => setLoading(false))
  }, [fetchAll])

  useEffect(() => {
    const channel = supabase
      .channel('spender-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'spender_periods' }, fetchAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'spender_entries' }, fetchAll)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [fetchAll])

  async function startPeriod(budgetAmount) {
    await supabase.from('spender_periods').insert({ budget_amount: parseFloat(budgetAmount) })
    fetchAll()
  }

  async function updateBudget(amount) {
    if (!activePeriod) return
    await supabase
      .from('spender_periods')
      .update({ budget_amount: parseFloat(amount) })
      .eq('id', activePeriod.id)
    fetchAll()
  }

  async function addEntry(amount, label) {
    if (!activePeriod) return
    await supabase.from('spender_entries').insert({
      period_id: activePeriod.id,
      amount: parseFloat(amount),
      label: label.trim() || null,
    })
    fetchAll()
  }

  async function deleteEntry(id) {
    await supabase.from('spender_entries').delete().eq('id', id)
    fetchAll()
  }

  async function closePeriod(pushToSavings) {
    if (!activePeriod) return
    const totalSpent = entries.reduce((sum, e) => sum + parseFloat(e.amount), 0)
    const rem = activePeriod.budget_amount - totalSpent
    await supabase
      .from('spender_periods')
      .update({
        closed_at: new Date().toISOString(),
        total_spent: totalSpent,
        pushed_to_savings: pushToSavings,
        pushed_amount: pushToSavings ? Math.max(0, rem) : null,
      })
      .eq('id', activePeriod.id)
    fetchAll()
  }

  const totalSpent = entries.reduce((sum, e) => sum + parseFloat(e.amount), 0)
  const remaining = activePeriod ? activePeriod.budget_amount - totalSpent : 0

  return {
    activePeriod,
    entries,
    archivedPeriods,
    loading,
    totalSpent,
    remaining,
    startPeriod,
    updateBudget,
    addEntry,
    deleteEntry,
    closePeriod,
  }
}
