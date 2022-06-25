import { prisma } from '../config/prisma.js'

const includeDefault = {
  evidence: true,
  claimant: { select: { id: true, name: true, avatarUrl: true } },
  item: true,
}

export function findById(id) {
  return prisma.claim.findUnique({ where: { id }, include: includeDefault })
}

export function findAcceptedByItem(itemId) {
  return prisma.claim.findFirst({ where: { itemId, status: 'ACCEPTED' }, include: includeDefault })
}

export function findPendingByItem(itemId, excludeId) {
  return prisma.claim.findMany({
    where: { itemId, status: 'PENDING', id: excludeId ? { not: excludeId } : undefined },
  })
}

export function findByUser(userId) {
  return prisma.claim.findMany({ where: { claimantId: userId }, orderBy: { createdAt: 'desc' }, include: includeDefault })
}

export function findByItemOwner(ownerId) {
  return prisma.claim.findMany({
    where: { item: { userId: ownerId } },
    orderBy: { createdAt: 'desc' },
    include: includeDefault,
  })
}

export async function createClaim({ itemId, claimantId, message, evidence }) {
  return prisma.$transaction(async (tx) => {
    const item = await tx.item.update({
      where: { id: itemId },
      data: { status: 'CLAIM_PENDING' },
    })

    const claim = await tx.claim.create({
      data: {
        itemId,
        claimantId,
        message,
        evidence: { create: evidence },
      },
      include: includeDefault,
    })

    return { claim, item }
  })
}

export async function acceptClaim(claimId, itemId) {
  return prisma.$transaction(async (tx) => {
    await tx.claim.updateMany({
      where: { itemId, status: 'PENDING', id: { not: claimId } },
      data: { status: 'REJECTED' },
    })

    const claim = await tx.claim.update({
      where: { id: claimId },
      data: { status: 'ACCEPTED' },
      include: includeDefault,
    })

    await tx.item.update({ where: { id: itemId }, data: { status: 'CLAIMED' } })

    const conversation = await tx.conversation.create({
      data: {
        claimId,
        participants: {
          create: [{ userId: claim.item.userId }, { userId: claim.claimantId }],
        },
      },
    })

    return { claim, conversation }
  })
}

export async function rejectClaim(claimId, itemId, revertItemToActive) {
  return prisma.$transaction(async (tx) => {
    const claim = await tx.claim.update({
      where: { id: claimId },
      data: { status: 'REJECTED' },
      include: includeDefault,
    })

    if (revertItemToActive) {
      await tx.item.update({ where: { id: itemId }, data: { status: 'ACTIVE' } })
    }

    return claim
  })
}

export async function cancelClaim(claimId, itemId, revertItemToActive) {
  return prisma.$transaction(async (tx) => {
    const claim = await tx.claim.update({
      where: { id: claimId },
      data: { status: 'CANCELLED' },
      include: includeDefault,
    })

    if (revertItemToActive) {
      await tx.item.update({ where: { id: itemId }, data: { status: 'ACTIVE' } })
    }

    return claim
  })
}
