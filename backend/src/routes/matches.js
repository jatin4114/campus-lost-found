import { Router } from 'express'
import * as matchController from '../controllers/matchController.js'
import { requireAuth } from '../middleware/auth.js'

export const matchRouter = Router()

matchRouter.use(requireAuth)

matchRouter.get('/mine', matchController.mine)
matchRouter.post('/:id/dismiss', matchController.dismiss)
