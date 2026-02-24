// Curated muted palettes — soft and harmonious on both light and dark backgrounds
const DARK_PALETTE = [
  '#7b93a8',  // slate blue
  '#8a7fa0',  // dusty lavender
  '#7a9e8e',  // muted teal
  '#a08878',  // warm terracotta
  '#8a9e78',  // sage green
  '#9e8a78',  // dusty rose
  '#7890a0',  // steel blue
  '#9878a0',  // soft mauve
]

const LIGHT_PALETTE = [
  '#7b9ab5',  // slate blue
  '#9b8fbb',  // dusty lavender
  '#6fa08e',  // muted teal
  '#b08878',  // warm terracotta
  '#7fa068',  // sage green
  '#b07880',  // dusty rose
  '#6888a8',  // steel blue
  '#a078a8',  // soft mauve
]

export function generateSliceColors(count, isDark = false) {
  if (count === 0) return []
  const palette = isDark ? DARK_PALETTE : LIGHT_PALETTE
  const colors = []
  for (let i = 0; i < count; i++) {
    colors.push(palette[i % palette.length])
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
