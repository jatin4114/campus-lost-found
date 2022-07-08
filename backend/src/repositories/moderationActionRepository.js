import { prisma } from '../config/prisma.js'

export function create({ reportId, moderatorId, action, metadata }) {
  return prisma.moderationAction.create({ data: { reportId, moderatorId, action, metadata } })
}
