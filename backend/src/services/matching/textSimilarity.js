const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'of', 'in', 'on', 'at', 'to', 'for', 'with',
  'my', 'it', 'is', 'was', 'near', 'about', 'i', 'lost', 'found',
])

export function normalize(text) {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function tokenize(text) {
  return normalize(text)
    .split(' ')
    .filter((token) => token.length > 0 && !STOPWORDS.has(token))
}

export function jaccardSimilarity(tokensA, tokensB) {
  const setA = new Set(tokensA)
  const setB = new Set(tokensB)
  if (setA.size === 0 && setB.size === 0) return 0

  let intersection = 0
  for (const token of setA) {
    if (setB.has(token)) intersection += 1
  }
  const union = setA.size + setB.size - intersection
  return union === 0 ? 0 : intersection / union
}

export function levenshteinDistance(a, b) {
  const rows = a.length + 1
  const cols = b.length + 1
  const matrix = Array.from({ length: rows }, (_, i) => [i, ...Array(cols - 1).fill(0)])
  for (let j = 0; j < cols; j += 1) matrix[0][j] = j

  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      )
    }
  }
  return matrix[rows - 1][cols - 1]
}

export function levenshteinSimilarity(a, b) {
  const normA = normalize(a)
  const normB = normalize(b)
  const maxLen = Math.max(normA.length, normB.length)
  if (maxLen === 0) return 1
  return 1 - levenshteinDistance(normA, normB) / maxLen
}

// Blends token-set overlap (handles word reordering/extra words) with
// character-level edit distance (handles typos/minor variants).
export function textSimilarity(a, b) {
  const jaccard = jaccardSimilarity(tokenize(a), tokenize(b))
  const levenshtein = levenshteinSimilarity(a, b)
  return jaccard * 0.6 + levenshtein * 0.4
}
