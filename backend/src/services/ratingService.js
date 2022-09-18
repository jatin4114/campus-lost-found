import * as claimRepo from '../repositories/claimRepository.js'
import { ApiError } from '../middleware/errorHandler.js'
import * as ratingRepo from '../repositories/ratingRepository.js'

export async function submitRating(claimId, rater, { score, comment }) {
  const claim = await claimRepo.findById(claimId)
  if (!claim) {
    throw new ApiError(404, 'CLAIM_NOT_FOUND', 'The requested claim does not exist.')
  }

  const isOwner = rater.id === claim.item.userId
  const isClaimant = rater.id === claim.claimantId
  if (!isOwner && !isClaimant) {
    throw new ApiError(403, 'FORBIDDEN', 'Only the two parties in this handover can rate each other.')
  }

  if (claim.status !== 'ACCEPTED' || claim.item.status !== 'RESOLVED') {
    throw new ApiError(
      409,
      'HANDOVER_NOT_COMPLETE',
      'You can only rate a handover after the item has been marked resolved.',
    )
  }

  const ratedUserId = isOwner ? claim.claimantId : claim.item.userId

  const existing = await ratingRepo.findByClaimAndRater(claimId, rater.id)
  if (existing) {
    throw new ApiError(409, 'ALREADY_RATED', 'You already rated this handover.')
  }

  return ratingRepo.create({ claimId, raterId: rater.id, ratedUserId, score, comment })
}

export async function getRatingsForClaim(claimId, user) {
  const claim = await claimRepo.findById(claimId)
  if (!claim) {
    throw new ApiError(404, 'CLAIM_NOT_FOUND', 'The requested claim does not exist.')
  }
  const isParty = user.id === claim.item.userId || user.id === claim.claimantId
  if (!isParty) {
    throw new ApiError(403, 'FORBIDDEN', 'You are not part of this claim.')
  }
  return ratingRepo.findByClaim(claimId)
}

export async function getRatingSummary(userId) {
  return ratingRepo.summaryForUser(userId)
}
