import { Router } from 'express'
import * as claimController from '../controllers/claimController.js'
import * as itemController from '../controllers/itemController.js'
import * as itemImageController from '../controllers/itemImageController.js'
import * as matchController from '../controllers/matchController.js'
import { requireAuth } from '../middleware/auth.js'
import { uploadItemImages } from '../middleware/upload.js'
import { validate } from '../middleware/validate.js'
import { createClaimSchema } from '../validators/claimValidators.js'
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

itemRouter.post('/:id/images', requireAuth, uploadItemImages, itemImageController.addImages)
itemRouter.delete('/:id/images/:imageId', requireAuth, itemImageController.removeImage)

itemRouter.post('/:itemId/claims', requireAuth, validate(createClaimSchema), claimController.create)

itemRouter.get('/:id/matches', requireAuth, matchController.forItem)
