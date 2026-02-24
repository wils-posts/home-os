import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../../shared/supabaseClient'

export function useBulkCookData() {
  const [cycle, setCycle]               = useState(null)
  const [selectedRecipes, setSelectedRecipes] = useState([])
  const [shopItems, setShopItems]       = useState([])
  const [cookLog, setCookLog]           = useState([])
  const [loading, setLoading]           = useState(true)

  // ── Fetch active cycle + all related data ──────────────────────────────────
  const fetchCycle = useCallback(async () => {
    const { data, error } = await supabase
      .from('bulk_cycles')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) { console.error(error); return }
    setCycle(data ?? null)
    return data ?? null
  }, [])

  const fetchSelectedRecipes = useCallback(async (cycleId) => {
    if (!cycleId) { setSelectedRecipes([]); return }
    const { data, error } = await supabase
      .from('bulk_cycle_recipes')
      .select('recipe_id, cook_recipes(*)')
      .eq('cycle_id', cycleId)
      .order('added_at', { ascending: true })

    if (!error && data) {
      setSelectedRecipes(data.map(row => row.cook_recipes))
    }
  }, [])

  const fetchShopItems = useCallback(async (cycleId) => {
    if (!cycleId) { setShopItems([]); return }
    const { data, error } = await supabase
      .from('bulk_shop_items')
      .select('*')
      .eq('cycle_id', cycleId)
      .order('sort_order', { ascending: true })

    if (!error && data) setShopItems(data)
  }, [])

  const fetchCookLog = useCallback(async (cycleId) => {
    if (!cycleId) { setCookLog([]); return }
    const { data, error } = await supabase
      .from('bulk_cook_log')
      .select('*')
      .eq('cycle_id', cycleId)
      .order('logged_at', { ascending: true })

    if (!error && data) setCookLog(data)
  }, [])

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const activeCycle = await fetchCycle()
    if (activeCycle) {
      await Promise.all([
        fetchSelectedRecipes(activeCycle.id),
        fetchShopItems(activeCycle.id),
        fetchCookLog(activeCycle.id),
      ])
    } else {
      setSelectedRecipes([])
      setShopItems([])
      setCookLog([])
    }
    setLoading(false)
  }, [fetchCycle, fetchSelectedRecipes, fetchShopItems, fetchCookLog])

  useEffect(() => { fetchAll() }, [fetchAll])

  // ── Cycle management ───────────────────────────────────────────────────────
  async function startNewCycle() {
    // Archive any existing active cycle first
    if (cycle) {
      await supabase
        .from('bulk_cycles')
        .update({ status: 'archived', archived_at: new Date().toISOString() })
        .eq('id', cycle.id)
    }
    const { data, error } = await supabase
      .from('bulk_cycles')
      .insert({ status: 'active', stage: 'plan' })
      .select()
      .single()

    if (!error && data) {
      setCycle(data)
      setSelectedRecipes([])
      setShopItems([])
      setCookLog([])
      return data
    }
    return null
  }

  async function setStage(stage) {
    if (!cycle) return
    const { error } = await supabase
      .from('bulk_cycles')
      .update({ stage })
      .eq('id', cycle.id)
    if (!error) setCycle(c => ({ ...c, stage }))
  }

  async function archiveCycle() {
    if (!cycle) return
    const { error } = await supabase
      .from('bulk_cycles')
      .update({ status: 'archived', archived_at: new Date().toISOString() })
      .eq('id', cycle.id)
    if (!error) {
      setCycle(null)
      setSelectedRecipes([])
      setShopItems([])
      setCookLog([])
    }
  }

  // ── Plan stage ─────────────────────────────────────────────────────────────
  async function setPlanNotes(text) {
    if (!cycle) return
    const { error } = await supabase
      .from('bulk_cycles')
      .update({ plan_notes: text || null })
      .eq('id', cycle.id)
    if (!error) setCycle(c => ({ ...c, plan_notes: text || null }))
  }

  async function addRecipeToCycle(recipeId) {
    if (!cycle) return
    const { error } = await supabase
      .from('bulk_cycle_recipes')
      .insert({ cycle_id: cycle.id, recipe_id: recipeId })
    if (!error) fetchSelectedRecipes(cycle.id)
  }

  async function removeRecipeFromCycle(recipeId) {
    if (!cycle) return
    const { error } = await supabase
      .from('bulk_cycle_recipes')
      .delete()
      .eq('cycle_id', cycle.id)
      .eq('recipe_id', recipeId)
    if (!error) fetchSelectedRecipes(cycle.id)
  }

  // ── Shop stage ─────────────────────────────────────────────────────────────
  async function generateShopList(recipes) {
    if (!cycle) return
    // Aggregate ingredients by name (case-insensitive)
    const counts = {}
    for (const recipe of recipes) {
      for (const ing of (recipe.ingredients ?? [])) {
        const key = (ing.name ?? '').trim().toLowerCase()
        if (!key) continue
        if (counts[key]) {
          counts[key].qty_text = counts[key].qty_text
            ? counts[key].qty_text + ' + ' + (ing.qtyText ?? '')
            : (ing.qtyText ?? '')
        } else {
          counts[key] = { name: ing.name.trim(), qty_text: ing.qtyText ?? '' }
        }
      }
    }
    const items = Object.values(counts).map((item, i) => ({
      cycle_id: cycle.id,
      name: item.name,
      qty_text: item.qty_text,
      checked: false,
      sort_order: i,
    }))

    // Delete existing items then insert fresh
    await supabase.from('bulk_shop_items').delete().eq('cycle_id', cycle.id)
    if (items.length > 0) {
      await supabase.from('bulk_shop_items').insert(items)
    }
    await fetchShopItems(cycle.id)
  }

  async function toggleShopItem(id) {
    const item = shopItems.find(i => i.id === id)
    if (!item) return
    const { error } = await supabase
      .from('bulk_shop_items')
      .update({ checked: !item.checked })
      .eq('id', id)
    if (!error) setShopItems(prev => prev.map(i => i.id === id ? { ...i, checked: !i.checked } : i))
  }

  async function updateShopItem(id, changes) {
    const { error } = await supabase
      .from('bulk_shop_items')
      .update(changes)
      .eq('id', id)
    if (!error) setShopItems(prev => prev.map(i => i.id === id ? { ...i, ...changes } : i))
  }

  async function addShopItem() {
    if (!cycle) return
    const maxOrder = shopItems.reduce((m, i) => Math.max(m, i.sort_order), -1)
    const { data, error } = await supabase
      .from('bulk_shop_items')
      .insert({ cycle_id: cycle.id, name: '', qty_text: '', checked: false, sort_order: maxOrder + 1 })
      .select()
      .single()
    if (!error && data) setShopItems(prev => [...prev, data])
  }

  async function deleteShopItem(id) {
    const { error } = await supabase.from('bulk_shop_items').delete().eq('id', id)
    if (!error) setShopItems(prev => prev.filter(i => i.id !== id))
  }

  // ── Prep stage ─────────────────────────────────────────────────────────────
  async function setPrepNotes(text) {
    if (!cycle) return
    const { error } = await supabase
      .from('bulk_cycles')
      .update({ prep_notes: text || null })
      .eq('id', cycle.id)
    if (!error) setCycle(c => ({ ...c, prep_notes: text || null }))
  }

  // ── Cook stage ─────────────────────────────────────────────────────────────
  async function addLogEntry(body) {
    if (!cycle || !body.trim()) return
    const { data, error } = await supabase
      .from('bulk_cook_log')
      .insert({ cycle_id: cycle.id, body: body.trim() })
      .select()
      .single()
    if (!error && data) setCookLog(prev => [...prev, data])
  }

  async function deleteLogEntry(id) {
    const { error } = await supabase.from('bulk_cook_log').delete().eq('id', id)
    if (!error) setCookLog(prev => prev.filter(e => e.id !== id))
  }

  // ── Review stage ───────────────────────────────────────────────────────────
  async function setReviewNotes(text) {
    if (!cycle) return
    const { error } = await supabase
      .from('bulk_cycles')
      .update({ review_notes: text || null })
      .eq('id', cycle.id)
    if (!error) setCycle(c => ({ ...c, review_notes: text || null }))
  }

  return {
    cycle,
    selectedRecipes,
    shopItems,
    cookLog,
    loading,
    fetchAll,
    // Cycle
    startNewCycle,
    setStage,
    archiveCycle,
    // Plan
    setPlanNotes,
    addRecipeToCycle,
    removeRecipeFromCycle,
    // Shop
    generateShopList,
    toggleShopItem,
    updateShopItem,
    addShopItem,
    deleteShopItem,
    // Prep
    setPrepNotes,
    // Cook
    addLogEntry,
    deleteLogEntry,
    // Review
    setReviewNotes,
  }
}
