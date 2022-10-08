import { Router } from 'express'
import * as authController from '../controllers/authController.js'
import { requireAuth } from '../middleware/auth.js'
import { authRateLimiter } from '../middleware/rateLimit.js'
import { validate } from '../middleware/validate.js'
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from '../validators/authValidators.js'

export const authRouter = Router()

authRouter.post('/register', authRateLimiter, validate(registerSchema), authController.register)
authRouter.post('/login', authRateLimiter, validate(loginSchema), authController.login)
authRouter.post('/refresh', authController.refresh)
authRouter.post('/logout', authController.logout)
authRouter.post('/verify-email', validate(verifyEmailSchema), authController.verifyEmail)
authRouter.post('/forgot-password', authRateLimiter, validate(forgotPasswordSchema), authController.forgotPassword)
authRouter.post('/reset-password', authRateLimiter, validate(resetPasswordSchema), authController.resetPassword)
authRouter.get('/me', requireAuth, authController.me)
