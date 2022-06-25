import { ApiError } from '../middleware/errorHandler.js'
import * as claimRepo from '../repositories/claimRepository.js'
import * as itemRepo from '../repositories/itemRepository.js'
import { getItem } from './itemService.js'
import { notify } from './notificationService.js'

export async function submitClaim(itemId, claimant, { message, evidence }) {
  const item = await getItem(itemId)

  if (item.userId === claimant.id) {
    throw new ApiError(400, 'CANNOT_CLAIM_OWN_ITEM', 'You cannot submit a claim on your own item.')
  }

  if (item.status !== 'ACTIVE') {
    throw new ApiError(409, 'ITEM_NOT_CLAIMABLE', `This item is ${item.status.toLowerCase()} and cannot be claimed.`)
  }

  const { claim } = await claimRepo.createClaim({ itemId, claimantId: claimant.id, message, evidence })

  await notify(item.userId, {
    type: 'CLAIM_SUBMITTED',
    title: 'Someone submitted a claim',
    message: `${claimant.name ?? 'A student'} submitted a claim on "${item.title}".`,
    metadata: { itemId, claimId: claim.id },
  })

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

  await notify(claim.claimantId, {
    type: 'CLAIM_ACCEPTED',
    title: 'Your claim was accepted',
    message: `Your claim on "${claim.item.title}" was accepted. You can now message the owner.`,
    metadata: { itemId: claim.itemId, claimId, conversationId: conversation.id },
  })

  return { claim: accepted, conversationId: conversation.id }
}

export async function rejectClaim(claimId, user) {
  const claim = await getClaim(claimId)
  assertCanReview(claim, user)
  assertPending(claim)

  const otherPending = await claimRepo.findPendingByItem(claim.itemId, claimId)
  const rejected = await claimRepo.rejectClaim(claimId, claim.itemId, otherPending.length === 0)

  await notify(claim.claimantId, {
    type: 'CLAIM_REJECTED',
    title: 'Your claim was rejected',
    message: `Your claim on "${claim.item.title}" was not accepted.`,
    metadata: { itemId: claim.itemId, claimId },
  })

  return rejected
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

export async function resolveItem(itemId, user) {
  const claim = await claimRepo.findAcceptedByItem(itemId)
  if (!claim) {
    throw new ApiError(409, 'ITEM_NOT_RESOLVABLE', 'This item has no accepted claim to resolve.')
  }

  const isParty = user.id === claim.item.userId || user.id === claim.claimantId
  const isPrivileged = user.role === 'ADMIN' || user.role === 'MODERATOR'
  if (!isParty && !isPrivileged) {
    throw new ApiError(403, 'FORBIDDEN', 'Only the item owner or claimant can mark this resolved.')
  }

  if (claim.item.status !== 'CLAIMED') {
    throw new ApiError(409, 'ITEM_NOT_RESOLVABLE', `An item with status ${claim.item.status} cannot be resolved.`)
  }

  const item = await itemRepo.update(itemId, { status: 'RESOLVED' })

  const otherPartyId = user.id === claim.item.userId ? claim.claimantId : claim.item.userId
  await notify(otherPartyId, {
    type: 'ITEM_RESOLVED',
    title: 'Item marked resolved',
    message: `"${item.title}" has been marked as resolved.`,
    metadata: { itemId },
  })

  return item
}

export async function getMyClaims(userId) {
  return claimRepo.findByUser(userId)
}

export async function getClaimsOnMyItems(userId) {
  return claimRepo.findByItemOwner(userId)
}
