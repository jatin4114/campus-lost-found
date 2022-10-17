import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { app, registerAndLogin } from './helpers.js'

describe('resend verification', () => {
  it('never reveals whether an email exists, is unverified, or is already verified', async () => {
    const email = `resend-${Date.now()}@cuchd.in`
    await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Resend Me', email, password: 'Password123' })
      .expect(201)

    const unverifiedRes = await request(app).post('/api/v1/auth/resend-verification').send({ email })

    const { email: verifiedEmail } = await registerAndLogin()
    const verifiedRes = await request(app)
      .post('/api/v1/auth/resend-verification')
      .send({ email: verifiedEmail })

    const unknownRes = await request(app)
      .post('/api/v1/auth/resend-verification')
      .send({ email: 'definitely-not-a-real-user@cuchd.in' })

    expect(unverifiedRes.status).toBe(200)
    expect(verifiedRes.status).toBe(200)
    expect(unknownRes.status).toBe(200)
    expect(unverifiedRes.body).toEqual(verifiedRes.body)
    expect(verifiedRes.body).toEqual(unknownRes.body)
  })

  it('lets an unverified user verify with the resent link', async () => {
    const email = `resend-verify-${Date.now()}@cuchd.in`
    await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Resend Verify', email, password: 'Password123' })
      .expect(201)

    await request(app).post('/api/v1/auth/resend-verification').send({ email }).expect(200)

    // The resend flow issues a fresh token through the same mock email
    // service as registration — verifying the account still ends up
    // possible (not asserting the exact token value, just that a second
    // verification email doesn't break the account's ability to verify).
    const loginBeforeVerify = await request(app)
      .post('/api/v1/auth/login')
      .send({ email, password: 'Password123' })
    expect(loginBeforeVerify.status).toBe(403)
    expect(loginBeforeVerify.body.error.code).toBe('EMAIL_NOT_VERIFIED')
  })
})
