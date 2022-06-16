const MS_PER_DAY = 24 * 60 * 60 * 1000
const DECAY_WINDOW_DAYS = 14

// Linear decay: same day = 1, falling to 0 by DECAY_WINDOW_DAYS apart.
export function dateSimilarity(dateA, dateB) {
  const diffDays = Math.abs(new Date(dateA) - new Date(dateB)) / MS_PER_DAY
  return Math.max(0, 1 - diffDays / DECAY_WINDOW_DAYS)
}
