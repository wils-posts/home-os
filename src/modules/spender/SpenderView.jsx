import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TopBar from '../../shell/TopBar'
import { useSpenderData } from './hooks/useSpenderData'
import SetBudgetModal from './components/SetBudgetModal'
import BudgetHeader from './components/BudgetHeader'
import EntryRow from './components/EntryRow'
import AddEntryBar from './components/AddEntryBar'
import CloseMonthSheet from './components/CloseMonthSheet'

export default function SpenderView() {
  const navigate = useNavigate()
  const {
    activePeriod,
    entries,
    loading,
    totalSpent,
    remaining,
    startPeriod,
    updateBudget,
    addEntry,
    deleteEntry,
    closePeriod,
  } = useSpenderData()

  const [showClose, setShowClose] = useState(false)
  const [showNewBudget, setShowNewBudget] = useState(false)
  const [previousBudget, setPreviousBudget] = useState(null)

  async function handleClosePeriod(pushToSavings) {
    setPreviousBudget(activePeriod?.budget_amount)
    await closePeriod(pushToSavings)
    setShowClose(false)
    setShowNewBudget(true)
  }

  async function handleStartPeriod(amount) {
    await startPeriod(amount)
    setShowNewBudget(false)
    setPreviousBudget(null)
  }

  const rightSlot = (
    <div className="flex items-center gap-1">
      <button
        onClick={() => navigate('/spender/archive')}
        aria-label="Past months"
        className="h-9 w-9 flex items-center justify-center rounded-lg border border-[var(--border-subtle)] text-[var(--text-muted)] active:scale-95 transition-transform"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="21 8 21 21 3 21 3 8" />
          <rect x="1" y="3" width="22" height="5" />
          <line x1="10" y1="12" x2="14" y2="12" />
        </svg>
      </button>
      <button
        onClick={() => setShowClose(true)}
        className="h-9 px-3 rounded-lg border border-[var(--border-subtle)] text-[var(--text-muted)] text-xs font-medium active:scale-95 transition-transform"
      >
        Close month
      </button>
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--surface-0)]">
        <div className="w-8 h-8 border-4 border-[var(--spinner-track)] border-t-[var(--spinner-head)] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div
      className="bg-[var(--surface-0)] text-[var(--text-primary)] max-w-md mx-auto flex flex-col overflow-hidden"
      style={{ height: '100dvh' }}
    >
      <TopBar centre={null} right={activePeriod && !showNewBudget ? rightSlot : null} />

      {!activePeriod && !showNewBudget && (
        <SetBudgetModal onStart={startPeriod} />
      )}

      {showNewBudget && (
        <SetBudgetModal onStart={handleStartPeriod} previousBudget={previousBudget} />
      )}

      {activePeriod && !showNewBudget && (
        <>
          <BudgetHeader
            remaining={remaining}
            budget={activePeriod.budget_amount}
            totalSpent={totalSpent}
            onUpdateBudget={updateBudget}
          />

          <div className="flex-1 overflow-y-auto min-h-0">
            {entries.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-6 pb-20">
                <p className="text-[var(--text-muted)] text-sm">No spending logged yet.</p>
                <p className="text-[var(--text-muted)] text-xs mt-1">Add your first entry below.</p>
              </div>
            ) : (
              entries.map(entry => (
                <EntryRow key={entry.id} entry={entry} onDelete={deleteEntry} />
              ))
            )}
          </div>

          <AddEntryBar onAdd={addEntry} />
        </>
      )}

      {showClose && activePeriod && (
        <CloseMonthSheet
          remaining={remaining}
          onConfirm={handleClosePeriod}
          onCancel={() => setShowClose(false)}
        />
      )}
    </div>
  )
}
