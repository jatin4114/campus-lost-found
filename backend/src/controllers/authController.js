import { ApiError } from '../middleware/errorHandler.js'
import { env } from '../config/env.js'
import * as userRepo from '../repositories/userRepository.js'
import * as authService from '../services/authService.js'

const REFRESH_COOKIE_NAME = 'refreshToken'
// Scoped to /api/v1/auth so it's never sent on unrelated requests, httpOnly
// so client-side JS (and therefore an XSS payload) can never read it, and
// sameSite=lax so it still travels on the same-site (localhost:5173 ->
// localhost:4000 counts as same-site — SameSite ignores port) cross-port
// dev requests this app makes.
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.nodeEnv === 'production',
  sameSite: 'lax',
  path: '/api/v1/auth',
  maxAge: env.jwt.refreshTtlMs,
}

function setRefreshCookie(res, refreshToken) {
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, REFRESH_COOKIE_OPTIONS)
}

function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE_NAME, { ...REFRESH_COOKIE_OPTIONS, maxAge: undefined })
}

function requireRefreshCookie(req) {
  const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME]
  if (!refreshToken) {
    throw new ApiError(401, 'INVALID_REFRESH_TOKEN', 'Refresh token is invalid or expired.')
  }
  return refreshToken
}

export async function register(req, res) {
  const user = await authService.register(req.body)
  res.status(201).json({ success: true, data: { user } })
}

export async function login(req, res) {
  const { refreshToken, ...rest } = await authService.login(req.body)
  setRefreshCookie(res, refreshToken)
  res.json({ success: true, data: rest })
}

export async function refresh(req, res) {
  const refreshToken = requireRefreshCookie(req)
  const result = await authService.refresh({ refreshToken })
  setRefreshCookie(res, result.refreshToken)
  res.json({ success: true, data: { user: result.user, accessToken: result.accessToken } })
}

export async function logout(req, res) {
  const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME]
  if (refreshToken) {
    await authService.logout({ refreshToken })
  }
  clearRefreshCookie(res)
  res.json({ success: true, data: null })
}

export async function verifyEmail(req, res) {
  const user = await authService.verifyEmail(req.body)
  res.json({ success: true, data: { user } })
}

export async function resendVerification(req, res) {
  await authService.resendVerification(req.body)
  res.json({ success: true, data: null })
}

export async function forgotPassword(req, res) {
  await authService.forgotPassword(req.body)
  res.json({ success: true, data: null })
}

export async function resetPassword(req, res) {
  await authService.resetPassword(req.body)
  res.json({ success: true, data: null })
}

export async function me(req, res) {
  const user = await userRepo.findById(req.user.id)
  res.json({ success: true, data: { user: userRepo.toPublicUser(user) } })
}
