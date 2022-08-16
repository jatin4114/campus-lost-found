import path from 'node:path'
import { fileURLToPath } from 'node:url'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import swaggerUi from 'swagger-ui-express'
import YAML from 'yamljs'
import { env } from './config/env.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'
import { adminRouter } from './routes/admin.js'
import { authRouter } from './routes/auth.js'
import { campusRouter } from './routes/campuses.js'
import { categoryRouter } from './routes/categories.js'
import { conversationRouter } from './routes/conversations.js'
import { healthRouter } from './routes/health.js'
import { claimRouter } from './routes/claims.js'
import { itemRouter } from './routes/items.js'
import { locationRouter } from './routes/locations.js'
import { matchRouter } from './routes/matches.js'
import { apiRateLimiter } from './middleware/rateLimit.js'
import { reportRouter } from './routes/reports.js'
import { notificationRouter } from './routes/notifications.js'
import { UPLOAD_DIR } from './services/storageService.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const openApiSpec = YAML.load(path.join(__dirname, '..', 'openapi.yaml'))

export function createApp() {
  const app = express()

  app.use(helmet())
  app.use(cors({ origin: env.corsOrigin, credentials: true }))
  app.use(express.json())
  app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'))
  app.use('/api', apiRateLimiter)
  app.use('/uploads', express.static(UPLOAD_DIR))
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec))

  app.use('/api/v1/health', healthRouter)
  app.use('/api/v1/auth', authRouter)
  app.use('/api/v1/campuses', campusRouter)
  app.use('/api/v1/categories', categoryRouter)
  app.use('/api/v1/locations', locationRouter)
  app.use('/api/v1/items', itemRouter)
  app.use('/api/v1/claims', claimRouter)
  app.use('/api/v1/matches', matchRouter)
  app.use('/api/v1/notifications', notificationRouter)
  app.use('/api/v1/conversations', conversationRouter)
  app.use('/api/v1/reports', reportRouter)
  app.use('/api/v1/admin', adminRouter)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
