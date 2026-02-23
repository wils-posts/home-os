import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStockData } from './hooks/useStockData'
import { useToast } from './hooks/useToast'
import { groupItems, sortItems } from './lib/itemUtils'
import { SECTIONS } from './lib/constants'
import TopBar from '../../shell/TopBar'
import ItemRow from './components/ItemRow'
import SectionAccordion from './components/SectionAccordion'
import AddItemBar from './components/AddItemBar'
import ToastContainer from './components/ToastContainer'

export default function StockView({ auth }) {
  const navigate = useNavigate()
  const { toasts, showToast } = useToast()
  const {
    localItems, loading, pendingIds,
    cycleState, togglePin, addItem, deleteItem,
    updateItem, markAllOk, movePinUp, movePinDown,
  } = useStockData(showToast)

  const [compact, setCompact] = useState(() => localStorage.getItem('compact') === 'true')

  function toggleCompact() {
    setCompact(c => {
      const next = !c
      localStorage.setItem('compact', String(next))
      return next
    })
  }

  const sorted = sortItems(localItems)
  const groups = groupItems(sorted)

  const centreSlot = (
    <span className="text-base font-bold text-white">HomeStock</span>
  )

  const rightSlot = (
    <>
      <button
        onClick={toggleCompact}
        title={compact ? 'Comfortable view' : 'Compact view'}
        className="h-9 w-9 flex items-center justify-center rounded-lg text-slate-400 active:scale-95 transition-transform"
      >
        {compact ? (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <line x1="3" y1="5" x2="21" y2="5"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="13" x2="21" y2="13"/><line x1="3" y1="17" x2="21" y2="17"/><line x1="3" y1="21" x2="21" y2="21"/>
          </svg>
        )}
      </button>

      <button
        onClick={() => navigate('/stock/shopping')}
        className="h-9 px-3 bg-slate-600 text-white rounded-lg text-sm font-medium active:scale-95 transition-transform"
      >
        Shop
      </button>

      <button
        onClick={auth.signOut}
        className="h-9 px-3 rounded-lg border border-slate-600 text-slate-400 text-sm active:scale-95 transition-transform"
      >
        Out
      </button>
    </>
  )

  return (
    <div
      className="bg-slate-900 text-slate-100 max-w-md mx-auto flex flex-col"
      style={{ height: '100dvh' }}
    >
      <TopBar centre={centreSlot} right={rightSlot} />

      <main className="flex-1 overflow-y-auto pb-20">
        {loading ? (
          <div className="flex justify-center pt-16">
            <div className="w-8 h-8 border-4 border-slate-600 border-t-slate-300 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {SECTIONS.map(section => {
              const sectionItems = groups[section.key] ?? []
              const isPinned = section.key === 'pinned'
              return (
                <SectionAccordion
                  key={section.key}
                  title={section.label}
                  items={sectionItems}
                  defaultOpen={section.defaultOpen}
                  onMarkAllOk={['need', 'low'].includes(section.key)
                    ? () => markAllOk(sectionItems.map(i => i.id))
                    : undefined}
                >
                  {sectionItems.map((item, idx) => (
                    <ItemRow
                      key={item.id}
                      item={item}
                      onCycleState={cycleState}
                      onTogglePin={togglePin}
                      onDelete={deleteItem}
                      onUpdate={updateItem}
                      onMoveUp={isPinned ? () => movePinUp(item.id) : undefined}
                      onMoveDown={isPinned ? () => movePinDown(item.id) : undefined}
                      isFirst={isPinned && idx === 0}
                      isLast={isPinned && idx === sectionItems.length - 1}
                      pending={pendingIds.has(item.id)}
                      compact={compact}
                    />
                  ))}
                </SectionAccordion>
              )
            })}
            {localItems.length === 0 && (
              <p className="text-center text-slate-400 text-sm pt-12">
                No items yet. Add one below.
              </p>
            )}
          </>
        )}
      </main>

      <AddItemBar onAdd={addItem} />
      <ToastContainer toasts={toasts} />
    </div>
  )
}
