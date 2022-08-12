import { Server } from 'socket.io'
import { env } from '../config/env.js'
import * as conversationService from '../services/conversationService.js'
import { createRateLimiter } from '../utils/rateLimiter.js'
import { verifyAccessToken } from '../utils/tokens.js'

const MAX_MESSAGE_LENGTH = 2000
const messageRateLimiter = createRateLimiter({ limit: 20, windowMs: 10_000 })

// Tracks how many active sockets each user has open, so presence only flips
// to "offline" once their last tab/connection disconnects.
const onlineUsers = new Map()

function markOnline(userId) {
  onlineUsers.set(userId, (onlineUsers.get(userId) ?? 0) + 1)
}

function markOffline(userId) {
  const count = (onlineUsers.get(userId) ?? 1) - 1
  if (count <= 0) onlineUsers.delete(userId)
  else onlineUsers.set(userId, count)
}

export function initSockets(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: env.corsOrigin, credentials: true },
  })

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token
      const payload = verifyAccessToken(token)
      socket.userId = payload.sub
      next()
    } catch {
      next(new Error('Unauthenticated'))
    }
  })

  io.on('connection', (socket) => {
    markOnline(socket.userId)
    socket.broadcast.emit('presence:update', { userId: socket.userId, online: true })

    socket.on('conversation:join', async (conversationId, callback) => {
      try {
        await conversationService.assertParticipant(conversationId, socket.userId)
        socket.join(`conversation:${conversationId}`)
        callback?.({ success: true })
      } catch {
        callback?.({ success: false, error: 'FORBIDDEN' })
      }
    })

    socket.on('message:send', async ({ conversationId, body }, callback) => {
      if (!messageRateLimiter.consume(socket.userId)) {
        return callback?.({ success: false, error: 'RATE_LIMITED' })
      }

      if (typeof body !== 'string' || body.trim().length === 0 || body.length > MAX_MESSAGE_LENGTH) {
        return callback?.({ success: false, error: 'VALIDATION_ERROR' })
      }

      try {
        const message = await conversationService.sendMessage(conversationId, socket.userId, body.trim())
        io.to(`conversation:${conversationId}`).emit('message:new', { conversationId, message })
        callback?.({ success: true, message })
      } catch (err) {
        callback?.({ success: false, error: err.code ?? 'INTERNAL_ERROR' })
      }
    })

    socket.on('typing', ({ conversationId, isTyping }) => {
      socket.to(`conversation:${conversationId}`).emit('typing', {
        conversationId,
        userId: socket.userId,
        isTyping,
      })
    })

    socket.on('presence:query', (userIds, callback) => {
      callback?.(Object.fromEntries(userIds.map((id) => [id, onlineUsers.has(id)])))
    })

    socket.on('disconnect', () => {
      markOffline(socket.userId)
      if (!onlineUsers.has(socket.userId)) {
        socket.broadcast.emit('presence:update', { userId: socket.userId, online: false })
      }
    })
  })

  return io
}
