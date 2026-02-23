import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../../../shared/supabaseClient'
import { getNextState, sortItems } from '../lib/itemUtils'
import { ERRORS } from '../lib/constants'

export function useStockData(showToast) {
  const [items, setItems] = useState([])           // server truth
  const [localItems, setLocalItems] = useState([]) // optimistic copy
  const [loading, setLoading] = useState(true)
  const [pendingIds, setPendingIds] = useState(new Set())
  const itemsRef = useRef([])

  const fetchItems = useCallback(async () => {
    const { data, error } = await supabase
      .from('stock_items')
      .select('*')
    if (error) {
      showToast(ERRORS.NETWORK)
      return
    }
    const sorted = sortItems(data)
    itemsRef.current = sorted
    setItems(sorted)
    setLocalItems(sorted)
    setLoading(false)
  }, [showToast])

  useEffect(() => {
    fetchItems()

    const channel = supabase
      .channel('stock-items-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'stock_items' },
        () => fetchItems()
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [fetchItems])

  function addPending(id) {
    setPendingIds(prev => new Set([...prev, id]))
  }
  function removePending(id) {
    setPendingIds(prev => { const s = new Set(prev); s.delete(id); return s })
  }

  async function cycleState(id, targetState) {
    const item = localItems.find(i => i.id === id)
    if (!item) return
    const next = targetState ?? getNextState(item.state)

    addPending(id)
    setLocalItems(prev => prev.map(i => i.id === id ? { ...i, state: next } : i))

    const { error } = await supabase
      .from('stock_items')
      .update({ state: next, updated_at: new Date().toISOString() })
      .eq('id', id)

    removePending(id)
    if (error) {
      setLocalItems(itemsRef.current)
      showToast(ERRORS.STATE_UPDATE)
    }
  }

  async function togglePin(id) {
    const item = localItems.find(i => i.id === id)
    if (!item) return
    const newPinned = !item.pinned
    const pinOrder = newPinned
      ? Math.max(0, ...localItems.filter(i => i.pinned).map(i => i.pin_order ?? 0)) + 1
      : null

    addPending(id)
    setLocalItems(prev => prev.map(i =>
      i.id === id ? { ...i, pinned: newPinned, pin_order: pinOrder } : i
    ))

    const { error } = await supabase
      .from('stock_items')
      .update({ pinned: newPinned, pin_order: pinOrder, updated_at: new Date().toISOString() })
      .eq('id', id)

    removePending(id)
    if (error) {
      setLocalItems(itemsRef.current)
      showToast(ERRORS.STATE_UPDATE)
    }
  }

  async function addItem(name) {
    const maxOrder = localItems.length > 0
      ? Math.max(...localItems.map(i => i.created_order))
      : 0
    const { error } = await supabase
      .from('stock_items')
      .insert({ name, state: 'LOW', pinned: false, created_order: maxOrder + 1 })
    if (error) showToast(ERRORS.NETWORK)
  }

  async function markBought(ids) {
    const { error } = await supabase
      .from('stock_items')
      .update({ state: 'OK', updated_at: new Date().toISOString() })
      .in('id', ids)
    if (error) showToast(ERRORS.STATE_UPDATE)
  }

  async function deleteItem(id) {
    setLocalItems(prev => prev.filter(i => i.id !== id))

    const { error } = await supabase
      .from('stock_items')
      .delete()
      .eq('id', id)

    if (error) {
      setLocalItems(itemsRef.current)
      showToast(ERRORS.STATE_UPDATE)
    }
  }

  async function updateItem(id, { name, note }) {
    setLocalItems(prev => prev.map(i => i.id === id ? { ...i, name, note } : i))

    const { error } = await supabase
      .from('stock_items')
      .update({ name, note, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      setLocalItems(itemsRef.current)
      showToast(ERRORS.STATE_UPDATE)
    }
  }

  async function markAllOk(ids) {
    setLocalItems(prev => prev.map(i => ids.includes(i.id) ? { ...i, state: 'OK' } : i))

    const { error } = await supabase
      .from('stock_items')
      .update({ state: 'OK', updated_at: new Date().toISOString() })
      .in('id', ids)

    if (error) {
      setLocalItems(itemsRef.current)
      showToast(ERRORS.STATE_UPDATE)
    }
  }

  async function movePinUp(id) {
    const pinned = sortItems(localItems.filter(i => i.pinned))
    const idx = pinned.findIndex(i => i.id === id)
    if (idx <= 0) return

    const a = pinned[idx]
    const b = pinned[idx - 1]
    const aOrder = b.pin_order
    const bOrder = a.pin_order

    setLocalItems(prev => prev.map(i => {
      if (i.id === a.id) return { ...i, pin_order: aOrder }
      if (i.id === b.id) return { ...i, pin_order: bOrder }
      return i
    }))

    const [err1, err2] = await Promise.all([
      supabase.from('stock_items').update({ pin_order: aOrder, updated_at: new Date().toISOString() }).eq('id', a.id).then(r => r.error),
      supabase.from('stock_items').update({ pin_order: bOrder, updated_at: new Date().toISOString() }).eq('id', b.id).then(r => r.error),
    ])

    if (err1 || err2) {
      setLocalItems(itemsRef.current)
      showToast(ERRORS.STATE_UPDATE)
    }
  }

  async function movePinDown(id) {
    const pinned = sortItems(localItems.filter(i => i.pinned))
    const idx = pinned.findIndex(i => i.id === id)
    if (idx < 0 || idx >= pinned.length - 1) return

    const a = pinned[idx]
    const b = pinned[idx + 1]
    const aOrder = b.pin_order
    const bOrder = a.pin_order

    setLocalItems(prev => prev.map(i => {
      if (i.id === a.id) return { ...i, pin_order: aOrder }
      if (i.id === b.id) return { ...i, pin_order: bOrder }
      return i
    }))

    const [err1, err2] = await Promise.all([
      supabase.from('stock_items').update({ pin_order: aOrder, updated_at: new Date().toISOString() }).eq('id', a.id).then(r => r.error),
      supabase.from('stock_items').update({ pin_order: bOrder, updated_at: new Date().toISOString() }).eq('id', b.id).then(r => r.error),
    ])

    if (err1 || err2) {
      setLocalItems(itemsRef.current)
      showToast(ERRORS.STATE_UPDATE)
    }
  }

  return {
    items, localItems, loading, pendingIds,
    cycleState, togglePin, addItem, markBought, deleteItem,
    updateItem, markAllOk, movePinUp, movePinDown,
  }
}
