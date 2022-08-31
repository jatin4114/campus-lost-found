import { Router } from 'express'
import * as notificationController from '../controllers/notificationController.js'
import { requireAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { paginationQuerySchema } from '../validators/paginationSchema.js'

export const notificationRouter = Router()

notificationRouter.use(requireAuth)

notificationRouter.get('/', validate(paginationQuerySchema), notificationController.mine)
notificationRouter.post('/read-all', notificationController.markAllRead)
notificationRouter.post('/:id/read', notificationController.markRead)
