import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { prisma } from '../../src/config/prisma.js'
import { app } from './helpers.js'

async function loginAsAdmin() {
  const res = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'admin@campus.edu', password: 'Password123!' })
    .expect(200)
  return res.body.data.accessToken
}

describe('campus email verification', () => {
  it('assigns the matching campus for a recognized domain', async () => {
    const email = `campus-match-${Date.now()}@campus.edu`
    await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Campus Match', email, password: 'Password123' })
      .expect(201)

    const user = await prisma.user.findUniqueOrThrow({ where: { email } })
    const campus = await prisma.campus.findUnique({ where: { domain: 'campus.edu' } })
    expect(user.campusId).toBe(campus.id)
  })

  it('rejects registration from an unrecognized email domain', async () => {
    const email = `not-campus-${Date.now()}@totally-unrelated-domain.com`
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Not Campus', email, password: 'Password123' })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('UNSUPPORTED_EMAIL_DOMAIN')
  })

  it('lets an admin create an additional campus, and the new domain is then accepted', async () => {
    const adminToken = await loginAsAdmin()
    const domain = `test-campus-${Date.now()}.edu`

    await request(app)
      .post('/api/v1/admin/campuses')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Second University', domain })
      .expect(201)

    const email = `student@${domain}`
    const registerRes = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'New Campus Student', email, password: 'Password123' })
    expect(registerRes.status).toBe(201)

    const user = await prisma.user.findUniqueOrThrow({ where: { email } })
    const campus = await prisma.campus.findUniqueOrThrow({ where: { domain } })
    expect(user.campusId).toBe(campus.id)
  })

  it('the public campuses list is readable without auth', async () => {
    const res = await request(app).get('/api/v1/campuses').expect(200)
    expect(res.body.data.campuses.length).toBeGreaterThan(0)
  })
})
