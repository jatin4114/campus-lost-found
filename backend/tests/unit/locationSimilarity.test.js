import { describe, expect, it } from 'vitest'
import { distanceMeters, locationSimilarity } from '../../src/services/matching/locationSimilarity.js'

const LIBRARY = { id: 'lib', campusId: 'c1', latitude: 12.9716, longitude: 77.5946 }
const NEARBY_READING_HALL = { id: 'hall', campusId: 'c1', latitude: 12.9717, longitude: 77.5947 }
const FAR_SPORTS_COMPLEX = { id: 'sports', campusId: 'c1', latitude: 12.9688, longitude: 77.5972 }

describe('distanceMeters', () => {
  it('is 0 for identical coordinates', () => {
    expect(distanceMeters(LIBRARY, LIBRARY)).toBeCloseTo(0, 1)
  })

  it('is larger for farther-apart points', () => {
    expect(distanceMeters(LIBRARY, FAR_SPORTS_COMPLEX)).toBeGreaterThan(
      distanceMeters(LIBRARY, NEARBY_READING_HALL),
    )
  })
})

describe('locationSimilarity', () => {
  it('is 1 for the exact same location', () => {
    expect(locationSimilarity(LIBRARY, LIBRARY)).toBe(1)
  })

  it('scores nearby locations highly', () => {
    expect(locationSimilarity(LIBRARY, NEARBY_READING_HALL)).toBeGreaterThanOrEqual(0.75)
  })

  it('scores far-apart locations low', () => {
    expect(locationSimilarity(LIBRARY, FAR_SPORTS_COMPLEX)).toBeLessThanOrEqual(0.5)
  })
})
