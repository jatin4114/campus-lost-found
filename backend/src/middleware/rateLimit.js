import rateLimit from 'express-rate-limit'

function limiter(windowMs, limit) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: { code: 'RATE_LIMITED', message: 'Too many attempts. Please try again later.' },
    },
  })
}

export const authRateLimiter = limiter(15 * 60 * 1000, 10)

// A generous ceiling on every API route as a backstop against scripted abuse.
export const apiRateLimiter = limiter(60 * 1000, 120)

// Item/report creation is cheap to script and easy to spam — cap it tighter
// than general browsing/reads.
export const createRateLimiter = limiter(60 * 60 * 1000, 30)
