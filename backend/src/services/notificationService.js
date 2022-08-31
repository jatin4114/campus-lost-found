import { ApiError } from '../middleware/errorHandler.js'
import * as notificationRepo from '../repositories/notificationRepository.js'

export async function notify(userId, { type, title, message, metadata }) {
  return notificationRepo.create({ userId, type, title, message, metadata })
}

export async function getMyNotifications(userId, { page = 1, limit = 20 } = {}) {
  const [{ notifications, total }, unreadCount] = await Promise.all([
    notificationRepo.findByUser(userId, { page, limit }),
    notificationRepo.countUnread(userId),
  ])
  return {
    notifications,
    unreadCount,
    pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  }
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
