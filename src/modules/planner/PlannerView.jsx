import { useState, useEffect } from 'react'
import { usePlannerData } from './hooks/usePlannerData'
import TopBar from '../../shell/TopBar'
import CalendarGrid from './components/CalendarGrid'
import DayPad from './components/DayPad'
import { getTodayStr, getMonthLabel } from './utils/dateUtils'

export default function PlannerView({ auth }) {
  const todayStr = getTodayStr()
  const [toast, setToast] = useState(null)

  const {
    calendarId,
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
  } = usePlannerData()

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  function goToToday() {
    const today = new Date()
    setViewYear(today.getFullYear())
    setViewMonth(today.getMonth())
    setSelectedDay(getTodayStr())
  }

  const centreSlot = (
    <div className="flex items-center">
      <NavBtn onClick={prevMonth}>‹</NavBtn>
      <button
        onClick={goToToday}
        className="text-sm font-semibold text-[var(--text-heading)] px-2 text-center whitespace-nowrap"
      >
        {getMonthLabel(viewYear, viewMonth)}
      </button>
      <NavBtn onClick={nextMonth}>›</NavBtn>
    </div>
  )

  const rightSlot = (
    <button
      disabled
      aria-label="Notifications (coming soon)"
      className="h-9 w-9 rounded-lg border border-[var(--border-subtle)] text-[var(--text-muted)] flex items-center justify-center opacity-50"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    </button>
  )

  return (
    <div
      className="overflow-hidden flex flex-col bg-[var(--surface-0)] text-[var(--text-primary)] max-w-md mx-auto"
      style={{ height: '100dvh' }}
    >
      <TopBar centre={centreSlot} right={rightSlot} />

      {/* Calendar — fixed 340px height */}
      <div className="shrink-0 overflow-hidden px-2 pb-2 pt-1 bg-[var(--surface-1)]" style={{ height: '340px' }}>
        <CalendarGrid
          viewYear={viewYear}
          viewMonth={viewMonth}
          selectedDay={selectedDay}
          todayStr={todayStr}
          onDaySelect={setSelectedDay}
          monthData={monthData}
        />
      </div>

      {/* Day pad — takes all remaining space */}
      <div className="flex-1 overflow-hidden">
        <DayPad
          calendarId={calendarId}
          selectedDay={selectedDay}
          session={auth.session}
          entries={entries}
          notes={notes}
          onRefetch={refetchAll}
          onToast={setToast}
        />
      </div>

      {toast && (
        <PlannerToast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  )
}

function NavBtn({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="text-[var(--text-muted)] active:text-[var(--text-heading)] text-xl leading-none w-9 h-9 flex items-center justify-center"
    >
      {children}
    </button>
  )
}

function PlannerToast({ message, type = 'error', onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3000)
    return () => clearTimeout(t)
  }, [message, onDismiss])

  const colors = {
    error: 'bg-red-600 text-white',
    success: 'bg-green-600 text-white',
    info: 'bg-[var(--surface-2)] text-[var(--text-heading)]',
  }

  return (
    <div className={`fixed bottom-6 left-4 right-4 z-50 rounded-lg px-4 py-3 text-sm font-medium ${colors[type] || colors.info}`}>
      {message}
    </div>
  )
}
