function generateSeed() {
  const arr = new Uint32Array(1)
  crypto.getRandomValues(arr)
  return arr[0].toString(16).padStart(8, '0')
}

// Mulberry32 PRNG — deterministic given a seed
function mulberry32(seed) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function seedToNumber(seed) {
  return parseInt(seed, 16) || 0
}

export function selectWinner(items, { allowRepeat, lastWinnerId, seed: providedSeed } = {}) {
  let eligible = [...items]

  if (!allowRepeat && lastWinnerId) {
    eligible = eligible.filter(item => item.id !== lastWinnerId)
  }

  if (eligible.length === 0) return null

  // Build cumulative weights
  const cumulative = []
  let total = 0
  for (const item of eligible) {
    total += item.weight
    cumulative.push(total)
  }

  const seed = providedSeed ?? generateSeed()
  const rng = mulberry32(seedToNumber(seed))
  const randomValue = rng() * total

  // Binary search
  let lo = 0
  let hi = cumulative.length - 1
  while (lo < hi) {
    const mid = (lo + hi) >>> 1
    if (cumulative[mid] <= randomValue) {
      lo = mid + 1
    } else {
      hi = mid
    }
  }

  return {
    winnerId: eligible[lo].id,
    winnerLabel: eligible[lo].label,
    seed,
  }
}
