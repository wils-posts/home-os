export const STATE_CYCLE = { OK: 'LOW', LOW: 'NEED', NEED: 'OK' }

export function getNextState(current) {
  return STATE_CYCLE[current] ?? 'OK'
}

export function sortItems(items) {
  return [...items].sort((a, b) => {
    const aPinned = a.pinned && a.pin_order != null
    const bPinned = b.pinned && b.pin_order != null

    if (aPinned && bPinned) return a.pin_order - b.pin_order
    if (aPinned) return -1
    if (bPinned) return 1

    // Both unpinned (or pinned with no pin_order): sort by created_order
    return a.created_order - b.created_order
  })
}

export function groupItems(sortedItems) {
  return {
    pinned: sortedItems.filter(i => i.pinned),
    need:   sortedItems.filter(i => !i.pinned && i.state === 'NEED'),
    low:    sortedItems.filter(i => !i.pinned && i.state === 'LOW'),
    ok:     sortedItems.filter(i => !i.pinned && i.state === 'OK'),
  }
}
