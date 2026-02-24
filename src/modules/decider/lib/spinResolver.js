import { selectWinner } from './weightedSelection'

const POINTER_ANGLE = -Math.PI / 2  // 12 o'clock

export function resolveSpinTarget(items, settings, currentWheelAngle, lastWinnerId = null) {
  if (items.length === 0) return null

  const result = selectWinner(items, {
    allowRepeat: settings.allowRepeatWinners ?? true,
    lastWinnerId,
  })
  if (!result) return null

  const totalWeight = items.reduce((s, i) => s + i.weight, 0)

  // Find winner's angular position in the wheel
  let angleStart = 0
  let winnerItem = null
  for (const item of items) {
    if (item.id === result.winnerId) {
      winnerItem = item
      break
    }
    angleStart += (item.weight / totalWeight) * Math.PI * 2
  }
  if (!winnerItem) return null

  const sliceAngle = (winnerItem.weight / totalWeight) * Math.PI * 2

  // Land somewhere in the middle 60% of the slice (avoids landing right on border)
  const landingAngle = angleStart + sliceAngle * (0.2 + Math.random() * 0.6)

  // Geometry: pointer at top (-PI/2). Wheel rotates by totalAngle before drawing.
  // A slice at draw-angle L appears at screen angle (L + totalAngle).
  // For pointer to land on slice: L + totalAngle = POINTER_ANGLE (mod 2PI)
  // So: targetAngle = POINTER_ANGLE - landingAngle (mod 2PI), plus extra rotations
  const TWO_PI = Math.PI * 2
  const desiredTotalAngle = POINTER_ANGLE - landingAngle
  let baseRotation = ((desiredTotalAngle - currentWheelAngle) % TWO_PI + TWO_PI) % TWO_PI

  if (baseRotation < 0.3) baseRotation += TWO_PI

  const extraRads = (settings.extraRotations ?? 5) * TWO_PI
  const targetAngleRad = currentWheelAngle + extraRads + baseRotation

  return {
    winnerId: result.winnerId,
    winnerLabel: result.winnerLabel,
    targetAngleRad,
    durationMs: settings.spinDurationMs ?? 4000,
  }
}
