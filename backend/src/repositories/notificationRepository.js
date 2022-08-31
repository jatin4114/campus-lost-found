import { prisma } from '../config/prisma.js'

export function create({ userId, type, title, message, metadata }) {
  return prisma.notification.create({ data: { userId, type, title, message, metadata } })
}

export async function findByUser(userId, { page, limit }) {
  const skip = (page - 1) * limit
  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, skip, take: limit }),
    prisma.notification.count({ where: { userId } }),
  ])
  return { notifications, total }
}

export function countUnread(userId) {
  return prisma.notification.count({ where: { userId, read: false } })
}

export function markRead(id, userId) {
  return prisma.notification.updateMany({ where: { id, userId }, data: { read: true } })
}

export function markAllRead(userId) {
  return prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true } })
}
