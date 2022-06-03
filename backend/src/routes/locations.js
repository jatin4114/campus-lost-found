import { Router } from 'express'
import * as locationController from '../controllers/locationController.js'

export const locationRouter = Router()

locationRouter.get('/', locationController.list)
