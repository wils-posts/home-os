export default function ToastContainer({ toasts }) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-20 left-0 right-0 z-50 flex flex-col gap-2 px-4 pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className="bg-slate-800 text-white text-sm rounded-lg px-4 py-3 shadow-lg animate-fadeSlideUp"
        >
          {toast.message}
        </div>
      ))}
    </div>
  )
}
