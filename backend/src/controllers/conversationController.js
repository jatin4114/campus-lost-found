import * as conversationService from '../services/conversationService.js'

export async function mine(req, res) {
  const conversations = await conversationService.getMyConversations(req.user.id)
  res.json({ success: true, data: { conversations } })
}

export async function getOne(req, res) {
  const conversation = await conversationService.getConversation(req.params.id, req.user.id)
  res.json({ success: true, data: { conversation } })
}

export async function messages(req, res) {
  const messages = await conversationService.getMessages(req.params.id, req.user.id)
  res.json({ success: true, data: { messages } })
}

export async function markRead(req, res) {
  await conversationService.markRead(req.params.id, req.user.id)
  res.json({ success: true, data: null })
}
