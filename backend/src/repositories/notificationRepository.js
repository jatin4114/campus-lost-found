import { prisma } from '../config/prisma.js'

export function create({ userId, type, title, message, metadata }) {
  return prisma.notification.create({ data: { userId, type, title, message, metadata } })
}

export function findByUser(userId) {
  return prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 50 })
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
