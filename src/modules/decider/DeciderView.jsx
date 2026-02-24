import { useState, useRef, useCallback } from 'react'
import TopBar from '../../shell/TopBar'
import { useDeciderData } from './hooks/useDeciderData'
import WheelCanvas from './components/WheelCanvas'
import CelebrationOverlay from './components/CelebrationOverlay'
import ProfileSelector from './components/ProfileSelector'
import ItemsList from './components/ItemsList'
import SettingsPanel from './components/SettingsPanel'
import { startWheelAnimation, easeOutQuint } from './lib/wheelAnimator'
import { resolveSpinTarget } from './lib/spinResolver'
import { computeSliceBoundaries } from './lib/wheelRenderer'
import { soundManager } from './lib/soundManager'

export default function DeciderView() {
  const {
    profiles, activeProfile, activeProfileId, items, settings, loading,
    switchActiveProfile, createProfile, renameProfile, deleteProfile,
    addItem, updateItem, deleteItem, updateSettings,
  } = useDeciderData()

  const [currentAngle, setCurrentAngle] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [winner, setWinner] = useState(null)
  const [celebrating, setCelebrating] = useState(false)
  const [wheelSize, setWheelSize] = useState(0)
  const [showSettings, setShowSettings] = useState(false)

  const lastWinnerIdRef = useRef(null)
  const cancelAnimRef = useRef(null)
  const currentAngleRef = useRef(0)

  const handleFrame = useCallback((angle) => {
    currentAngleRef.current = angle
    setCurrentAngle(angle)
  }, [])

  async function handleSpin() {
    if (spinning || items.length < 2) return

    await soundManager.initialize()

    const resolution = resolveSpinTarget(items, settings, currentAngleRef.current, lastWinnerIdRef.current)
    if (!resolution) return

    setSpinning(true)
    setWinner(null)
    setCelebrating(false)

    const sliceBoundaries = computeSliceBoundaries(items)

    cancelAnimRef.current = startWheelAnimation({
      startAngle: currentAngleRef.current,
      targetAngle: resolution.targetAngleRad,
      durationMs: resolution.durationMs,
      easingFn: easeOutQuint,
      onFrame: handleFrame,
      sliceBoundaries,
      onTick: () => {
        if (settings.soundEnabled) soundManager.playTick()
      },
      onComplete: () => {
        currentAngleRef.current = resolution.targetAngleRad
        setSpinning(false)
        setWinner(resolution.winnerLabel)
        lastWinnerIdRef.current = resolution.winnerId
        if (settings.celebrationEnabled) {
          setCelebrating(true)
          setTimeout(() => setCelebrating(false), 2600)
        }
        if (settings.soundEnabled && settings.celebrationEnabled) {
          soundManager.playCelebration()
        }
      },
    })
  }

  const rightSlot = (
    <button
      onClick={() => setShowSettings(true)}
      aria-label="Settings"
      className="h-9 w-9 flex items-center justify-center rounded-lg border border-[var(--border-subtle)] text-[var(--text-muted)] active:scale-95 transition-transform"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    </button>
  )

  return (
    <div className="bg-[var(--surface-0)] text-[var(--text-primary)] max-w-md mx-auto flex flex-col" style={{ height: '100dvh' }}>
      <TopBar centre={null} right={rightSlot} />

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[var(--spinner-track)] border-t-[var(--spinner-head)] rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Profile selector */}
          <ProfileSelector
            profiles={profiles}
            activeProfileId={activeProfileId}
            onSwitch={switchActiveProfile}
            onCreate={createProfile}
            onRename={renameProfile}
            onDelete={deleteProfile}
          />

          <div className="flex-1 overflow-y-auto">
            {/* Wheel area */}
            <div className="px-4 pt-4 pb-2 relative">
              <WheelCanvas
                items={items}
                currentAngle={currentAngle}
                onSizeChange={setWheelSize}
              />
              {celebrating && wheelSize > 0 && (
                <div className="absolute inset-x-4 top-4" style={{ height: wheelSize }}>
                  <CelebrationOverlay active={celebrating} width={wheelSize} height={wheelSize} />
                </div>
              )}
            </div>

            {/* Spin button */}
            <div className="px-4 pb-3 flex flex-col items-center gap-3">
              <button
                onClick={handleSpin}
                disabled={spinning || items.length < 2}
                className="w-full max-w-xs h-12 rounded-2xl bg-[var(--action-surface)] text-[var(--text-heading)] font-bold text-lg tracking-widest uppercase disabled:opacity-40 active:scale-95 transition-transform"
              >
                {spinning ? 'Spinning…' : 'Spin'}
              </button>

              {/* Winner display */}
              {winner && !spinning && (
                <div className="text-center py-1">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">Winner</p>
                  <p className="text-xl font-bold text-[var(--text-heading)] mt-0.5">{winner}</p>
                </div>
              )}

              {items.length < 2 && (
                <p className="text-sm text-[var(--text-muted)] italic text-center">Add at least 2 items to spin</p>
              )}
            </div>

            {/* Items list */}
            <ItemsList
              items={items}
              onAdd={addItem}
              onUpdate={updateItem}
              onDelete={deleteItem}
            />
          </div>
        </>
      )}

      {/* Settings panel */}
      {showSettings && (
        <SettingsPanel
          settings={settings}
          onUpdate={updateSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}
