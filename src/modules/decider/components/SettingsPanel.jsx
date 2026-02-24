export default function SettingsPanel({ settings, onUpdate, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/50" onClick={onClose} />

      {/* Panel */}
      <div className="w-72 bg-[var(--surface-1)] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--border-subtle)]">
          <h2 className="font-semibold text-[var(--text-heading)]">Settings</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-[var(--text-muted)] active:scale-95 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-5">

          {/* Spin duration */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)] block mb-1">Spin Duration</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={settings.spinDurationMs}
                min={1000}
                max={10000}
                step={500}
                onChange={e => onUpdate({ spinDurationMs: parseInt(e.target.value) || 4000 })}
                className="w-24 h-9 px-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-2)] text-[var(--text-primary)] text-sm text-center focus:outline-none focus:ring-1 focus:ring-[var(--ring-focus)]"
              />
              <span className="text-sm text-[var(--text-muted)]">ms</span>
            </div>
          </div>

          {/* Allow repeat winners */}
          <ToggleSetting
            label="Allow Repeat Winners"
            value={settings.allowRepeatWinners}
            onChange={v => onUpdate({ allowRepeatWinners: v })}
          />

          {/* Sound effects */}
          <ToggleSetting
            label="Sound Effects"
            value={settings.soundEnabled}
            onChange={v => onUpdate({ soundEnabled: v })}
          />

          {/* Celebration animation */}
          <ToggleSetting
            label="Celebration Animation"
            value={settings.celebrationEnabled}
            onChange={v => onUpdate({ celebrationEnabled: v })}
          />

        </div>
      </div>
    </div>
  )
}

function ToggleSetting({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-[var(--text-primary)]">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${value ? 'bg-ok' : 'bg-[var(--surface-2)]'}`}
      >
        <span className={`absolute top-1 left-0 w-4 h-4 rounded-full bg-white shadow transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  )
}
