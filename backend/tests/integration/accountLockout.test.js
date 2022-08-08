import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { app, registerAndLogin } from './helpers.js'

describe('account lockout', () => {
  it('locks the account after 5 failed attempts, even with the correct password on the 6th try', async () => {
    const { email } = await registerAndLogin({ password: 'CorrectPassword1' })

    for (let i = 0; i < 5; i += 1) {
      const res = await request(app).post('/api/v1/auth/login').send({ email, password: 'WrongPassword1' })
      expect(res.status).toBe(401)
    }

    const lockedAttempt = await request(app)
      .post('/api/v1/auth/login')
      .send({ email, password: 'CorrectPassword1' })

    expect(lockedAttempt.status).toBe(423)
    expect(lockedAttempt.body.error.code).toBe('ACCOUNT_LOCKED')
  })

  it('resets the failed-attempt counter after a successful login', async () => {
    const { email } = await registerAndLogin({ password: 'CorrectPassword1' })

    await request(app).post('/api/v1/auth/login').send({ email, password: 'WrongPassword1' })
    await request(app).post('/api/v1/auth/login').send({ email, password: 'WrongPassword1' })

    const goodLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email, password: 'CorrectPassword1' })
    expect(goodLogin.status).toBe(200)

    // Two more wrong attempts shouldn't lock the account, since the counter
    // was reset by the successful login above (5 in a row would).
    await request(app).post('/api/v1/auth/login').send({ email, password: 'WrongPassword1' })
    const stillUnlocked = await request(app)
      .post('/api/v1/auth/login')
      .send({ email, password: 'WrongPassword1' })
    expect(stillUnlocked.status).toBe(401)
    expect(stillUnlocked.body.error.code).toBe('INVALID_CREDENTIALS')
  })
})
