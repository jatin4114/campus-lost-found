import { Router } from 'express'
import * as itemController from '../controllers/itemController.js'
import { requireAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import {
  createItemSchema,
  itemIdParamSchema,
  listItemsQuerySchema,
  updateItemSchema,
} from '../validators/itemValidators.js'

export const itemRouter = Router()

itemRouter.get('/', validate(listItemsQuerySchema), itemController.list)
itemRouter.get('/mine', requireAuth, itemController.mine)
itemRouter.get('/:id', validate(itemIdParamSchema), itemController.getOne)
itemRouter.post('/', requireAuth, validate(createItemSchema), itemController.create)
itemRouter.put('/:id', requireAuth, validate(updateItemSchema), itemController.update)
itemRouter.delete('/:id', requireAuth, validate(itemIdParamSchema), itemController.remove)
