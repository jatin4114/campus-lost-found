import { Router } from 'express'
import * as conversationController from '../controllers/conversationController.js'
import { requireAuth } from '../middleware/auth.js'

export const conversationRouter = Router()

conversationRouter.use(requireAuth)

conversationRouter.get('/', conversationController.mine)
conversationRouter.get('/:id', conversationController.getOne)
conversationRouter.get('/:id/messages', conversationController.messages)
conversationRouter.post('/:id/read', conversationController.markRead)
