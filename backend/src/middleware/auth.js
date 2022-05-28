import { ApiError } from './errorHandler.js'
import { verifyAccessToken } from '../utils/tokens.js'

export function requireAuth(req, res, next) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return next(new ApiError(401, 'UNAUTHENTICATED', 'Authentication is required.'))
  }

  try {
    const payload = verifyAccessToken(header.slice('Bearer '.length))
    req.user = { id: payload.sub, role: payload.role }
    next()
  } catch {
    next(new ApiError(401, 'UNAUTHENTICATED', 'Access token is invalid or expired.'))
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, 'FORBIDDEN', 'You do not have permission to perform this action.'))
    }
    next()
  }
}
