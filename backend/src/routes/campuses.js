import { Router } from 'express'
import * as campusController from '../controllers/campusController.js'

export const campusRouter = Router()

campusRouter.get('/', campusController.list)
