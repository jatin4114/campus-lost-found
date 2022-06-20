import { describe, expect, it } from 'vitest'
import { dateSimilarity } from '../../src/services/matching/dateSimilarity.js'

describe('dateSimilarity', () => {
  it('is 1 for the same date', () => {
    expect(dateSimilarity('2026-09-03', '2026-09-03')).toBe(1)
  })

  it('decays as dates get further apart', () => {
    const oneDayApart = dateSimilarity('2026-09-03', '2026-09-04')
    const oneWeekApart = dateSimilarity('2026-09-03', '2026-09-10')
    expect(oneDayApart).toBeGreaterThan(oneWeekApart)
  })

  it('floors at 0 beyond the decay window', () => {
    expect(dateSimilarity('2026-09-03', '2026-10-03')).toBe(0)
  })
})
