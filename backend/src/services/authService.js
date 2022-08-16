import argon2 from 'argon2'
import { ApiError } from '../middleware/errorHandler.js'
import * as campusRepo from '../repositories/campusRepository.js'
import * as refreshTokenRepo from '../repositories/refreshTokenRepository.js'
import * as userRepo from '../repositories/userRepository.js'
import { env } from '../config/env.js'
import { sendPasswordResetEmail, sendVerificationEmail } from './emailService.js'
import {
  decodePasswordResetToken,
  hashToken,
  passwordResetTokenMatchesCurrentHash,
  signAccessToken,
  signEmailVerificationToken,
  signPasswordResetToken,
  signRefreshToken,
  verifyEmailVerificationToken,
  verifyRefreshToken,
} from '../utils/tokens.js'

async function issueTokenPair(user) {
  const accessToken = signAccessToken(user)
  const refreshToken = signRefreshToken(user)
  await refreshTokenRepo.create({
    userId: user.id,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + env.jwt.refreshTtlMs),
  })
  return { accessToken, refreshToken }
}

export async function register({ name, email, password }) {
  const existing = await userRepo.findByEmail(email)
  if (existing) {
    throw new ApiError(409, 'EMAIL_ALREADY_REGISTERED', 'An account with this email already exists.')
  }

  // If any campus has a configured email domain, registration is limited to
  // recognized campus domains — this is what makes "which campus is this
  // user on" a real, verified fact rather than free text. A deployment with
  // no domain-restricted campuses (all domain: null) skips this entirely.
  const domain = email.split('@')[1]
  const campuses = await campusRepo.findAll()
  const domainRestricted = campuses.some((c) => c.domain)
  const matchedCampus = campuses.find((c) => c.domain === domain)

  if (domainRestricted && !matchedCampus) {
    throw new ApiError(
      400,
      'UNSUPPORTED_EMAIL_DOMAIN',
      'Registration is limited to recognized campus email addresses.',
    )
  }

  const passwordHash = await argon2.hash(password)
  const user = await userRepo.createUser({
    name,
    email,
    passwordHash,
    campusId: matchedCampus?.id,
  })

  const verificationToken = signEmailVerificationToken(user)
  await sendVerificationEmail(user, verificationToken)

  return userRepo.toPublicUser(user)
}

export async function login({ email, password }) {
  const user = await userRepo.findByEmail(email)
  if (!user) {
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'Incorrect email or password.')
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    throw new ApiError(
      423,
      'ACCOUNT_LOCKED',
      'Too many failed login attempts. Please try again in a few minutes.',
    )
  }

  const passwordMatches = await argon2.verify(user.passwordHash, password)
  if (!passwordMatches) {
    await userRepo.recordFailedLogin(user.id, user.failedLoginAttempts)
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'Incorrect email or password.')
  }

  if (user.failedLoginAttempts > 0 || user.lockedUntil) {
    await userRepo.clearFailedLogins(user.id)
  }

  if (!user.isActive) {
    throw new ApiError(403, 'ACCOUNT_DEACTIVATED', 'This account has been deactivated.')
  }

  if (!user.isVerified) {
    throw new ApiError(403, 'EMAIL_NOT_VERIFIED', 'Please verify your email before logging in.')
  }

  const tokens = await issueTokenPair(user)
  return { user: userRepo.toPublicUser(user), ...tokens }
}

export async function refresh({ refreshToken }) {
  let payload
  try {
    payload = verifyRefreshToken(refreshToken)
  } catch {
    throw new ApiError(401, 'INVALID_REFRESH_TOKEN', 'Refresh token is invalid or expired.')
  }

  const tokenHash = hashToken(refreshToken)
  const stored = await refreshTokenRepo.findByHash(tokenHash)
  if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
    throw new ApiError(401, 'INVALID_REFRESH_TOKEN', 'Refresh token is invalid or expired.')
  }

  const user = await userRepo.findById(payload.sub)
  if (!user || !user.isActive) {
    throw new ApiError(401, 'INVALID_REFRESH_TOKEN', 'Refresh token is invalid or expired.')
  }

  // Rotation: the presented refresh token is single-use.
  await refreshTokenRepo.revoke(stored.id)
  const tokens = await issueTokenPair(user)
  return { user: userRepo.toPublicUser(user), ...tokens }
}

export async function logout({ refreshToken }) {
  await refreshTokenRepo.revokeByHash(hashToken(refreshToken))
}

export async function verifyEmail({ token }) {
  let payload
  try {
    payload = verifyEmailVerificationToken(token)
  } catch {
    throw new ApiError(400, 'INVALID_VERIFICATION_TOKEN', 'Verification link is invalid or expired.')
  }

  const user = await userRepo.findById(payload.sub)
  if (!user) {
    throw new ApiError(400, 'INVALID_VERIFICATION_TOKEN', 'Verification link is invalid or expired.')
  }

  const updated = await userRepo.markVerified(user.id)
  return userRepo.toPublicUser(updated)
}

export async function forgotPassword({ email }) {
  const user = await userRepo.findByEmail(email)
  // Always report success — never reveal whether an email is registered.
  if (!user) return

  const token = signPasswordResetToken(user)
  await sendPasswordResetEmail(user, token)
}

export async function resetPassword({ token, password }) {
  let payload
  try {
    payload = decodePasswordResetToken(token)
  } catch {
    throw new ApiError(400, 'INVALID_RESET_TOKEN', 'This reset link is invalid or has expired.')
  }

  const user = await userRepo.findById(payload.sub)
  if (!user || !passwordResetTokenMatchesCurrentHash(payload, user.passwordHash)) {
    throw new ApiError(400, 'INVALID_RESET_TOKEN', 'This reset link is invalid or has expired.')
  }

  const passwordHash = await argon2.hash(password)
  await userRepo.updatePassword(user.id, passwordHash)
  await userRepo.clearFailedLogins(user.id)
  // Force re-login everywhere — a leaked-then-reset password shouldn't leave
  // old sessions alive.
  await refreshTokenRepo.revokeAllForUser(user.id)
}
