import { describe, expect, it } from 'vitest'
import { loginSchema, registerSchema } from '../../src/schemas/authSchemas'

describe('loginSchema', () => {
  it('accepts a valid email and non-empty password', () => {
    const result = loginSchema.safeParse({ email: 'alice@campus.edu', password: 'x' })
    expect(result.success).toBe(true)
  })

  it('rejects an invalid email', () => {
    const result = loginSchema.safeParse({ email: 'not-an-email', password: 'x' })
    expect(result.success).toBe(false)
  })

  it('rejects an empty password', () => {
    const result = loginSchema.safeParse({ email: 'alice@campus.edu', password: '' })
    expect(result.success).toBe(false)
  })

  it('lowercases and trims the email', () => {
    const result = loginSchema.safeParse({ email: '  Alice@Campus.EDU  ', password: 'x' })
    expect(result.success).toBe(true)
    expect(result.data.email).toBe('alice@campus.edu')
  })
})

describe('registerSchema', () => {
  it('accepts a strong password', () => {
    const result = registerSchema.safeParse({ name: 'Alice', email: 'a@campus.edu', password: 'Password1' })
    expect(result.success).toBe(true)
  })

  it('rejects a password missing an uppercase letter', () => {
    const result = registerSchema.safeParse({ name: 'Alice', email: 'a@campus.edu', password: 'password1' })
    expect(result.success).toBe(false)
  })

  it('rejects a password missing a number', () => {
    const result = registerSchema.safeParse({ name: 'Alice', email: 'a@campus.edu', password: 'Password' })
    expect(result.success).toBe(false)
  })

  it('rejects a name that is too short', () => {
    const result = registerSchema.safeParse({ name: 'A', email: 'a@campus.edu', password: 'Password1' })
    expect(result.success).toBe(false)
  })
})
