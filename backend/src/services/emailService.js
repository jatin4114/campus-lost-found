// Mock email service for development. Swap the implementation for a real
// provider (Postmark/SES/etc.) behind this same interface when going to
// production — nothing calling this module needs to change.

import { logger } from '../config/logger.js'

export async function sendVerificationEmail(user, token) {
  const link = `http://localhost:5173/verify-email?token=${token}`
  logger.info({ email: user.email, link }, '[mock-email] verification link')
  return { delivered: true, link }
}

export async function sendPasswordResetEmail(user, token) {
  const link = `http://localhost:5173/reset-password?token=${token}`
  logger.info({ email: user.email, link }, '[mock-email] password reset link')
  return { delivered: true, link }
}
