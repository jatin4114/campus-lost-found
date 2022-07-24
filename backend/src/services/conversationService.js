import { ApiError } from '../middleware/errorHandler.js'
import * as conversationRepo from '../repositories/conversationRepository.js'
import * as messageRepo from '../repositories/messageRepository.js'
import { notify } from './notificationService.js'

export async function assertParticipant(conversationId, userId) {
  const membership = await conversationRepo.isParticipant(conversationId, userId)
  if (!membership) {
    throw new ApiError(403, 'FORBIDDEN', 'You are not part of this conversation.')
  }
  return membership
}

export async function getMyConversations(userId) {
  const conversations = await conversationRepo.findByUser(userId)
  return Promise.all(
    conversations.map(async (conversation) => {
      const membership = conversation.participants.find((p) => p.userId === userId)
      const unreadCount = await messageRepo.countUnread(conversation.id, userId, membership?.lastReadAt)
      return { ...conversation, unreadCount }
    }),
  )
}

export async function getConversation(conversationId, userId) {
  await assertParticipant(conversationId, userId)
  const conversation = await conversationRepo.findById(conversationId)
  if (!conversation) {
    throw new ApiError(404, 'CONVERSATION_NOT_FOUND', 'The requested conversation does not exist.')
  }
  return conversation
}

export async function getMessages(conversationId, userId) {
  await assertParticipant(conversationId, userId)
  return messageRepo.findByConversation(conversationId)
}

export async function sendMessage(conversationId, senderId, body) {
  await assertParticipant(conversationId, senderId)
  const message = await messageRepo.create({ conversationId, senderId, body })

  const conversation = await conversationRepo.findById(conversationId)
  const recipients = conversation.participants.filter((p) => p.userId !== senderId)
  for (const recipient of recipients) {
    await notify(recipient.userId, {
      type: 'NEW_MESSAGE',
      title: 'New message',
      message: body.length > 80 ? `${body.slice(0, 80)}…` : body,
      metadata: { conversationId },
    })
  }

  return message
}

export async function markRead(conversationId, userId) {
  await assertParticipant(conversationId, userId)
  await conversationRepo.markRead(conversationId, userId)
}
