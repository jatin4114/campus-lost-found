import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import { env } from './config/env.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'
import { adminRouter } from './routes/admin.js'
import { authRouter } from './routes/auth.js'
import { categoryRouter } from './routes/categories.js'
import { conversationRouter } from './routes/conversations.js'
import { healthRouter } from './routes/health.js'
import { claimRouter } from './routes/claims.js'
import { itemRouter } from './routes/items.js'
import { locationRouter } from './routes/locations.js'
import { matchRouter } from './routes/matches.js'
import { reportRouter } from './routes/reports.js'
import { notificationRouter } from './routes/notifications.js'
import { UPLOAD_DIR } from './services/storageService.js'

export function createApp() {
  const app = express()

  app.use(helmet())
  app.use(cors({ origin: env.corsOrigin, credentials: true }))
  app.use(express.json())
  app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'))
  app.use('/uploads', express.static(UPLOAD_DIR))

  app.use('/api/v1/health', healthRouter)
  app.use('/api/v1/auth', authRouter)
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
