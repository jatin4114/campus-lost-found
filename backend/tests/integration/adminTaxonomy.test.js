import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { prisma } from '../../src/config/prisma.js'
import { app, getFirstCategoryId, registerAndLogin } from './helpers.js'

async function loginAsAdmin() {
  const admin = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'admin@campus.edu', password: 'Password123!' })
    .expect(200)
  return admin.body.data.accessToken
}

describe('admin category/location management', () => {
  it('creates, updates, and deletes a category', async () => {
    const adminToken = await loginAsAdmin()
    const name = `Test Category ${Date.now()}`

    const created = await request(app)
      .post('/api/v1/admin/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name })
      .expect(201)
    const categoryId = created.body.data.category.id

    const updated = await request(app)
      .put(`/api/v1/admin/categories/${categoryId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: `${name} (renamed)` })
      .expect(200)
    expect(updated.body.data.category.name).toBe(`${name} (renamed)`)

    await request(app)
      .delete(`/api/v1/admin/categories/${categoryId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)

    const gone = await prisma.category.findUnique({ where: { id: categoryId } })
    expect(gone).toBeNull()
  })

  it('rejects deleting a category that items still reference', async () => {
    const adminToken = await loginAsAdmin()
    const categoryId = await getFirstCategoryId()

    const res = await request(app)
      .delete(`/api/v1/admin/categories/${categoryId}`)
      .set('Authorization', `Bearer ${adminToken}`)

    expect(res.status).toBe(409)
    expect(res.body.error.code).toBe('CATEGORY_IN_USE')
  })

  it('requires ADMIN role, not just MODERATOR/STUDENT', async () => {
    const student = await registerAndLogin()
    const res = await request(app)
      .post('/api/v1/admin/categories')
      .set('Authorization', `Bearer ${student.accessToken}`)
      .send({ name: 'Should Not Be Created' })
    expect(res.status).toBe(403)
  })
})
