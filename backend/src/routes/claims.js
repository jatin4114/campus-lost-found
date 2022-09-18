import { Router } from 'express'
import * as claimController from '../controllers/claimController.js'
import * as ratingController from '../controllers/ratingController.js'
import { requireAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { claimIdParamSchema } from '../validators/claimValidators.js'
import { submitRatingSchema } from '../validators/ratingValidators.js'

export const claimRouter = Router()

claimRouter.use(requireAuth)

claimRouter.get('/mine', claimController.mine)
claimRouter.get('/on-my-items', claimController.onMyItems)
claimRouter.get('/:id', validate(claimIdParamSchema), claimController.getOne)
claimRouter.post('/:id/accept', validate(claimIdParamSchema), claimController.accept)
claimRouter.post('/:id/reject', validate(claimIdParamSchema), claimController.reject)
claimRouter.post('/:id/cancel', validate(claimIdParamSchema), claimController.cancel)
claimRouter.post('/:id/rating', validate(submitRatingSchema), ratingController.submit)
claimRouter.get('/:id/ratings', validate(claimIdParamSchema), ratingController.listForClaim)
