import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { signPasswordResetToken } from '../../src/utils/tokens.js'
import { prisma } from '../../src/config/prisma.js'
import { app, registerAndLogin } from './helpers.js'

describe('password reset', () => {
  it('forgot-password never reveals whether an email exists', async () => {
    const knownRes = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: 'alice@campus.edu' })
    const unknownRes = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: 'definitely-not-a-real-user@campus.edu' })

    expect(knownRes.status).toBe(200)
    expect(unknownRes.status).toBe(200)
    expect(knownRes.body).toEqual(unknownRes.body)
  })

  it('resets the password, logs in with the new one, and revokes old sessions', async () => {
    const { email, refreshToken } = await registerAndLogin({ password: 'OldPassword1' })
    const user = await prisma.user.findUniqueOrThrow({ where: { email } })
    const resetToken = signPasswordResetToken(user)

    await request(app)
      .post('/api/v1/auth/reset-password')
      .send({ token: resetToken, password: 'NewPassword2' })
      .expect(200)

    const oldPasswordLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email, password: 'OldPassword1' })
    expect(oldPasswordLogin.status).toBe(401)

    const newPasswordLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email, password: 'NewPassword2' })
    expect(newPasswordLogin.status).toBe(200)

    const oldRefreshAttempt = await request(app).post('/api/v1/auth/refresh').send({ refreshToken })
    expect(oldRefreshAttempt.status).toBe(401)
  })

  it('rejects a reset token that has already been used once', async () => {
    const { email } = await registerAndLogin({ password: 'FirstPassword1' })
    const user = await prisma.user.findUniqueOrThrow({ where: { email } })
    const resetToken = signPasswordResetToken(user)

    await request(app)
      .post('/api/v1/auth/reset-password')
      .send({ token: resetToken, password: 'SecondPassword2' })
      .expect(200)

    const reuse = await request(app)
      .post('/api/v1/auth/reset-password')
      .send({ token: resetToken, password: 'ThirdPassword3' })
    expect(reuse.status).toBe(400)
    expect(reuse.body.error.code).toBe('INVALID_RESET_TOKEN')
  })
})
