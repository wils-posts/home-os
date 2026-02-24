const LABEL_FONT_FAMILY = 'Inter, system-ui, sans-serif'
const LABEL_MAX_WIDTH_RATIO = 0.38
const MIN_SLICE_ARC_FOR_LABEL = 20

// Returns a consistent font size based on how many slices there are
function getFontSize(sliceCount) {
  if (sliceCount <= 4) return 14
  if (sliceCount <= 6) return 13
  if (sliceCount <= 8) return 12
  return 11
}

export function drawSliceLabel(ctx, label, centerX, centerY, radius, startAngle, sliceAngle, sliceCount = 8) {
  const arcLength = sliceAngle * radius
  if (arcLength < MIN_SLICE_ARC_FOR_LABEL) return

  const midAngle = startAngle + sliceAngle / 2
  const maxLabelWidth = radius * LABEL_MAX_WIDTH_RATIO
  const fontSize = getFontSize(sliceCount)

  ctx.font = `600 ${fontSize}px ${LABEL_FONT_FAMILY}`

  let displayLabel = label
  while (displayLabel.length > 1 && ctx.measureText(displayLabel).width > maxLabelWidth) {
    displayLabel = displayLabel.slice(0, -1)
  }
  if (displayLabel !== label) {
    while (displayLabel.length > 1 && ctx.measureText(displayLabel + '…').width > maxLabelWidth) {
      displayLabel = displayLabel.slice(0, -1)
    }
    displayLabel += '…'
  }

  const labelRadius = radius * 0.55
  const x = centerX + Math.cos(midAngle) * labelRadius
  const y = centerY + Math.sin(midAngle) * labelRadius

  ctx.save()
  ctx.translate(x, y)

  let textAngle = midAngle
  if (midAngle > Math.PI / 2 && midAngle < (3 * Math.PI) / 2) {
    textAngle += Math.PI
  }
  ctx.rotate(textAngle)

  ctx.fillStyle = 'rgba(255,255,255,0.92)'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(displayLabel, 0, 0)
  ctx.restore()
}
