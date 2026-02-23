import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStockData } from './hooks/useStockData'
import { useToast } from './hooks/useToast'
import { sortItems } from './lib/itemUtils'
import { STATE_COLORS, STATE_LABELS } from './lib/constants'
import ToastContainer from './components/ToastContainer'

const STORAGE_KEY = 'shoppingBoughtIds'

function loadBoughtIds() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? new Set(JSON.parse(saved)) : new Set()
  } catch {
    return new Set()
  }
}

function saveBoughtIds(set) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]))
}

export default function ShoppingView() {
  const navigate = useNavigate()
  const { toasts, showToast } = useToast()
  const { localItems, loading, markBought } = useStockData(showToast)
  const [boughtIds, setBoughtIds] = useState(loadBoughtIds)

  const sorted = sortItems(localItems)
  const shoppingItems = sorted.filter(i => i.pinned || i.state === 'NEED' || i.state === 'LOW')
  const activeItems = shoppingItems.filter(i => !boughtIds.has(i.id))
  const boughtItems = shoppingItems.filter(i => boughtIds.has(i.id))

  function updateBoughtIds(updater) {
    setBoughtIds(prev => {
      const next = updater(prev)
      saveBoughtIds(next)
      return next
    })
  }

  function toggleBought(id) {
    updateBoughtIds(prev => {
      const s = new Set(prev)
      s.has(id) ? s.delete(id) : s.add(id)
      return s
    })
  }

  async function finishShop() {
    if (boughtIds.size === 0) return
    await markBought([...boughtIds])
    localStorage.removeItem(STORAGE_KEY)
    navigate('/stock')
  }

  function cancelShop() {
    localStorage.removeItem(STORAGE_KEY)
    navigate('/stock')
  }

  return (
    <div className="bg-slate-900 min-h-screen pb-24 max-w-md mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 bg-slate-900 border-b border-slate-700">
        <h1 className="text-lg font-bold text-slate-100">Shopping</h1>
        <button
          onClick={cancelShop}
          className="h-9 px-3 rounded-lg border border-slate-600 text-slate-400 text-sm active:scale-95 transition-transform"
        >
          Cancel
        </button>
      </header>

      <main className="pt-2">
        {loading ? (
          <div className="flex justify-center pt-16">
            <div className="w-8 h-8 border-4 border-slate-600 border-t-slate-300 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {activeItems.length > 0 && (
              <div className="bg-slate-800 mb-2">
                {activeItems.map(item => (
                  <ShoppingRow
                    key={item.id}
                    item={item}
                    bought={false}
                    onToggle={() => toggleBought(item.id)}
                  />
                ))}
              </div>
            )}

            {boughtItems.length > 0 && (
              <div className="mb-2">
                <div className="px-4 py-2 bg-slate-800">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Bought this trip
                  </span>
                </div>
                <div className="bg-slate-800">
                  {boughtItems.map(item => (
                    <ShoppingRow
                      key={item.id}
                      item={item}
                      bought={true}
                      onToggle={() => toggleBought(item.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {shoppingItems.length === 0 && (
              <p className="text-center text-slate-400 text-sm pt-12">
                Nothing to shop for right now.
              </p>
            )}
          </>
        )}
      </main>

      {/* Bottom actions */}
      <div className="fixed bottom-0 left-0 right-0 flex gap-3 px-4 py-3 bg-slate-900 border-t border-slate-700">
        <button
          onClick={cancelShop}
          className="flex-1 h-12 rounded-xl border border-slate-600 text-slate-300 font-semibold text-sm active:scale-95 transition-transform"
        >
          Cancel
        </button>
        <button
          onClick={finishShop}
          disabled={boughtIds.size === 0}
          className="flex-1 h-12 rounded-xl bg-ok text-white font-semibold text-sm disabled:opacity-40 active:scale-95 transition-transform"
        >
          Finish Shop {boughtIds.size > 0 && `(${boughtIds.size})`}
        </button>
      </div>

      <ToastContainer toasts={toasts} />
    </div>
  )
}

function ShoppingRow({ item, bought, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-3 px-4 py-3 border-b border-slate-700 last:border-b-0 text-left active:bg-slate-700 transition-colors"
    >
      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors
        ${bought ? 'border-ok bg-ok' : 'border-slate-500'}`}
      >
        {bought && (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-3.5 h-3.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className={`font-medium truncate ${bought ? 'line-through text-slate-500' : 'text-slate-100'}`}>
          {item.name}
        </p>
        {item.note && (
          <p className="text-sm text-slate-400 truncate">{item.note}</p>
        )}
      </div>

      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATE_COLORS[item.state] ?? ''}`}>
        {STATE_LABELS[item.state] ?? item.state}
      </span>
    </button>
  )
}
