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
    updateItem, movePinUp, movePinDown,
  } = useStockData(showToast)

  const sorted = sortItems(localItems)
  const groups = groupItems(sorted)

  const centreSlot = null

  const rightSlot = (
    <button
      onClick={() => navigate('/stock/shopping')}
      className="h-9 px-3 bg-[var(--action-surface)] text-[var(--text-heading)] rounded-lg text-sm font-medium active:scale-95 transition-transform"
    >
      Shop
    </button>
  )

  return (
    <div
      className="bg-[var(--surface-0)] text-[var(--text-primary)] max-w-md mx-auto flex flex-col"
      style={{ height: '100dvh' }}
    >
      <TopBar centre={centreSlot} right={rightSlot} />

      <main className="flex-1 overflow-y-auto pb-20">
        {loading ? (
          <div className="flex justify-center pt-16">
            <div className="w-8 h-8 border-4 border-[var(--spinner-track)] border-t-[var(--spinner-head)] rounded-full animate-spin" />
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
                      compact={true}
                    />
                  ))}
                </SectionAccordion>
              )
            })}
            {localItems.length === 0 && (
              <p className="text-center text-[var(--text-muted)] text-sm pt-12">
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
