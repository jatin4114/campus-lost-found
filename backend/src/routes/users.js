import { Router } from 'express'
import * as ratingController from '../controllers/ratingController.js'
import { validate } from '../middleware/validate.js'
import { userIdParamSchema } from '../validators/ratingValidators.js'

export const userRouter = Router()

userRouter.get('/:id/rating-summary', validate(userIdParamSchema), ratingController.summaryForUser)
