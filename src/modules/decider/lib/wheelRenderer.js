import { generateSliceColors, getNativeSliceColors } from './colorPalette'
import { drawSliceLabel } from './textLayout'

const SLICE_BORDER_WIDTH = 1.5
const SLICE_BORDER_COLOR = 'rgba(0,0,0,0.15)'

export function renderStaticWheel(slices, radius, isDark = false, colourMode = 'multi', dpr = 1) {
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
  const colors = colourMode === 'native'
    ? getNativeSliceColors(slices.length)
    : generateSliceColors(slices.length, isDark)

  let currentAngle = 0
  for (let i = 0; i < slices.length; i++) {
    const slice = slices[i]
    const sliceAngle = (slice.weight / totalWeight) * Math.PI * 2

    ctx.beginPath()
    ctx.moveTo(center, center)
    ctx.arc(center, center, radius - 2, currentAngle, currentAngle + sliceAngle)
    ctx.closePath()
    ctx.fillStyle = colors[i % colors.length]
    ctx.fill()

    ctx.strokeStyle = SLICE_BORDER_COLOR
    ctx.lineWidth = SLICE_BORDER_WIDTH
    ctx.stroke()

    drawSliceLabel(ctx, slice.label, center, center, radius, currentAngle, sliceAngle)

    currentAngle += sliceAngle
  }

  // Centre circle
  ctx.beginPath()
  ctx.arc(center, center, radius * 0.06, 0, Math.PI * 2)
  ctx.fillStyle = isDark ? '#1a1a2e' : '#ffffff'
  ctx.fill()
  ctx.strokeStyle = isDark ? '#444' : '#ccc'
  ctx.lineWidth = 2
  ctx.stroke()

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
