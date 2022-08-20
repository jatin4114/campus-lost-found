import { tokenize } from './textSimilarity.js'

// Term Frequency: count of each term in a document, normalized by doc length
// so longer descriptions don't automatically score "more" just for having
// more words.
function termFrequency(tokens) {
  const tf = new Map()
  for (const token of tokens) {
    tf.set(token, (tf.get(token) ?? 0) + 1)
  }
  for (const [term, count] of tf) {
    tf.set(term, count / tokens.length)
  }
  return tf
}

// Inverse Document Frequency across the actual candidate corpus (the new
// item's description plus every candidate's) — with only a handful of
// documents to compare, this is the only IDF corpus available, but it's
// still meaningfully better than no IDF at all: a word every candidate
// shares (e.g. "lost", already stripped as a stopword, or "case") is
// downweighted relative to a word that's actually distinctive here.
function inverseDocumentFrequency(tokenizedDocs) {
  const docCount = tokenizedDocs.length
  const containing = new Map()

  for (const tokens of tokenizedDocs) {
    for (const term of new Set(tokens)) {
      containing.set(term, (containing.get(term) ?? 0) + 1)
    }
  }

  const idf = new Map()
  for (const [term, count] of containing) {
    idf.set(term, Math.log((1 + docCount) / (1 + count)) + 1) // smoothed idf
  }
  return idf
}

function cosineSimilarity(vecA, vecB) {
  let dot = 0
  let normA = 0
  let normB = 0

  for (const [term, weight] of vecA) {
    normA += weight * weight
    const otherWeight = vecB.get(term)
    if (otherWeight) dot += weight * otherWeight
  }
  for (const weight of vecB.values()) {
    normB += weight * weight
  }

  if (normA === 0 || normB === 0) return 0
  return dot / (Math.sqrt(normA) * Math.sqrt(normB))
}

// Computes TF-IDF vectors for every document in `texts` (using the full set
// as the IDF corpus) and returns their pairwise cosine similarity to
// `texts[0]` — i.e. similarities[i] is how similar texts[i] is to texts[0].
export function tfidfSimilarityToFirst(texts) {
  const tokenizedDocs = texts.map(tokenize)
  const idf = inverseDocumentFrequency(tokenizedDocs)

  const vectors = tokenizedDocs.map((tokens) => {
    const tf = termFrequency(tokens)
    const vector = new Map()
    for (const [term, freq] of tf) {
      vector.set(term, freq * (idf.get(term) ?? 0))
    }
    return vector
  })

  const [firstVector] = vectors
  return vectors.map((vector) => cosineSimilarity(firstVector, vector))
}
