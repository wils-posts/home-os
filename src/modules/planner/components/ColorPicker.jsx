const COLORS = [
  { id: 'blue', bg: 'bg-blue-500', ring: 'ring-blue-400', label: 'C' },
  { id: 'green', bg: 'bg-green-500', ring: 'ring-green-400', label: 'S' },
  { id: 'red', bg: 'bg-red-500', ring: 'ring-red-400', label: 'A' },
]

export default function ColorPicker({ activeColor, onChange }) {
  return (
    <div className="flex gap-4 items-center">
      {COLORS.map(({ id, bg, ring, label }) => (
        <button
          key={id}
          aria-label={label}
          onClick={() => onChange(id)}
          className={`w-9 h-9 rounded-full ${bg} text-white text-sm font-bold flex items-center justify-center transition-all ${
            activeColor === id
              ? `ring-2 ring-offset-2 ring-offset-zinc-900 ${ring} scale-110`
              : 'opacity-40'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
