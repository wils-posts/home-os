import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../../../shared/supabaseClient'
import { getTodayStr, getMonthRangePadded } from '../utils/dateUtils'

const CALENDAR_ID = '00000000-0000-0000-0000-000000000001'

export function usePlannerData() {
  const today = getTodayStr()

  const [viewYear, setViewYear] = useState(() => new Date().getFullYear())
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth())
  const [selectedDay, setSelectedDay] = useState(today)

  const [monthData, setMonthData] = useState({})
  const [entries, setEntries] = useState([])
  const [notes, setNotes] = useState('')

  const selectedDayRef = useRef(selectedDay)
  selectedDayRef.current = selectedDay

  const fetchMonth = useCallback(async () => {
    const { start, end } = getMonthRangePadded(viewYear, viewMonth)

    const [entriesRes, notesRes] = await Promise.all([
      supabase
        .from('planner_day_entries')
        .select('day, color')
        .eq('calendar_id', CALENDAR_ID)
        .gte('day', start)
        .lte('day', end),
      supabase
        .from('planner_day_notes')
        .select('day, notes')
        .eq('calendar_id', CALENDAR_ID)
        .gte('day', start)
        .lte('day', end),
    ])

    const data = {}
    if (entriesRes.data) {
      for (const row of entriesRes.data) {
        if (!data[row.day]) data[row.day] = { colors: [], hasNotes: false }
        if (!data[row.day].colors.includes(row.color)) {
          data[row.day].colors.push(row.color)
        }
      }
    }
    if (notesRes.data) {
      for (const row of notesRes.data) {
        if (row.notes && row.notes.trim().length > 0) {
          if (!data[row.day]) data[row.day] = { colors: [], hasNotes: false }
          data[row.day].hasNotes = true
        }
      }
    }

    setMonthData(data)
  }, [viewYear, viewMonth])

  const fetchDay = useCallback(async () => {
    const day = selectedDayRef.current
    if (!day) return

    const [entriesRes, notesRes] = await Promise.all([
      supabase
        .from('planner_day_entries')
        .select('id, color, text, created_at, created_by, batch_id')
        .eq('calendar_id', CALENDAR_ID)
        .eq('day', day)
        .order('created_at', { ascending: true }),
      supabase
        .from('planner_day_notes')
        .select('notes')
        .eq('calendar_id', CALENDAR_ID)
        .eq('day', day)
        .maybeSingle(),
    ])

    setEntries(entriesRes.data || [])
    setNotes(notesRes.data?.notes || '')
  }, [])

  const refetchAll = useCallback(() => {
    fetchMonth()
    fetchDay()
  }, [fetchMonth, fetchDay])

  useEffect(() => {
    fetchMonth()
  }, [fetchMonth])

  useEffect(() => {
    fetchDay()
  }, [fetchDay, selectedDay])

  useEffect(() => {
    const channel = supabase
      .channel(`planner-${CALENDAR_ID}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'planner_day_entries',
          filter: `calendar_id=eq.${CALENDAR_ID}`,
        },
        () => refetchAll()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'planner_day_notes',
          filter: `calendar_id=eq.${CALENDAR_ID}`,
        },
        () => refetchAll()
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [refetchAll])

  return {
    calendarId: CALENDAR_ID,
    monthData,
    entries,
    notes,
    viewYear,
    viewMonth,
    selectedDay,
    setViewYear,
    setViewMonth,
    setSelectedDay,
    refetchAll,
  }
}
