import { dateSimilarity } from './dateSimilarity.js'
import { locationSimilarity } from './locationSimilarity.js'
import { textSimilarity } from './textSimilarity.js'

const WEIGHTS = {
  title: 0.3,
  description: 0.2,
  category: 0.15,
  location: 0.2,
  date: 0.15,
}

export const MATCH_TIERS = {
  VERY_STRONG: 90,
  STRONG: 75,
  POSSIBLE: 60,
}

export function tierForScore(score) {
  if (score >= MATCH_TIERS.VERY_STRONG) return 'VERY_STRONG'
  if (score >= MATCH_TIERS.STRONG) return 'STRONG'
  if (score >= MATCH_TIERS.POSSIBLE) return 'POSSIBLE'
  return 'WEAK'
}

// Returns a 0-100 weighted match score between a lost item and a found item.
// `descriptionScore` can be supplied by the caller (matchingService computes
// it via TF-IDF cosine similarity across the whole candidate batch, which
// needs more than two documents to be meaningful) — falls back to the same
// Jaccard+Levenshtein blend used for titles when called standalone, e.g. in
// unit tests.
export function scoreMatch(lostItem, foundItem, { descriptionScore: precomputedDescriptionScore } = {}) {
  const titleScore = textSimilarity(lostItem.title, foundItem.title)
  const descriptionScore = precomputedDescriptionScore ?? textSimilarity(lostItem.description, foundItem.description)
  const categoryScore = lostItem.categoryId === foundItem.categoryId ? 1 : 0
  const locationScore = locationSimilarity(lostItem.location, foundItem.location)
  const dateScore = dateSimilarity(lostItem.eventDate, foundItem.eventDate)

  const weighted =
    titleScore * WEIGHTS.title +
    descriptionScore * WEIGHTS.description +
    categoryScore * WEIGHTS.category +
    locationScore * WEIGHTS.location +
    dateScore * WEIGHTS.date

  return Math.round(weighted * 100)
}
