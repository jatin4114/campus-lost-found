import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { prisma } from '../../src/config/prisma.js'
import { app, registerAndLogin } from './helpers.js'

describe('auth', () => {
  it('registers, requires verification before login, then logs in after verifying', async () => {
    const email = `verify-${Date.now()}@campus.edu`
    await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Verify Me', email, password: 'Password123' })
      .expect(201)

    const loginBeforeVerify = await request(app)
      .post('/api/v1/auth/login')
      .send({ email, password: 'Password123' })
    expect(loginBeforeVerify.status).toBe(403)
    expect(loginBeforeVerify.body.error.code).toBe('EMAIL_NOT_VERIFIED')

    await prisma.user.update({ where: { email }, data: { isVerified: true } })
    const loginAfterVerify = await request(app)
      .post('/api/v1/auth/login')
      .send({ email, password: 'Password123' })
      .expect(200)
    expect(loginAfterVerify.body.data.accessToken).toBeTruthy()
  })

  it('rejects duplicate email registration', async () => {
    const { email } = await registerAndLogin()
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Dup', email, password: 'Password123' })
    expect(res.status).toBe(409)
    expect(res.body.error.code).toBe('EMAIL_ALREADY_REGISTERED')
  })

  it('rejects a wrong password', async () => {
    const { email } = await registerAndLogin()
    const res = await request(app).post('/api/v1/auth/login').send({ email, password: 'WrongPassword1' })
    expect(res.status).toBe(401)
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS')
  })

  it('rotates the refresh token and rejects reuse of the old one', async () => {
    const { refreshToken } = await registerAndLogin()

    const first = await request(app).post('/api/v1/auth/refresh').send({ refreshToken }).expect(200)
    expect(first.body.data.refreshToken).not.toBe(refreshToken)

    const reuse = await request(app).post('/api/v1/auth/refresh').send({ refreshToken })
    expect(reuse.status).toBe(401)
    expect(reuse.body.error.code).toBe('INVALID_REFRESH_TOKEN')
  })

  it('rejects /me without a token and accepts it with one', async () => {
    const unauthed = await request(app).get('/api/v1/auth/me')
    expect(unauthed.status).toBe(401)

    const { accessToken } = await registerAndLogin()
    const authed = await request(app).get('/api/v1/auth/me').set('Authorization', `Bearer ${accessToken}`)
    expect(authed.status).toBe(200)
    expect(authed.body.data.user.passwordHash).toBeUndefined()
  })
})
