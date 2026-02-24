const LABEL_FONT_FAMILY = 'Inter, system-ui, sans-serif'
const LABEL_FONT_SIZE_MAX = 15
const LABEL_FONT_SIZE_MIN = 10
const LABEL_MAX_WIDTH_RATIO = 0.38
const MIN_SLICE_ARC_FOR_LABEL = 20

export function drawSliceLabel(ctx, label, centerX, centerY, radius, startAngle, sliceAngle) {
  const arcLength = sliceAngle * radius
  if (arcLength < MIN_SLICE_ARC_FOR_LABEL) return

  const midAngle = startAngle + sliceAngle / 2
  const maxLabelWidth = radius * LABEL_MAX_WIDTH_RATIO

  let fontSize = LABEL_FONT_SIZE_MAX
  ctx.font = `600 ${fontSize}px ${LABEL_FONT_FAMILY}`

  let displayLabel = label
  let measured = ctx.measureText(displayLabel)

  while (measured.width > maxLabelWidth && fontSize > LABEL_FONT_SIZE_MIN) {
    fontSize -= 1
    ctx.font = `600 ${fontSize}px ${LABEL_FONT_FAMILY}`
    measured = ctx.measureText(displayLabel)
  }

  if (measured.width > maxLabelWidth) {
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
