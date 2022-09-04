import { createServer } from 'node:http'
import { createApp } from './app.js'
import { env } from './config/env.js'
import { logger } from './config/logger.js'
import { startExpiryJob } from './jobs/expireItems.js'
import { initSockets } from './sockets/index.js'

const app = createApp()
const httpServer = createServer(app)
initSockets(httpServer)
startExpiryJob()

httpServer.listen(env.port, () => {
  logger.info(`CampusFind API listening on port ${env.port} (${env.nodeEnv})`)
})
