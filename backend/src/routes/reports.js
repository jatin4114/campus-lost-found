import { Router } from 'express'
import * as reportController from '../controllers/reportController.js'
import { requireAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { createReportSchema } from '../validators/reportValidators.js'

export const reportRouter = Router()

reportRouter.post('/', requireAuth, validate(createReportSchema), reportController.create)
