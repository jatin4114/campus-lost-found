const UNITS = [
  { limit: 3600, divisor: 60, unit: 'm ago' },
  { limit: 86400, divisor: 3600, unit: 'h ago' },
  { limit: 604800, divisor: 86400, unit: 'd ago' },
]

// "just now" / "5m ago" / "3h ago" / "2d ago", falling back to a plain
// locale date once it's more than a week old (a bare "12d ago" stops being
// useful and a real date is easier to reason about).
export function formatRelativeTime(date) {
  const then = new Date(date)
  const seconds = Math.max(0, Math.floor((Date.now() - then.getTime()) / 1000))

  if (seconds < 60) return 'just now'
  for (const { limit, divisor, unit } of UNITS) {
    if (seconds < limit) return `${Math.floor(seconds / divisor)}${unit}`
  }
  return then.toLocaleDateString()
}

export function isWithinLastDay(date) {
  return Date.now() - new Date(date).getTime() < 86400000
}
