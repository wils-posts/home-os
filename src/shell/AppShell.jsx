import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../shared/useAuth'
import LoginView from '../shared/components/LoginView'
import HomeScreen from './HomeScreen'
import PlannerView from '../modules/planner/PlannerView'
import StockView from '../modules/stock/StockView'
import ShoppingView from '../modules/stock/ShoppingView'

export default function AppShell() {
  const auth = useAuth()

  if (auth.status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="w-8 h-8 border-4 border-slate-600 border-t-slate-300 rounded-full animate-spin" />
      </div>
    )
  }

  if (auth.status === 'unauthenticated') {
    return <LoginView auth={auth} />
  }

  if (auth.status === 'blocked') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center bg-slate-900">
        <p className="text-white font-medium mb-2">Access denied</p>
        <p className="text-slate-400 text-sm mb-8">
          You're signed in but not authorised for this household.
        </p>
        <button
          onClick={auth.signOut}
          className="px-6 py-2 rounded-lg border border-slate-600 text-slate-400 text-sm font-medium active:scale-95 transition-transform"
        >
          Sign out
        </button>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<HomeScreen />} />
      <Route path="/planner" element={<PlannerView auth={auth} />} />
      <Route path="/stock" element={<StockView auth={auth} />} />
      <Route path="/stock/shopping" element={<ShoppingView auth={auth} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
