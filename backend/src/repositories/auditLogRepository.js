import { prisma } from '../config/prisma.js'

export function create({ actorId, action, entityType, entityId, metadata, ipAddress }) {
  return prisma.auditLog.create({
    data: { actorId, action, entityType, entityId, metadata, ipAddress },
  })
}

export function findAll({ page, limit }) {
  const skip = (page - 1) * limit
  return Promise.all([
    prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: { actor: { select: { id: true, name: true, email: true } } },
    }),
    prisma.auditLog.count(),
  ])
}
