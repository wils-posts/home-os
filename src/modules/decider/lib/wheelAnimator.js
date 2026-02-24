export function easeOutQuint(t) {
  return 1 - Math.pow(1 - t, 5)
}

export function startWheelAnimation({ startAngle, targetAngle, durationMs, onFrame, onTick, sliceBoundaries, onComplete }) {
  let startTime = null
  let rafId
  let lastSliceIndex = -1

  function frame(timestamp) {
    if (startTime === null) startTime = timestamp
    const elapsed = timestamp - startTime
    const t = Math.min(elapsed / durationMs, 1)
    const easedT = easeOutQuint(t)
    const currentAngle = startAngle + (targetAngle - startAngle) * easedT

    onFrame(currentAngle)

    // Tick detection — fire when crossing a slice boundary
    if (onTick && sliceBoundaries && sliceBoundaries.length > 0) {
      const TWO_PI = Math.PI * 2
      const normalizedAngle = ((currentAngle % TWO_PI) + TWO_PI) % TWO_PI
      let currentSliceIndex = 0
      for (let i = 0; i < sliceBoundaries.length; i++) {
        if (normalizedAngle >= sliceBoundaries[i]) {
          currentSliceIndex = i + 1
        }
      }
      if (currentSliceIndex !== lastSliceIndex) {
        lastSliceIndex = currentSliceIndex
        onTick(currentSliceIndex)
      }
    }

    if (t < 1) {
      rafId = requestAnimationFrame(frame)
    } else {
      onComplete()
    }
  }

  rafId = requestAnimationFrame(frame)
  return () => cancelAnimationFrame(rafId)
}
