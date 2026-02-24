import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../../shared/supabaseClient'

const STORAGE_KEY = 'decider-active-profile'

const DEFAULT_SETTINGS = {
  spinDurationMs: 4000,
  extraRotations: 5,
  allowRepeatWinners: true,
  soundEnabled: true,
  celebrationEnabled: true,
  colourMode: 'multi',
}

export function useDeciderData() {
  const [profiles, setProfiles] = useState([])
  const [activeProfileId, setActiveProfileId] = useState(
    () => localStorage.getItem(STORAGE_KEY) ?? null
  )
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchProfiles = useCallback(async () => {
    const { data, error } = await supabase
      .from('decider_profiles')
      .select('*')
      .order('created_at', { ascending: true })
    if (!error && data) setProfiles(data)
    return data
  }, [])

  const fetchItems = useCallback(async (profileId) => {
    if (!profileId) { setItems([]); return }
    const { data, error } = await supabase
      .from('decider_items')
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: true })
    if (!error && data) setItems(data)
  }, [])

  // Initial load
  useEffect(() => {
    async function init() {
      setLoading(true)
      let data = await fetchProfiles()

      // Bootstrap: create a default profile if none exist
      if (!data || data.length === 0) {
        const { data: created, error } = await supabase
          .from('decider_profiles')
          .insert({ name: 'Evening Activity', settings: DEFAULT_SETTINGS })
          .select()
          .single()
        if (!error && created) {
          data = [created]
          setProfiles(data)
        }
      }

      if (data && data.length > 0) {
        const saved = localStorage.getItem(STORAGE_KEY)
        const found = saved && data.find(p => p.id === saved)
        const id = found ? saved : data[0].id
        setActiveProfileId(id)
        localStorage.setItem(STORAGE_KEY, id)
        await fetchItems(id)
      }
      setLoading(false)
    }
    init()
  }, [fetchProfiles, fetchItems])

  // Fetch items when active profile changes
  useEffect(() => {
    if (activeProfileId) fetchItems(activeProfileId)
  }, [activeProfileId, fetchItems])

  // Realtime subscriptions
  useEffect(() => {
    const profileChannel = supabase
      .channel('decider-profiles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'decider_profiles' }, () => {
        fetchProfiles()
      })
      .subscribe()

    const itemChannel = supabase
      .channel('decider-items')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'decider_items' }, () => {
        fetchItems(activeProfileId)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(profileChannel)
      supabase.removeChannel(itemChannel)
    }
  }, [fetchProfiles, fetchItems, activeProfileId])

  function switchActiveProfile(id) {
    setActiveProfileId(id)
    localStorage.setItem(STORAGE_KEY, id)
  }

  async function createProfile(name) {
    const { data, error } = await supabase
      .from('decider_profiles')
      .insert({ name: name.trim(), settings: DEFAULT_SETTINGS })
      .select()
      .single()
    if (!error && data) {
      await fetchProfiles()
      switchActiveProfile(data.id)
    }
  }

  async function renameProfile(id, name) {
    await supabase
      .from('decider_profiles')
      .update({ name: name.trim(), updated_at: new Date().toISOString() })
      .eq('id', id)
    fetchProfiles()
  }

  async function deleteProfile(id) {
    await supabase.from('decider_profiles').delete().eq('id', id)
    const remaining = profiles.filter(p => p.id !== id)
    await fetchProfiles()
    if (activeProfileId === id && remaining.length > 0) {
      switchActiveProfile(remaining[0].id)
    }
  }

  async function addItem(label, weight = 1) {
    if (!activeProfileId) return
    await supabase.from('decider_items').insert({
      profile_id: activeProfileId,
      label: label.trim(),
      weight,
    })
    fetchItems(activeProfileId)
  }

  async function updateItem(id, patch) {
    await supabase.from('decider_items').update(patch).eq('id', id)
    fetchItems(activeProfileId)
  }

  async function deleteItem(id) {
    await supabase.from('decider_items').delete().eq('id', id)
    fetchItems(activeProfileId)
  }

  async function updateSettings(patch) {
    if (!activeProfileId) return
    const current = profiles.find(p => p.id === activeProfileId)
    if (!current) return
    const merged = { ...DEFAULT_SETTINGS, ...current.settings, ...patch }
    await supabase
      .from('decider_profiles')
      .update({ settings: merged, updated_at: new Date().toISOString() })
      .eq('id', activeProfileId)
    fetchProfiles()
  }

  const activeProfile = profiles.find(p => p.id === activeProfileId) ?? null
  const settings = activeProfile ? { ...DEFAULT_SETTINGS, ...activeProfile.settings } : DEFAULT_SETTINGS

  return {
    profiles,
    activeProfile,
    activeProfileId,
    items,
    settings,
    loading,
    switchActiveProfile,
    createProfile,
    renameProfile,
    deleteProfile,
    addItem,
    updateItem,
    deleteItem,
    updateSettings,
  }
}
