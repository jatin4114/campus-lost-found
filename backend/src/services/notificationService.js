import { ApiError } from '../middleware/errorHandler.js'
import * as notificationRepo from '../repositories/notificationRepository.js'
import { getIo } from '../sockets/ioRegistry.js'

export async function notify(userId, { type, title, message, metadata }) {
  const notification = await notificationRepo.create({ userId, type, title, message, metadata })
  // Real-time delivery to any open tab for this user, in addition to the
  // persisted row the REST/poll path already serves. This only reaches a
  // browser tab that's currently open — true delivery while the browser
  // itself is closed would need a service worker + Web Push (VAPID keys),
  // which is a real follow-up, not something faked here.
  getIo()?.to(`user:${userId}`).emit('notification:new', notification)
  return notification
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
