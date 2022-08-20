import { describe, expect, it } from 'vitest'
import { tfidfSimilarityToFirst } from '../../src/services/matching/tfidf.js'

describe('tfidfSimilarityToFirst', () => {
  it('gives similarity 1 when compared to itself', () => {
    const [selfSim] = tfidfSimilarityToFirst(['White AirPods case lost near the library'])
    expect(selfSim).toBeCloseTo(1, 5)
  })

  it('scores a near-duplicate description higher than an unrelated one', () => {
    const [, dupSim, unrelatedSim] = tfidfSimilarityToFirst([
      'White AirPods Pro case with a small scratch on the lid',
      'Found white AirPods case, has a small scratch on the lid',
      'Blue chemistry textbook with a torn cover, third edition',
    ])
    expect(dupSim).toBeGreaterThan(unrelatedSim)
  })

  it('downweights a word every document shares relative to a distinctive one', () => {
    // "found" appears in every doc here and should contribute little; the
    // distinctive "skateboard" vs "umbrella" should dominate the ranking.
    const [, skateboardSim, umbrellaSim] = tfidfSimilarityToFirst([
      'found near the skateboard park entrance yesterday afternoon',
      'found a skateboard near the entrance yesterday afternoon',
      'found an umbrella near the entrance yesterday afternoon',
    ])
    expect(skateboardSim).toBeGreaterThan(umbrellaSim)
  })

  it('returns 0 for completely disjoint vocabularies', () => {
    const [, sim] = tfidfSimilarityToFirst(['apple banana cherry', 'xylophone zeppelin quokka'])
    expect(sim).toBe(0)
  })
})
