import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../../shared/supabaseClient'

export function useCookData() {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchRecipes = useCallback(async () => {
    const { data, error } = await supabase
      .from('cook_recipes')
      .select('*')
      .order('title', { ascending: true })

    if (!error && data) {
      setRecipes(data)
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    fetchRecipes().finally(() => setLoading(false))
  }, [fetchRecipes])

  function getRecipe(id) {
    return recipes.find(r => r.id === id) ?? null
  }

  async function addRecipe(data) {
    const { data: inserted, error } = await supabase
      .from('cook_recipes')
      .insert({
        title: data.title.trim(),
        tags: data.tags ?? [],
        ingredients: data.ingredients ?? [],
        steps: data.steps ?? [],
        notes: data.notes?.trim() || null,
      })
      .select()
      .single()

    if (!error && inserted) {
      await fetchRecipes()
      return inserted
    }
    return null
  }

  async function updateRecipe(id, data) {
    const { error } = await supabase
      .from('cook_recipes')
      .update({
        title: data.title.trim(),
        tags: data.tags ?? [],
        ingredients: data.ingredients ?? [],
        steps: data.steps ?? [],
        notes: data.notes?.trim() || null,
      })
      .eq('id', id)

    if (!error) {
      await fetchRecipes()
    }
  }

  async function deleteRecipe(id) {
    const { error } = await supabase
      .from('cook_recipes')
      .delete()
      .eq('id', id)

    if (!error) {
      await fetchRecipes()
    }
  }

  return {
    recipes,
    loading,
    fetchRecipes,
    getRecipe,
    addRecipe,
    updateRecipe,
    deleteRecipe,
  }
}
