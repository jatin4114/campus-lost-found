import multer from 'multer'
import { env } from '../config/env.js'

export class ApiError extends Error {
  constructor(status, code, message) {
    super(message)
    this.status = status
    this.code = code
  }
}

export function notFoundHandler(req, res, next) {
  next(new ApiError(404, 'NOT_FOUND', `Route not found: ${req.method} ${req.originalUrl}`))
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      error: { code: `UPLOAD_${err.code}`, message: err.message },
    })
  }

  const status = err.status ?? 500
  const code = err.code ?? 'INTERNAL_ERROR'
  const message = status === 500 && env.nodeEnv === 'production'
    ? 'Something went wrong.'
    : err.message

  if (status === 500) {
    console.error(err)
  }

  res.status(status).json({
    success: false,
    error: { code, message },
  })
}
