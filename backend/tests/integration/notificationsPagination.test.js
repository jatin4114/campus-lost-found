import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { app, getFirstCategoryId, getFirstLocationId, registerAndLogin } from './helpers.js'

describe('notifications pagination', () => {
  it('paginates instead of silently capping at a fixed count', async () => {
    const reporter = await registerAndLogin()
    const searcher = await registerAndLogin()
    const categoryId = await getFirstCategoryId()
    const locationId = await getFirstLocationId()
    const marker = `notifpaginate${Date.now()}`

    await request(app)
      .post('/api/v1/saved-searches')
      .set('Authorization', `Bearer ${searcher.accessToken}`)
      .send({ name: 'Pagination test alert', search: marker })
      .expect(201)

    // Generate several notifications for `searcher` by creating several
    // items that match their saved search.
    for (let i = 0; i < 3; i += 1) {
      await request(app)
        .post('/api/v1/items')
        .set('Authorization', `Bearer ${reporter.accessToken}`)
        .send({
          type: 'LOST',
          title: `${marker} item ${i}`,
          description: 'A sufficiently long description for validation purposes.',
          categoryId,
          locationId,
          eventDate: '2026-09-01',
        })
        .expect(201)
    }

    const page1 = await request(app)
      .get('/api/v1/notifications')
      .query({ page: 1, limit: 2 })
      .set('Authorization', `Bearer ${searcher.accessToken}`)
      .expect(200)

    expect(page1.body.data.notifications).toHaveLength(2)
    expect(page1.body.data.pagination.total).toBeGreaterThanOrEqual(3)
    expect(page1.body.data.pagination.totalPages).toBeGreaterThanOrEqual(2)

    const page2 = await request(app)
      .get('/api/v1/notifications')
      .query({ page: 2, limit: 2 })
      .set('Authorization', `Bearer ${searcher.accessToken}`)
      .expect(200)

    const page1Ids = new Set(page1.body.data.notifications.map((n) => n.id))
    const page2Ids = new Set(page2.body.data.notifications.map((n) => n.id))
    expect([...page1Ids].some((id) => page2Ids.has(id))).toBe(false)
  })
})
