import { createServer } from 'node:http'
import { createApp } from './app.js'
import { env } from './config/env.js'
import { initSockets } from './sockets/index.js'

const app = createApp()
const httpServer = createServer(app)
initSockets(httpServer)

httpServer.listen(env.port, () => {
  console.log(`CampusFind API listening on port ${env.port} (${env.nodeEnv})`)
})
