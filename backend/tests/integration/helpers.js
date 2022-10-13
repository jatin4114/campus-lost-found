import request from 'supertest'
import { createApp } from '../../src/app.js'
import { prisma } from '../../src/config/prisma.js'

export const app = createApp()

// The refresh token now travels only as an httpOnly cookie, never in the
// response body — returns a supertest `agent` (which keeps a cookie jar
// across requests) alongside the access token, so a test that needs to
// call /refresh or /logout can reuse the same agent and have the cookie
// sent automatically, the same way a real browser would.
export async function registerAndLogin({ name = 'Test User', email, password = 'Password123' } = {}) {
  const uniqueEmail = email ?? `test-${Date.now()}-${Math.random().toString(36).slice(2)}@cuchd.in`
  const agent = request.agent(app)

  await agent.post('/api/v1/auth/register').send({ name, email: uniqueEmail, password }).expect(201)

  // Bypass the real email-verification flow for tests: mark verified directly.
  await prisma.user.update({ where: { email: uniqueEmail }, data: { isVerified: true } })

  const loginRes = await agent.post('/api/v1/auth/login').send({ email: uniqueEmail, password }).expect(200)

  return { email: uniqueEmail, agent, ...loginRes.body.data }
}

export async function getFirstCategoryId() {
  const res = await request(app).get('/api/v1/categories').expect(200)
  return res.body.data.categories[0].id
}

export async function getFirstLocationId() {
  const res = await request(app).get('/api/v1/locations').expect(200)
  return res.body.data.locations[0].id
}
