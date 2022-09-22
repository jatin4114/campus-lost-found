import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { app, registerAndLogin } from './helpers.js'

async function loginAsAdmin() {
  const res = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'admin@campus.edu', password: 'Password123!' })
    .expect(200)
  return res.body.data.accessToken
}

describe('admin CSV export', () => {
  it('exports users as CSV with a header row and at least the seeded admin', async () => {
    const adminToken = await loginAsAdmin()
    const res = await request(app)
      .get('/api/v1/admin/export/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)

    expect(res.headers['content-type']).toContain('text/csv')
    expect(res.headers['content-disposition']).toContain('users.csv')
    const lines = res.text.trim().split('\n')
    expect(lines[0]).toBe('id,name,email,role,isVerified,isActive,createdAt')
    expect(lines.length).toBeGreaterThan(1)
  })

  it('exports items as CSV', async () => {
    const adminToken = await loginAsAdmin()
    const res = await request(app)
      .get('/api/v1/admin/export/items')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
    expect(res.text.split('\n')[0]).toContain('title')
  })

  it('rejects a non-admin', async () => {
    const student = await registerAndLogin()
    const res = await request(app)
      .get('/api/v1/admin/export/users')
      .set('Authorization', `Bearer ${student.accessToken}`)
    expect(res.status).toBe(403)
  })
})
