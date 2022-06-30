import { prisma } from '../config/prisma.js'

export function findByConversation(conversationId) {
  return prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
    include: { sender: { select: { id: true, name: true, avatarUrl: true } } },
  })
}

export function create({ conversationId, senderId, body }) {
  return prisma.message.create({
    data: { conversationId, senderId, body },
    include: { sender: { select: { id: true, name: true, avatarUrl: true } } },
  })
}

export function countUnread(conversationId, userId, since) {
  return prisma.message.count({
    where: {
      conversationId,
      senderId: { not: userId },
      createdAt: since ? { gt: since } : undefined,
    },
  })
}
