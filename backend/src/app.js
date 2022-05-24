import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import { env } from './config/env.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'
import { healthRouter } from './routes/health.js'

export function createApp() {
  const app = express()

  app.use(helmet())
  app.use(cors({ origin: env.corsOrigin, credentials: true }))
  app.use(express.json())
  app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'))

  app.use('/api/v1/health', healthRouter)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
