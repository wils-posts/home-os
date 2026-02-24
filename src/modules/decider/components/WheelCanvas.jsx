import { useRef, useEffect, useCallback } from 'react'
import { renderStaticWheel, computeSliceBoundaries } from '../lib/wheelRenderer'

export default function WheelCanvas({ items, currentAngle, onSizeChange, colourMode }) {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const staticWheelRef = useRef(null)
  const sizeRef = useRef(0)

  const isDark = document.documentElement.classList.contains('theme-dark')

  // Rebuild static wheel whenever items or colour mode changes
  useEffect(() => {
    const size = sizeRef.current
    if (size === 0) return
    const radius = size / 2
    staticWheelRef.current = renderStaticWheel(items, radius, isDark, colourMode)
  }, [items, isDark, colourMode])

  // Draw current frame
  const draw = useCallback((angle) => {
    const canvas = canvasRef.current
    if (!canvas || !staticWheelRef.current) return
    const size = sizeRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, size, size)

    const center = size / 2

    // Draw rotating wheel
    ctx.save()
    ctx.translate(center, center)
    ctx.rotate(angle)
    ctx.drawImage(staticWheelRef.current, -center, -center)
    ctx.restore()

    // Draw fixed pointer (red triangle at top)
    const pW = size * 0.045
    const pH = size * 0.07
    ctx.save()
    ctx.translate(center, 4)
    ctx.beginPath()
    ctx.moveTo(0, pH)
    ctx.lineTo(-pW / 2, 0)
    ctx.lineTo(pW / 2, 0)
    ctx.closePath()
    ctx.fillStyle = '#ef4444'
    ctx.fill()
    ctx.restore()
  }, [])

  // Re-draw on angle change
  useEffect(() => {
    draw(currentAngle)
  }, [currentAngle, draw])

  // ResizeObserver — keep canvas square
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new ResizeObserver(entries => {
      const entry = entries[0]
      const { width } = entry.contentRect
      const size = Math.floor(width)
      if (size === sizeRef.current) return

      sizeRef.current = size
      const canvas = canvasRef.current
      if (canvas) {
        canvas.width = size
        canvas.height = size
      }

      const radius = size / 2
      staticWheelRef.current = renderStaticWheel(items, radius, isDark, colourMode)
      draw(currentAngle)

      if (onSizeChange) onSizeChange(size)
    })

    observer.observe(container)
    return () => observer.disconnect()
  }, [items, isDark, colourMode, currentAngle, draw, onSizeChange])

  return (
    <div ref={containerRef} className="relative w-full" style={{ aspectRatio: '1' }}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  )
}

export { computeSliceBoundaries }
