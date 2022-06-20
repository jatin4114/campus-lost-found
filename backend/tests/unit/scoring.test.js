import { describe, expect, it } from 'vitest'
import { scoreMatch, tierForScore } from '../../src/services/matching/scoring.js'

const LIBRARY = { id: 'lib', campusId: 'c1', latitude: 12.9716, longitude: 77.5946 }

function makeItem(overrides) {
  return {
    title: 'AirPods Pro',
    description: 'White charging case, lost near the reading area.',
    categoryId: 'electronics',
    location: LIBRARY,
    eventDate: '2026-09-03',
    ...overrides,
  }
}

describe('scoreMatch', () => {
  it('scores the AirPods Pro / AirPods example as a strong match', () => {
    const lost = makeItem()
    const found = makeItem({
      title: 'AirPods',
      description: 'Found a pair of AirPods in a white case near the reading hall.',
      eventDate: '2026-09-04',
    })

    const score = scoreMatch(lost, found)
    expect(score).toBeGreaterThanOrEqual(60)
  })

  it('scores an unrelated pair low', () => {
    const lost = makeItem()
    const found = makeItem({
      title: 'Chemistry Textbook',
      description: 'Left it in the CS block lab, has a torn cover.',
      categoryId: 'books',
      eventDate: '2026-08-01',
    })

    const score = scoreMatch(lost, found)
    expect(score).toBeLessThan(40)
  })
})

describe('tierForScore', () => {
  it('classifies scores into the documented bands', () => {
    expect(tierForScore(95)).toBe('VERY_STRONG')
    expect(tierForScore(80)).toBe('STRONG')
    expect(tierForScore(65)).toBe('POSSIBLE')
    expect(tierForScore(30)).toBe('WEAK')
  })
})
