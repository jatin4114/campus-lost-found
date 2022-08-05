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
  // jti makes two tokens minted for the same user within the same second
  // (jwt `iat` has second granularity) distinct — without it they'd be
  // byte-identical and collide on the tokenHash unique constraint.
  return jwt.sign({ sub: user.id, jti: crypto.randomUUID() }, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshTtl,
  })
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwt.refreshSecret)
}

export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

function signPurposeToken(user, purpose, expiresIn) {
  return jwt.sign({ sub: user.id, purpose }, env.jwt.emailVerificationSecret, { expiresIn })
}

function verifyPurposeToken(token, purpose) {
  const payload = jwt.verify(token, env.jwt.emailVerificationSecret)
  if (payload.purpose !== purpose) {
    throw new Error('Invalid token purpose')
  }
  return payload
}

export function signEmailVerificationToken(user) {
  return signPurposeToken(user, 'verify-email', '24h')
}

export function verifyEmailVerificationToken(token) {
  return verifyPurposeToken(token, 'verify-email')
}

// Embeds a short fingerprint of the current password hash so the token is
// naturally single-use: once the password changes, the fingerprint no
// longer matches and the old token is rejected — no separate revocation
// store needed.
function passwordFingerprint(passwordHash) {
  return crypto.createHash('sha256').update(passwordHash).digest('hex').slice(0, 16)
}

export function signPasswordResetToken(user) {
  return jwt.sign(
    { sub: user.id, purpose: 'reset-password', pwv: passwordFingerprint(user.passwordHash) },
    env.jwt.emailVerificationSecret,
    { expiresIn: '1h' },
  )
}

// Verifies signature/expiry/purpose (safe to call before we know which user
// this is for) and returns the payload, which includes `sub` and `pwv`.
export function decodePasswordResetToken(token) {
  return verifyPurposeToken(token, 'reset-password')
}

// Separate step: once we've looked up the user by `sub`, confirm the token
// was issued against their *current* password hash (i.e. hasn't already
// been used to reset it once).
export function passwordResetTokenMatchesCurrentHash(payload, currentPasswordHash) {
  return payload.pwv === passwordFingerprint(currentPasswordHash)
}
