import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { app, getFirstCategoryId, getFirstLocationId, registerAndLogin } from './helpers.js'

async function fullyResolvedClaim() {
  const owner = await registerAndLogin()
  const claimant = await registerAndLogin()
  const categoryId = await getFirstCategoryId()
  const locationId = await getFirstLocationId()

  const itemRes = await request(app)
    .post('/api/v1/items')
    .set('Authorization', `Bearer ${owner.accessToken}`)
    .send({
      type: 'FOUND',
      title: `Rating test item ${Date.now()}`,
      description: 'A sufficiently long description for validation purposes.',
      categoryId,
      locationId,
      eventDate: '2026-09-01',
    })
    .expect(201)
  const itemId = itemRes.body.data.item.id

  const claimRes = await request(app)
    .post(`/api/v1/items/${itemId}/claims`)
    .set('Authorization', `Bearer ${claimant.accessToken}`)
    .send({
      message: 'This is mine, distinctive mark on it.',
      evidence: [{ type: 'IDENTIFYING_DETAIL', content: 'Scratch on the side.' }],
    })
    .expect(201)
  const claimId = claimRes.body.data.claim.id

  await request(app)
    .post(`/api/v1/claims/${claimId}/accept`)
    .set('Authorization', `Bearer ${owner.accessToken}`)
    .expect(200)

  await request(app)
    .post(`/api/v1/items/${itemId}/resolve`)
    .set('Authorization', `Bearer ${owner.accessToken}`)
    .expect(200)

  return { owner, claimant, itemId, claimId }
}

describe('handover ratings', () => {
  it('lets both parties rate each other after resolution', async () => {
    const { owner, claimant, claimId } = await fullyResolvedClaim()

    await request(app)
      .post(`/api/v1/claims/${claimId}/rating`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({ score: 5, comment: 'Great, smooth handover.' })
      .expect(201)

    await request(app)
      .post(`/api/v1/claims/${claimId}/rating`)
      .set('Authorization', `Bearer ${claimant.accessToken}`)
      .send({ score: 4 })
      .expect(201)

    const ratings = await request(app)
      .get(`/api/v1/claims/${claimId}/ratings`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .expect(200)
    expect(ratings.body.data.ratings).toHaveLength(2)
  })

  it('rejects a second rating from the same party', async () => {
    const { owner, claimId } = await fullyResolvedClaim()

    await request(app)
      .post(`/api/v1/claims/${claimId}/rating`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({ score: 5 })
      .expect(201)

    const second = await request(app)
      .post(`/api/v1/claims/${claimId}/rating`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({ score: 3 })

    expect(second.status).toBe(409)
    expect(second.body.error.code).toBe('ALREADY_RATED')
  })

  it('rejects rating a claim that is not yet resolved', async () => {
    const owner = await registerAndLogin()
    const claimant = await registerAndLogin()
    const categoryId = await getFirstCategoryId()
    const locationId = await getFirstLocationId()

    const itemRes = await request(app)
      .post('/api/v1/items')
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({
        type: 'FOUND',
        title: `Unresolved rating test ${Date.now()}`,
        description: 'A sufficiently long description for validation purposes.',
        categoryId,
        locationId,
        eventDate: '2026-09-01',
      })
      .expect(201)
    const itemId = itemRes.body.data.item.id

    const claimRes = await request(app)
      .post(`/api/v1/items/${itemId}/claims`)
      .set('Authorization', `Bearer ${claimant.accessToken}`)
      .send({
        message: 'This is mine, has a mark on it.',
        evidence: [{ type: 'DESCRIPTION', content: 'It is mine.' }],
      })
      .expect(201)
    const claimId = claimRes.body.data.claim.id

    const res = await request(app)
      .post(`/api/v1/claims/${claimId}/rating`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({ score: 5 })

    expect(res.status).toBe(409)
    expect(res.body.error.code).toBe('HANDOVER_NOT_COMPLETE')
  })

  it('exposes an average rating summary for a user', async () => {
    const { owner, claimant, claimId } = await fullyResolvedClaim()

    await request(app)
      .post(`/api/v1/claims/${claimId}/rating`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({ score: 5 })
      .expect(201)

    const meRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${claimant.accessToken}`)
      .expect(200)
    const claimantId = meRes.body.data.user.id

    const summary = await request(app).get(`/api/v1/users/${claimantId}/rating-summary`).expect(200)
    expect(summary.body.data.count).toBeGreaterThanOrEqual(1)
    expect(summary.body.data.average).toBe(5)
  })
})
