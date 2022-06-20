import { describe, expect, it } from 'vitest'
import { jaccardSimilarity, textSimilarity, tokenize } from '../../src/services/matching/textSimilarity.js'

describe('tokenize', () => {
  it('lowercases, strips punctuation, and drops stopwords', () => {
    expect(tokenize('AirPods Pro 2 (White Case)')).toEqual(['airpods', 'pro', '2', 'white', 'case'])
  })

  it('drops filler words like "lost" and "the"', () => {
    expect(tokenize('I lost the black backpack')).toEqual(['black', 'backpack'])
  })
})

describe('jaccardSimilarity', () => {
  it('is 1 for identical token sets', () => {
    expect(jaccardSimilarity(['a', 'b'], ['a', 'b'])).toBe(1)
  })

  it('is 0 for disjoint token sets', () => {
    expect(jaccardSimilarity(['a', 'b'], ['c', 'd'])).toBe(0)
  })

  it('is 0 when both sides are empty', () => {
    expect(jaccardSimilarity([], [])).toBe(0)
  })
})

describe('textSimilarity', () => {
  it('scores close variants of the same item highly', () => {
    const score = textSimilarity('AirPods Pro 2', 'Apple AirPods Pro')
    expect(score).toBeGreaterThan(0.5)
  })

  it('scores unrelated items low', () => {
    const score = textSimilarity('AirPods Pro', 'Chemistry Textbook')
    expect(score).toBeLessThan(0.3)
  })

  it('still scores moderately-high despite a one-character typo', () => {
    // Jaccard treats tokens atomically, so a typo'd token counts as a full
    // mismatch there; the character-level (Levenshtein) component is what
    // keeps a single-letter typo from tanking the overall score.
    const score = textSimilarity('Black Backpack', 'Blak Backpack')
    expect(score).toBeGreaterThan(0.5)
  })
})
