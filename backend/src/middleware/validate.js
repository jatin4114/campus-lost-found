import { ApiError } from './errorHandler.js'

// Validates req against a Zod schema shaped like { body?, params?, query? }.
export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse({ body: req.body, params: req.params, query: req.query })
    if (!result.success) {
      const message = result.error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join('; ')
      return next(new ApiError(400, 'VALIDATION_ERROR', message))
    }
    if (result.data.body) req.body = result.data.body
    if (result.data.query) req.query = result.data.query
    next()
  }
}
