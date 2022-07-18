import request from 'supertest'
import { createApp } from '../../src/app.js'
import { prisma } from '../../src/config/prisma.js'

export const app = createApp()

export async function registerAndLogin({ name = 'Test User', email, password = 'Password123' } = {}) {
  const uniqueEmail = email ?? `test-${Date.now()}-${Math.random().toString(36).slice(2)}@campus.edu`

  await request(app).post('/api/v1/auth/register').send({ name, email: uniqueEmail, password }).expect(201)

  // Bypass the real email-verification flow for tests: mark verified directly.
  await prisma.user.update({ where: { email: uniqueEmail }, data: { isVerified: true } })

  const loginRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: uniqueEmail, password })
    .expect(200)

  return { email: uniqueEmail, ...loginRes.body.data }
}

export async function getFirstCategoryId() {
  const res = await request(app).get('/api/v1/categories').expect(200)
  return res.body.data.categories[0].id
}

export async function getFirstLocationId() {
  const res = await request(app).get('/api/v1/locations').expect(200)
  return res.body.data.locations[0].id
}
