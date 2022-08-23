import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { app, getFirstCategoryId, getFirstLocationId, registerAndLogin } from './helpers.js'

describe('saved searches', () => {
  it('creates, lists, and deletes a saved search', async () => {
    const { accessToken } = await registerAndLogin()

    const created = await request(app)
      .post('/api/v1/saved-searches')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Electronics near library', type: 'FOUND' })
      .expect(201)
    const id = created.body.data.savedSearch.id

    const listed = await request(app)
      .get('/api/v1/saved-searches')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
    expect(listed.body.data.savedSearches.some((s) => s.id === id)).toBe(true)

    await request(app)
      .delete(`/api/v1/saved-searches/${id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)

    const listedAfter = await request(app)
      .get('/api/v1/saved-searches')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
    expect(listedAfter.body.data.savedSearches.some((s) => s.id === id)).toBe(false)
  })

  it("rejects deleting another user's saved search", async () => {
    const owner = await registerAndLogin()
    const other = await registerAndLogin()

    const created = await request(app)
      .post('/api/v1/saved-searches')
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({ name: 'Mine only' })
      .expect(201)

    const res = await request(app)
      .delete(`/api/v1/saved-searches/${created.body.data.savedSearch.id}`)
      .set('Authorization', `Bearer ${other.accessToken}`)
    expect(res.status).toBe(404)
  })

  it('notifies the saved-search owner when a matching item is created', async () => {
    const searcher = await registerAndLogin()
    const reporter = await registerAndLogin()
    const categoryId = await getFirstCategoryId()
    const locationId = await getFirstLocationId()
    const marker = `savedsearchmarker${Date.now()}`

    await request(app)
      .post('/api/v1/saved-searches')
      .set('Authorization', `Bearer ${searcher.accessToken}`)
      .send({ name: 'Marker alert', type: 'FOUND', search: marker })
      .expect(201)

    await request(app)
      .post('/api/v1/items')
      .set('Authorization', `Bearer ${reporter.accessToken}`)
      .send({
        type: 'FOUND',
        title: `Found something ${marker}`,
        description: 'A sufficiently long description for validation purposes.',
        categoryId,
        locationId,
        eventDate: '2026-09-01',
      })
      .expect(201)

    const notifications = await request(app)
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${searcher.accessToken}`)
      .expect(200)

    expect(
      notifications.body.data.notifications.some((n) => n.type === 'SAVED_SEARCH_MATCH'),
    ).toBe(true)
  })
})
