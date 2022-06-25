import { ApiError } from '../middleware/errorHandler.js'
import * as notificationRepo from '../repositories/notificationRepository.js'

export async function notify(userId, { type, title, message, metadata }) {
  return notificationRepo.create({ userId, type, title, message, metadata })
}

export async function getMyNotifications(userId) {
  const [notifications, unreadCount] = await Promise.all([
    notificationRepo.findByUser(userId),
    notificationRepo.countUnread(userId),
  ])
  return { notifications, unreadCount }
}

export async function markRead(id, userId) {
  const result = await notificationRepo.markRead(id, userId)
  if (result.count === 0) {
    throw new ApiError(404, 'NOTIFICATION_NOT_FOUND', 'The requested notification does not exist.')
  }
}

export async function markAllRead(userId) {
  await notificationRepo.markAllRead(userId)
}
