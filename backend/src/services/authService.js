import argon2 from 'argon2'
import { ApiError } from '../middleware/errorHandler.js'
import * as refreshTokenRepo from '../repositories/refreshTokenRepository.js'
import * as userRepo from '../repositories/userRepository.js'
import { env } from '../config/env.js'
import { sendVerificationEmail } from './emailService.js'
import {
  hashToken,
  signAccessToken,
  signEmailVerificationToken,
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

  const passwordHash = await argon2.hash(password)
  const user = await userRepo.createUser({ name, email, passwordHash })

  const verificationToken = signEmailVerificationToken(user)
  await sendVerificationEmail(user, verificationToken)

  return userRepo.toPublicUser(user)
}

export async function login({ email, password }) {
  const user = await userRepo.findByEmail(email)
  if (!user) {
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'Incorrect email or password.')
  }

  const passwordMatches = await argon2.verify(user.passwordHash, password)
  if (!passwordMatches) {
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'Incorrect email or password.')
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
