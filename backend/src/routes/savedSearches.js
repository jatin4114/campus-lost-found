import { Router } from 'express'
import * as savedSearchController from '../controllers/savedSearchController.js'
import { requireAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { createSavedSearchSchema, savedSearchIdParamSchema } from '../validators/savedSearchValidators.js'

export const savedSearchRouter = Router()

savedSearchRouter.use(requireAuth)

savedSearchRouter.get('/', savedSearchController.mine)
savedSearchRouter.post('/', validate(createSavedSearchSchema), savedSearchController.create)
savedSearchRouter.delete('/:id', validate(savedSearchIdParamSchema), savedSearchController.remove)
