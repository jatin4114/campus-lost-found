# Matching algorithm

CampusFind surfaces potential matches between LOST and FOUND items using a
fully deterministic, hand-rolled scoring algorithm — no LLM calls. It runs
synchronously whenever a new item is created (`itemService.createItem` calls
`matchingService.generateMatchesForItem`).

## Candidate selection

For a new item of type `LOST`/`FOUND`, candidates are active items of the
*opposite* type in the *same category* (`itemRepository.findActiveByTypeAndCategory`).
Filtering by category first keeps the candidate set small before the more
expensive text/location scoring runs.

## Weighted score

```
score = titleScore     * 0.30
      + descriptionScore * 0.20
      + categoryScore    * 0.15
      + locationScore    * 0.20
      + dateScore        * 0.15
```

`score` is on a 0-100 scale (`backend/src/services/matching/scoring.js`).

### Title / description — `textSimilarity`

Blends two signals so both word-level and character-level variation are
tolerated:

- **Jaccard similarity** (60%) over normalized, tokenized, stopword-filtered
  text — handles reordering and extra/missing words ("AirPods Pro 2" vs
  "Apple AirPods Pro").
- **Levenshtein similarity** (40%), `1 - editDistance / maxLength` over the
  normalized full string — handles typos and minor character-level variants.

### Category — exact match

`1` if both items share a `categoryId`, else `0`.

### Location — `locationSimilarity`

Same location → `1`. Otherwise a haversine great-circle distance (meters)
between the two locations' lat/lng is banded:

| Distance     | Score |
|--------------|-------|
| 0–100m       | 1.0   |
| 100–300m     | 0.75  |
| 300–500m     | 0.5   |
| >500m        | 0.15  |

If coordinates are missing, falls back to `0.3` for same-campus, `0` otherwise.

### Date — `dateSimilarity`

Linear decay from `1` (same day) to `0` at 14 days apart.

## Tiers

```
score >= 90  → VERY_STRONG
score >= 75  → STRONG
score >= 60  → POSSIBLE
score <  60  → WEAK (not surfaced prominently in the UI)
```

Matches scoring at least 40 are persisted (`Match` table, unique on
`[lostItemId, foundItemId]`) so borderline pairs can be revisited if scoring
weights change later, even though the UI only highlights POSSIBLE and above.

## Testing

`backend/tests/unit/{textSimilarity,locationSimilarity,dateSimilarity,scoring}.test.js`
cover each component in isolation plus the end-to-end weighted score, including
the worked "AirPods Pro" / "AirPods" example from the product brief.

## Future improvements

TF-IDF/cosine similarity for description matching would generalize better
than Jaccard as item descriptions get longer and more varied — noted here as
a deliberate scope cut, not an oversight.
