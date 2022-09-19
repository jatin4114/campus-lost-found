import { prisma } from '../config/prisma.js'

const includeDefault = {
  participants: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
  claim: { include: { item: { select: { id: true, title: true, status: true } } } },
}

export function findById(id) {
  return prisma.conversation.findUnique({ where: { id }, include: includeDefault })
}

export function findByUser(userId) {
  return prisma.conversation.findMany({
    where: { participants: { some: { userId } } },
    orderBy: { createdAt: 'desc' },
    include: includeDefault,
  })
}

export function isParticipant(conversationId, userId) {
  return prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
  })
}

export function markRead(conversationId, userId) {
  return prisma.conversationParticipant.update({
    where: { conversationId_userId: { conversationId, userId } },
    data: { lastReadAt: new Date() },
  })
}
