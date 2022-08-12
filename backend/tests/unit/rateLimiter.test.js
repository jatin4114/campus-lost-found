import { describe, expect, it } from 'vitest'
import { createRateLimiter } from '../../src/utils/rateLimiter.js'

describe('createRateLimiter', () => {
  it('allows up to the limit within the window', () => {
    const limiter = createRateLimiter({ limit: 3, windowMs: 1000 })
    expect(limiter.consume('user-1')).toBe(true)
    expect(limiter.consume('user-1')).toBe(true)
    expect(limiter.consume('user-1')).toBe(true)
    expect(limiter.consume('user-1')).toBe(false)
  })

  it('tracks each key independently', () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 1000 })
    expect(limiter.consume('user-1')).toBe(true)
    expect(limiter.consume('user-2')).toBe(true)
    expect(limiter.consume('user-1')).toBe(false)
  })

  it('allows more once old hits fall outside the window', async () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 50 })
    expect(limiter.consume('user-1')).toBe(true)
    expect(limiter.consume('user-1')).toBe(false)
    await new Promise((resolve) => setTimeout(resolve, 60))
    expect(limiter.consume('user-1')).toBe(true)
  })
})
