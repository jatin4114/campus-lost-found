import crypto from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import pinoHttp from 'pino-http'
import swaggerUi from 'swagger-ui-express'
import YAML from 'yamljs'
import { env } from './config/env.js'
import { logger } from './config/logger.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'
import { adminRouter } from './routes/admin.js'
import { authRouter } from './routes/auth.js'
import { campusRouter } from './routes/campuses.js'
import { userRouter } from './routes/users.js'
import { categoryRouter } from './routes/categories.js'
import { conversationRouter } from './routes/conversations.js'
import { healthRouter } from './routes/health.js'
import { claimRouter } from './routes/claims.js'
import { itemRouter } from './routes/items.js'
import { locationRouter } from './routes/locations.js'
import { matchRouter } from './routes/matches.js'
import { apiRateLimiter } from './middleware/rateLimit.js'
import { reportRouter } from './routes/reports.js'
import { savedSearchRouter } from './routes/savedSearches.js'
import { notificationRouter } from './routes/notifications.js'
import { UPLOAD_DIR } from './services/storageService.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const openApiSpec = YAML.load(path.join(__dirname, '..', 'openapi.yaml'))

export function createApp() {
  const app = express()

  app.use(helmet())
  app.use(cors({ origin: env.corsOrigin, credentials: true }))
  app.use(express.json())
  app.use(cookieParser())
  app.use(
    pinoHttp({
      logger,
      // A random id per request when the client didn't supply one — lets a
      // support/debugging session grep every log line for one request
      // across services, not just eyeball adjacent lines and guess.
      genReqId: (req, res) => {
        const existing = req.headers['x-request-id']
        if (existing) return existing
        const id = crypto.randomUUID()
        res.setHeader('X-Request-Id', id)
        return id
      },
    }),
  )
  app.use('/api', apiRateLimiter)
  app.use('/uploads', express.static(UPLOAD_DIR))
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec))

  app.use('/api/v1/health', healthRouter)
  app.use('/api/v1/auth', authRouter)
  app.use('/api/v1/campuses', campusRouter)
  app.use('/api/v1/users', userRouter)
  app.use('/api/v1/categories', categoryRouter)
  app.use('/api/v1/locations', locationRouter)
  app.use('/api/v1/items', itemRouter)
  app.use('/api/v1/claims', claimRouter)
  app.use('/api/v1/matches', matchRouter)
  app.use('/api/v1/notifications', notificationRouter)
  app.use('/api/v1/conversations', conversationRouter)
  app.use('/api/v1/reports', reportRouter)
  app.use('/api/v1/saved-searches', savedSearchRouter)
  app.use('/api/v1/admin', adminRouter)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
