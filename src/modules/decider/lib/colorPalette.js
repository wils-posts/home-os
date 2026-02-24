function hslToString(h, s, l) {
  return `hsl(${h}, ${s}%, ${l}%)`
}

export function generateSliceColors(count, isDark = false) {
  if (count === 0) return []
  const colors = []
  const baseLightness = isDark ? 38 : 65
  for (let i = 0; i < count; i++) {
    const hue = (i * 360 / count) % 360
    const saturation = i % 2 === 0 ? 45 : 35
    const lightness = baseLightness + (i % 3 === 0 ? 5 : i % 3 === 1 ? -3 : 0)
    colors.push(hslToString(hue, saturation, lightness))
  }
  return colors
}

// Native theme colours — pulled from CSS variables at call time
export function getNativeSliceColors(count) {
  if (count === 0) return []
  const style = getComputedStyle(document.documentElement)
  const get = (v) => style.getPropertyValue(v).trim()

  // Build a palette from theme vars + tailwind custom colours
  const palette = [
    get('--action-surface') || '#52525b',
    '#22c55e',  // ok (green)
    '#f59e0b',  // low (amber)
    '#ef4444',  // need (red)
    get('--surface-2') || '#3f3f46',
    '#6366f1',  // indigo
    '#14b8a6',  // teal
    '#ec4899',  // pink
  ]

  const colors = []
  for (let i = 0; i < count; i++) {
    colors.push(palette[i % palette.length])
  }
  return colors
}
