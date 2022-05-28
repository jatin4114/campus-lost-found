import { Router } from 'express'
import * as authController from '../controllers/authController.js'
import { requireAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import {
  loginSchema,
  refreshSchema,
  registerSchema,
  verifyEmailSchema,
} from '../validators/authValidators.js'

export const authRouter = Router()

authRouter.post('/register', validate(registerSchema), authController.register)
authRouter.post('/login', validate(loginSchema), authController.login)
authRouter.post('/refresh', validate(refreshSchema), authController.refresh)
authRouter.post('/logout', validate(refreshSchema), authController.logout)
authRouter.post('/verify-email', validate(verifyEmailSchema), authController.verifyEmail)
authRouter.get('/me', requireAuth, authController.me)
