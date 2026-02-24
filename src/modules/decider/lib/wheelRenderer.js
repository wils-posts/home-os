import { generateSliceColors } from './colorPalette'
import { drawSliceLabel } from './textLayout'

const OVERDRAW = 0.015 // radians — closes anti-alias seams between slices

export function renderStaticWheel(slices, radius, isDark = false, dpr = 1) {
  const diameter = radius * 2
  const canvas = document.createElement('canvas')
  canvas.width = diameter * dpr
  canvas.height = diameter * dpr
  const ctx = canvas.getContext('2d')
  ctx.scale(dpr, dpr)
  const center = radius

  if (slices.length === 0) {
    ctx.beginPath()
    ctx.arc(center, center, radius - 2, 0, Math.PI * 2)
    ctx.fillStyle = isDark ? '#2a2a3e' : '#e8e8ec'
    ctx.fill()
    ctx.fillStyle = isDark ? '#888' : '#999'
    ctx.font = '14px Inter, system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('Add items to spin', center, center)
    return canvas
  }

  const totalWeight = slices.reduce((sum, s) => sum + s.weight, 0)
  const colors = generateSliceColors(slices.length)

  let currentAngle = 0
  for (let i = 0; i < slices.length; i++) {
    const slice = slices[i]
    const sliceAngle = (slice.weight / totalWeight) * Math.PI * 2

    ctx.beginPath()
    ctx.moveTo(center, center)
    ctx.arc(center, center, radius, currentAngle, currentAngle + sliceAngle + OVERDRAW)
    ctx.closePath()
    ctx.fillStyle = colors[i % colors.length]
    ctx.fill()

    drawSliceLabel(ctx, slice.label, center, center, radius, currentAngle, sliceAngle, slices.length)

    currentAngle += sliceAngle
  }

  // Centre dot
  ctx.beginPath()
  ctx.arc(center, center, radius * 0.04, 0, Math.PI * 2)
  ctx.fillStyle = isDark ? '#18181b' : '#f9fafb'
  ctx.fill()

  return canvas
}

// Compute slice boundary angles for tick detection
export function computeSliceBoundaries(slices) {
  const totalWeight = slices.reduce((sum, s) => sum + s.weight, 0)
  const boundaries = []
  let angle = 0
  for (const slice of slices) {
    angle += (slice.weight / totalWeight) * Math.PI * 2
    boundaries.push(angle % (Math.PI * 2))
  }
  return boundaries
}
