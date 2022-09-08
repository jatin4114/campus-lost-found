import { describe, expect, it } from 'vitest'
import { reportItemSchema } from '../../src/schemas/itemSchemas'

const validPayload = {
  type: 'LOST',
  title: 'AirPods Pro',
  categoryId: 'cat-1',
  locationId: 'loc-1',
  eventDate: '2026-09-03',
  description: 'Lost near the library reading area yesterday afternoon.',
}

describe('reportItemSchema', () => {
  it('accepts a valid report', () => {
    expect(reportItemSchema.safeParse(validPayload).success).toBe(true)
  })

  it('rejects a description that is too short', () => {
    const result = reportItemSchema.safeParse({ ...validPayload, description: 'too short' })
    expect(result.success).toBe(false)
  })

  it('rejects a missing category', () => {
    const result = reportItemSchema.safeParse({ ...validPayload, categoryId: '' })
    expect(result.success).toBe(false)
  })

  it('rejects an invalid type', () => {
    const result = reportItemSchema.safeParse({ ...validPayload, type: 'MISSING' })
    expect(result.success).toBe(false)
  })
})
