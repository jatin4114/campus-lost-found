import { ApiError } from '../middleware/errorHandler.js'
import * as itemRepo from '../repositories/itemRepository.js'
import * as matchRepo from '../repositories/matchRepository.js'
import { scoreMatch, tierForScore } from './matching/scoring.js'

const MIN_SCORE_TO_PERSIST = 40

// Called after a LOST/FOUND item is created: finds same-category, active,
// opposite-type items and scores each candidate pair. Only persists matches
// worth surfacing later (see MIN_SCORE_TO_PERSIST) — this keeps the Match
// table from filling up with obviously-irrelevant pairs while still letting
// borderline (40-59) matches be revisited if scoring weights change.
export async function generateMatchesForItem(item) {
  const oppositeType = item.type === 'LOST' ? 'FOUND' : 'LOST'
  const candidates = await itemRepo.findActiveByTypeAndCategory(oppositeType, item.categoryId, item.id)

  const results = []
  for (const candidate of candidates) {
    const lostItem = item.type === 'LOST' ? item : candidate
    const foundItem = item.type === 'LOST' ? candidate : item
    const score = scoreMatch(lostItem, foundItem)

    if (score >= MIN_SCORE_TO_PERSIST) {
      const match = await matchRepo.upsert({ lostItemId: lostItem.id, foundItemId: foundItem.id, score })
      results.push({ ...match, tier: tierForScore(score) })
    }
  }

  return results.sort((a, b) => b.score - a.score)
}

export async function getMatchesForItem(itemId) {
  const matches = await matchRepo.findForItem(itemId)
  return matches.map((m) => ({ ...m, tier: tierForScore(m.score) }))
}

export async function getMatchesForUser(userId) {
  const matches = await matchRepo.findForUser(userId)
  return matches.map((m) => ({ ...m, tier: tierForScore(m.score) }))
}

export async function dismissMatch(matchId) {
  try {
    return await matchRepo.updateStatus(matchId, 'DISMISSED')
  } catch {
    throw new ApiError(404, 'MATCH_NOT_FOUND', 'The requested match does not exist.')
  }
}
