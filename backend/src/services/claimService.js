import { ApiError } from '../middleware/errorHandler.js'
import * as claimRepo from '../repositories/claimRepository.js'
import { getItem } from './itemService.js'

export async function submitClaim(itemId, claimant, { message, evidence }) {
  const item = await getItem(itemId)

  if (item.userId === claimant.id) {
    throw new ApiError(400, 'CANNOT_CLAIM_OWN_ITEM', 'You cannot submit a claim on your own item.')
  }

  if (item.status !== 'ACTIVE') {
    throw new ApiError(409, 'ITEM_NOT_CLAIMABLE', `This item is ${item.status.toLowerCase()} and cannot be claimed.`)
  }

  const { claim } = await claimRepo.createClaim({ itemId, claimantId: claimant.id, message, evidence })
  return claim
}

function assertCanReview(claim, user) {
  const isItemOwner = claim.item.userId === user.id
  const isPrivileged = user.role === 'ADMIN' || user.role === 'MODERATOR'
  if (!isItemOwner && !isPrivileged) {
    throw new ApiError(403, 'FORBIDDEN', 'Only the item owner can review this claim.')
  }
}

function assertPending(claim) {
  if (claim.status !== 'PENDING') {
    throw new ApiError(409, 'INVALID_CLAIM_TRANSITION', `A ${claim.status.toLowerCase()} claim cannot be updated.`)
  }
}

export async function getClaim(id) {
  const claim = await claimRepo.findById(id)
  if (!claim) {
    throw new ApiError(404, 'CLAIM_NOT_FOUND', 'The requested claim does not exist.')
  }
  return claim
}

export async function acceptClaim(claimId, user) {
  const claim = await getClaim(claimId)
  assertCanReview(claim, user)
  assertPending(claim)

  const { claim: accepted, conversation } = await claimRepo.acceptClaim(claimId, claim.itemId)
  return { claim: accepted, conversationId: conversation.id }
}

export async function rejectClaim(claimId, user) {
  const claim = await getClaim(claimId)
  assertCanReview(claim, user)
  assertPending(claim)

  const otherPending = await claimRepo.findPendingByItem(claim.itemId, claimId)
  return claimRepo.rejectClaim(claimId, claim.itemId, otherPending.length === 0)
}

export async function cancelClaim(claimId, user) {
  const claim = await getClaim(claimId)
  if (claim.claimantId !== user.id) {
    throw new ApiError(403, 'FORBIDDEN', 'Only the claimant can cancel this claim.')
  }
  assertPending(claim)

  const otherPending = await claimRepo.findPendingByItem(claim.itemId, claimId)
  return claimRepo.cancelClaim(claimId, claim.itemId, otherPending.length === 0)
}

export async function getMyClaims(userId) {
  return claimRepo.findByUser(userId)
}

export async function getClaimsOnMyItems(userId) {
  return claimRepo.findByItemOwner(userId)
}
