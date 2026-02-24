// Soft, muted palette — visible on both light and dark backgrounds
const PALETTE = [
  '#7fa8c9',  // dusty blue
  '#9b8ec4',  // soft purple
  '#6db8a0',  // sage teal
  '#c4926e',  // warm terracotta
  '#8fb870',  // muted green
  '#c47888',  // dusty rose
  '#7898c4',  // periwinkle
  '#b07ab0',  // soft mauve
]

export function generateSliceColors(count, isDark = false) {
  if (count === 0) return []
  const colors = []
  for (let i = 0; i < count; i++) {
    colors.push(PALETTE[i % PALETTE.length])
  }
  return colors
}

export function getNativeSliceColors(count) {
  if (count === 0) return []
  const colors = []
  for (let i = 0; i < count; i++) {
    colors.push(PALETTE[i % PALETTE.length])
  }
  return colors
}
