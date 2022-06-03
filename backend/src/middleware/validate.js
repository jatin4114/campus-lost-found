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
    // req.query is a read-only getter in Express 5; stash parsed/coerced
    // query params separately instead of reassigning it.
    if (result.data.query) req.parsedQuery = result.data.query
    if (result.data.params) req.parsedParams = result.data.params
    next()
  }
}
