import { prisma } from '../config/prisma.js'

export function create({ claimId, raterId, ratedUserId, score, comment }) {
  return prisma.rating.create({ data: { claimId, raterId, ratedUserId, score, comment } })
}

export function findByClaim(claimId) {
  return prisma.rating.findMany({
    where: { claimId },
    include: { rater: { select: { id: true, name: true } } },
  })
}

export function findByClaimAndRater(claimId, raterId) {
  return prisma.rating.findUnique({ where: { claimId_raterId: { claimId, raterId } } })
}

export async function summaryForUser(userId) {
  const result = await prisma.rating.aggregate({
    where: { ratedUserId: userId },
    _avg: { score: true },
    _count: true,
  })
  return { average: result._avg.score, count: result._count }
}
