import { prisma } from '../config/prisma.js'

const includeDefault = {
  reporter: { select: { id: true, name: true, email: true } },
  item: { select: { id: true, title: true, userId: true, status: true } },
}

export function create({ reporterId, itemId, reason, description }) {
  return prisma.report.create({ data: { reporterId, itemId, reason, description }, include: includeDefault })
}

export function findById(id) {
  return prisma.report.findUnique({ where: { id }, include: includeDefault })
}

export function findAll({ status }) {
  return prisma.report.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: 'desc' },
    include: includeDefault,
  })
}

export function updateStatus(id, status, reviewedById) {
  return prisma.report.update({
    where: { id },
    data: { status, reviewedById, reviewedAt: new Date() },
  })
}
