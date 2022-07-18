import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { app, getFirstCategoryId, getFirstLocationId, registerAndLogin } from './helpers.js'

async function createItem(accessToken, overrides = {}) {
  const categoryId = await getFirstCategoryId()
  const locationId = await getFirstLocationId()
  const res = await request(app)
    .post('/api/v1/items')
    .set('Authorization', `Bearer ${accessToken}`)
    .send({
      type: 'LOST',
      title: 'Test Item',
      description: 'A sufficiently long description for validation purposes.',
      categoryId,
      locationId,
      eventDate: '2026-09-01',
      ...overrides,
    })
  return res
}

describe('items', () => {
  it('requires auth to create an item', async () => {
    const res = await request(app).post('/api/v1/items').send({})
    expect(res.status).toBe(401)
  })

  it('validates required fields', async () => {
    const { accessToken } = await registerAndLogin()
    const res = await request(app)
      .post('/api/v1/items')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'x' })
    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('creates, reads, updates, and deletes an item as its owner', async () => {
    const { accessToken } = await registerAndLogin()
    const created = await createItem(accessToken)
    expect(created.status).toBe(201)
    const itemId = created.body.data.item.id

    const fetched = await request(app).get(`/api/v1/items/${itemId}`).expect(200)
    expect(fetched.body.data.item.title).toBe('Test Item')

    const updated = await request(app)
      .put(`/api/v1/items/${itemId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'Updated Title' })
      .expect(200)
    expect(updated.body.data.item.title).toBe('Updated Title')

    await request(app)
      .delete(`/api/v1/items/${itemId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)

    await request(app).get(`/api/v1/items/${itemId}`).expect(404)
  })

  it('prevents a non-owner from editing or deleting someone else\'s item', async () => {
    const owner = await registerAndLogin()
    const other = await registerAndLogin()
    const created = await createItem(owner.accessToken)
    const itemId = created.body.data.item.id

    const editAttempt = await request(app)
      .put(`/api/v1/items/${itemId}`)
      .set('Authorization', `Bearer ${other.accessToken}`)
      .send({ title: 'Hijacked' })
    expect(editAttempt.status).toBe(403)

    const deleteAttempt = await request(app)
      .delete(`/api/v1/items/${itemId}`)
      .set('Authorization', `Bearer ${other.accessToken}`)
    expect(deleteAttempt.status).toBe(403)
  })

  it('supports search and pagination', async () => {
    const { accessToken } = await registerAndLogin()
    const uniqueTitle = `Findable-${Date.now()}`
    await createItem(accessToken, { title: uniqueTitle })

    const res = await request(app)
      .get('/api/v1/items')
      .query({ search: uniqueTitle, page: 1, limit: 5 })
      .expect(200)

    expect(res.body.data).toHaveLength(1)
    expect(res.body.data[0].title).toBe(uniqueTitle)
    expect(res.body.pagination).toMatchObject({ page: 1, limit: 5 })
  })
})
