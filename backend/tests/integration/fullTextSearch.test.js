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
      title: 'Placeholder Title',
      description: 'A sufficiently long description for validation purposes.',
      categoryId,
      locationId,
      eventDate: '2026-09-01',
      ...overrides,
    })
  return res.body.data.item
}

describe('full-text search', () => {
  it('matches on word stems (plurals), not just exact substrings', async () => {
    const { accessToken } = await registerAndLogin()
    const marker = `marker${Date.now()}`
    // Singular "box" in the stored item; search the plural "boxes" plus the
    // marker token (websearch_to_tsquery ANDs bare words together) — this
    // only matches if Postgres's stemmer reduces "boxes" to "box", since an
    // ILIKE '%boxes%' substring search would never match "box".
    await createItem(accessToken, {
      title: `Small box ${marker}`,
      description: 'Left it near the sports complex.',
    })

    const res = await request(app).get('/api/v1/items').query({ search: `boxes ${marker}` })
    expect(res.status).toBe(200)
    expect(res.body.data.some((item) => item.title.includes(marker))).toBe(true)
  })

  it('ranks a title match above a description-only match', async () => {
    const { accessToken } = await registerAndLogin()
    const marker = Date.now()

    const descriptionOnlyMatch = await createItem(accessToken, {
      title: `Item A ${marker}`,
      description: `Mentions the word zephyrion${marker} only in passing here.`,
    })
    const titleMatch = await createItem(accessToken, {
      title: `zephyrion${marker} Backpack`,
      description: 'Nothing special about this description at all.',
    })

    const res = await request(app).get('/api/v1/items').query({ search: `zephyrion${marker}` }).expect(200)
    const ids = res.body.data.map((item) => item.id)
    expect(ids).toContain(titleMatch.id)
    expect(ids).toContain(descriptionOnlyMatch.id)
    expect(ids.indexOf(titleMatch.id)).toBeLessThan(ids.indexOf(descriptionOnlyMatch.id))
  })

  it('does not throw on punctuation-heavy input', async () => {
    const res = await request(app).get('/api/v1/items').query({ search: '""!! -- () **' })
    expect(res.status).toBe(200)
  })

  it('reports an accurate total count alongside paginated results', async () => {
    const { accessToken } = await registerAndLogin()
    const marker = `uniquemarker${Date.now()}`
    for (let i = 0; i < 3; i += 1) {
      await createItem(accessToken, { title: `${marker} item ${i}` })
    }

    const res = await request(app).get('/api/v1/items').query({ search: marker, page: 1, limit: 2 }).expect(200)
    expect(res.body.data).toHaveLength(2)
    expect(res.body.pagination.total).toBe(3)
    expect(res.body.pagination.totalPages).toBe(2)
  })
})
