import { createServer } from 'node:http'
import request from 'supertest'
import { io as ioClient } from 'socket.io-client'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { initSockets } from '../../src/sockets/index.js'
import { app, getFirstCategoryId, getFirstLocationId, registerAndLogin } from './helpers.js'

let httpServer
let port

beforeAll(async () => {
  httpServer = createServer(app)
  initSockets(httpServer)
  await new Promise((resolve) => httpServer.listen(0, resolve))
  port = httpServer.address().port
})

afterAll(async () => {
  await new Promise((resolve) => httpServer.close(resolve))
})

function connectSocket(token) {
  return new Promise((resolve, reject) => {
    const socket = ioClient(`http://localhost:${port}`, { auth: { token }, transports: ['websocket'] })
    socket.on('connect', () => resolve(socket))
    socket.on('connect_error', reject)
  })
}

function joinConversation(socket, conversationId) {
  return new Promise((resolve, reject) => {
    socket.emit('conversation:join', conversationId, (res) => {
      if (res.success) resolve()
      else reject(new Error(JSON.stringify(res)))
    })
  })
}

async function acceptedClaimConversation() {
  const owner = await registerAndLogin()
  const claimant = await registerAndLogin()
  const categoryId = await getFirstCategoryId()
  const locationId = await getFirstLocationId()

  const itemRes = await request(app)
    .post('/api/v1/items')
    .set('Authorization', `Bearer ${owner.accessToken}`)
    .send({
      type: 'FOUND',
      title: `Messaging test item ${Date.now()}`,
      description: 'A sufficiently long description for validation purposes.',
      categoryId,
      locationId,
      eventDate: '2026-09-01',
    })
    .expect(201)
  const itemId = itemRes.body.data.item.id

  const claimRes = await request(app)
    .post(`/api/v1/items/${itemId}/claims`)
    .set('Authorization', `Bearer ${claimant.accessToken}`)
    .send({
      message: 'This is mine, has a distinctive mark.',
      evidence: [{ type: 'IDENTIFYING_DETAIL', content: 'Scratch on the side.' }],
    })
    .expect(201)
  const claimId = claimRes.body.data.claim.id

  const acceptRes = await request(app)
    .post(`/api/v1/claims/${claimId}/accept`)
    .set('Authorization', `Bearer ${owner.accessToken}`)
    .expect(200)

  return { owner, claimant, conversationId: acceptRes.body.data.conversationId }
}

describe('real-time messaging (socket.io)', () => {
  it('rejects a socket handshake with no token', async () => {
    await expect(connectSocket(undefined)).rejects.toBeTruthy()
  })

  it('rejects joining a conversation the user is not a participant of', async () => {
    await acceptedClaimConversation()
    const outsider = await registerAndLogin()
    const outsiderSocket = await connectSocket(outsider.accessToken)

    const result = await new Promise((resolve) => {
      outsiderSocket.emit('conversation:join', 'not-a-real-id', resolve)
    })
    expect(result.success).toBe(false)

    outsiderSocket.disconnect()
  })

  it('delivers a message in real time to the other participant and persists it', async () => {
    const { owner, claimant, conversationId } = await acceptedClaimConversation()
    const ownerSocket = await connectSocket(owner.accessToken)
    const claimantSocket = await connectSocket(claimant.accessToken)

    await joinConversation(ownerSocket, conversationId)
    await joinConversation(claimantSocket, conversationId)

    const received = new Promise((resolve) => {
      claimantSocket.on('message:new', resolve)
    })

    const sendResult = await new Promise((resolve) => {
      ownerSocket.emit('message:send', { conversationId, body: 'Where should we meet?' }, resolve)
    })
    expect(sendResult.success).toBe(true)

    const payload = await received
    expect(payload.message.body).toBe('Where should we meet?')

    const history = await request(app)
      .get(`/api/v1/conversations/${conversationId}/messages`)
      .set('Authorization', `Bearer ${claimant.accessToken}`)
      .expect(200)
    expect(history.body.data.messages.some((m) => m.body === 'Where should we meet?')).toBe(true)

    ownerSocket.disconnect()
    claimantSocket.disconnect()
  })

  it('broadcasts a typing indicator to the other participant only', async () => {
    const { owner, claimant, conversationId } = await acceptedClaimConversation()
    const ownerSocket = await connectSocket(owner.accessToken)
    const claimantSocket = await connectSocket(claimant.accessToken)

    await joinConversation(ownerSocket, conversationId)
    await joinConversation(claimantSocket, conversationId)

    const typingReceived = new Promise((resolve) => claimantSocket.on('typing', resolve))
    ownerSocket.emit('typing', { conversationId, isTyping: true })

    const payload = await typingReceived
    expect(payload.isTyping).toBe(true)
    expect(payload.userId).toBeTruthy()

    ownerSocket.disconnect()
    claimantSocket.disconnect()
  })
})
