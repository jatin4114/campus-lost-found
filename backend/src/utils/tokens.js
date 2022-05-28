import crypto from 'node:crypto'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

export function signAccessToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessTtl,
  })
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.jwt.accessSecret)
}

export function signRefreshToken(user) {
  return jwt.sign({ sub: user.id }, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshTtl,
  })
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwt.refreshSecret)
}

export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export function signEmailVerificationToken(user) {
  return jwt.sign({ sub: user.id, purpose: 'verify-email' }, env.jwt.emailVerificationSecret, {
    expiresIn: '24h',
  })
}

export function verifyEmailVerificationToken(token) {
  const payload = jwt.verify(token, env.jwt.emailVerificationSecret)
  if (payload.purpose !== 'verify-email') {
    throw new Error('Invalid token purpose')
  }
  return payload
}
