import * as notificationService from '../services/notificationService.js'

export async function mine(req, res) {
  const result = await notificationService.getMyNotifications(req.user.id)
  res.json({ success: true, data: result })
}

export async function markRead(req, res) {
  await notificationService.markRead(req.params.id, req.user.id)
  res.json({ success: true, data: null })
}

export async function markAllRead(req, res) {
  await notificationService.markAllRead(req.user.id)
  res.json({ success: true, data: null })
}
