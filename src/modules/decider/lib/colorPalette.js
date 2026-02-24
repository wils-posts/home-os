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

// Native theme colours — muted tones that complement the zinc/sage UI
const NATIVE_PALETTE = [
  '#6b8fa8',  // slate
  '#7a7ea8',  // periwinkle
  '#6a9e8a',  // teal
  '#9e8068',  // terracotta
  '#7a9668',  // olive
  '#9e7880',  // mauve
  '#688898',  // steel
  '#887898',  // lavender
]

export function getNativeSliceColors(count) {
  if (count === 0) return []
  const colors = []
  for (let i = 0; i < count; i++) {
    colors.push(NATIVE_PALETTE[i % NATIVE_PALETTE.length])
  }
  return colors
}
