import { prisma } from '../config/prisma.js'

export function create({ userId, tokenHash, expiresAt }) {
  return prisma.refreshToken.create({ data: { userId, tokenHash, expiresAt } })
}

export function findByHash(tokenHash) {
  return prisma.refreshToken.findUnique({ where: { tokenHash } })
}

export function revoke(id) {
  return prisma.refreshToken.update({ where: { id }, data: { revokedAt: new Date() } })
}

export function revokeByHash(tokenHash) {
  return prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  })
}

export function revokeAllForUser(userId) {
  return prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  })
}
