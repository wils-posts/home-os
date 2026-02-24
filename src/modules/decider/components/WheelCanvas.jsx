import { useRef, useEffect, useCallback } from 'react'
import { renderStaticWheel, computeSliceBoundaries } from '../lib/wheelRenderer'

export default function WheelCanvas({ items, currentAngle, onSizeChange }) {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const staticWheelRef = useRef(null)
  const sizeRef = useRef(0)

  const isDark = document.documentElement.classList.contains('theme-dark')

  // Rebuild static wheel whenever items or colour mode changes
  useEffect(() => {
    const size = sizeRef.current
    if (size === 0) return
    const dpr = window.devicePixelRatio || 1
    const radius = size / 2
    staticWheelRef.current = renderStaticWheel(items, radius, isDark, dpr)
  }, [items, isDark])

  // Draw current frame
  const draw = useCallback((angle) => {
    const canvas = canvasRef.current
    if (!canvas || !staticWheelRef.current) return
    const size = sizeRef.current
    const dpr = window.devicePixelRatio || 1
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, size * dpr, size * dpr)

    const centerPx = size / 2 * dpr

    // Draw rotating wheel — offscreen canvas is size*dpr × size*dpr physical pixels
    ctx.save()
    ctx.translate(centerPx, centerPx)
    ctx.rotate(angle)
    ctx.drawImage(staticWheelRef.current, -centerPx, -centerPx, size * dpr, size * dpr)
    ctx.restore()

    // Draw fixed pointer (red triangle, base at top, tip pointing down into wheel)
    const pW = size * 0.05 * dpr
    const pH = size * 0.065 * dpr
    ctx.save()
    ctx.translate(centerPx, 0)
    ctx.beginPath()
    ctx.moveTo(0, pH)          // tip points down into wheel
    ctx.lineTo(-pW / 2, 0)    // top-left corner
    ctx.lineTo(pW / 2, 0)     // top-right corner
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
      const dpr = window.devicePixelRatio || 1
      const canvas = canvasRef.current
      if (canvas) {
        canvas.width = size * dpr
        canvas.height = size * dpr
      }

      const radius = size / 2
      staticWheelRef.current = renderStaticWheel(items, radius, isDark, dpr)
      draw(currentAngle)

      if (onSizeChange) onSizeChange(size)
    })

    observer.observe(container)
    return () => observer.disconnect()
  }, [items, isDark, currentAngle, draw, onSizeChange])

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
