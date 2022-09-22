import { Router } from 'express'
import * as adminController from '../controllers/adminController.js'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import {
  createCampusSchema,
  createCategorySchema,
  createLocationSchema,
  idParamSchema,
  listReportsQuerySchema,
  paginationQuerySchema,
  updateCategorySchema,
  updateLocationSchema,
  userIdParamSchema,
} from '../validators/adminValidators.js'
import { reviewReportSchema } from '../validators/reportValidators.js'

export const adminRouter = Router()

adminRouter.use(requireAuth, requireRole('ADMIN', 'MODERATOR'))

adminRouter.get('/stats', adminController.stats)

adminRouter.get('/users', requireRole('ADMIN'), adminController.listUsers)
adminRouter.post('/users/:id/suspend', requireRole('ADMIN'), validate(userIdParamSchema), adminController.setUserActive)
adminRouter.post('/users/:id/reactivate', requireRole('ADMIN'), validate(userIdParamSchema), adminController.setUserActive)

adminRouter.get('/reports', validate(listReportsQuerySchema), adminController.listReports)
adminRouter.post('/reports/:id/review', validate(reviewReportSchema), adminController.reviewReport)

adminRouter.get('/campuses', requireRole('ADMIN'), adminController.listCampuses)
adminRouter.post('/campuses', requireRole('ADMIN'), validate(createCampusSchema), adminController.createCampus)

adminRouter.post('/categories', requireRole('ADMIN'), validate(createCategorySchema), adminController.createCategory)
adminRouter.put('/categories/:id', requireRole('ADMIN'), validate(updateCategorySchema), adminController.updateCategory)
adminRouter.delete('/categories/:id', requireRole('ADMIN'), validate(idParamSchema), adminController.deleteCategory)

adminRouter.post('/locations', requireRole('ADMIN'), validate(createLocationSchema), adminController.createLocation)
adminRouter.put('/locations/:id', requireRole('ADMIN'), validate(updateLocationSchema), adminController.updateLocation)
adminRouter.delete('/locations/:id', requireRole('ADMIN'), validate(idParamSchema), adminController.deleteLocation)

adminRouter.get('/audit-logs', requireRole('ADMIN'), validate(paginationQuerySchema), adminController.auditLogs)

adminRouter.get('/export/users', requireRole('ADMIN'), adminController.exportUsers)
adminRouter.get('/export/items', requireRole('ADMIN'), adminController.exportItems)
adminRouter.get('/export/reports', requireRole('ADMIN'), adminController.exportReports)
