// A minimal in-memory sliding-window limiter for contexts express-rate-limit
// doesn't cover (Socket.IO events aren't HTTP requests). Fine for a single
// process; a multi-instance deployment would need this backed by Redis.
export function createRateLimiter({ limit, windowMs }) {
  const hits = new Map() // key -> timestamps[]

  return {
    consume(key) {
      const now = Date.now()
      const windowStart = now - windowMs
      const timestamps = (hits.get(key) ?? []).filter((t) => t > windowStart)

      if (timestamps.length >= limit) {
        hits.set(key, timestamps)
        return false
      }

      timestamps.push(now)
      hits.set(key, timestamps)
      return true
    },
  }
}
