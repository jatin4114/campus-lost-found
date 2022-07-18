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
      type: 'FOUND',
      title: 'Claimable Item',
      description: 'A sufficiently long description for validation purposes.',
      categoryId,
      locationId,
      eventDate: '2026-09-01',
      ...overrides,
    })
  return res.body.data.item
}

describe('claims workflow', () => {
  it('blocks claiming your own item', async () => {
    const owner = await registerAndLogin()
    const item = await createItem(owner.accessToken)

    const res = await request(app)
      .post(`/api/v1/items/${item.id}/claims`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({ message: 'trying to claim my own item here', evidence: [{ type: 'DESCRIPTION', content: 'mine' }] })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('CANNOT_CLAIM_OWN_ITEM')
  })

  it('requires at least one piece of evidence', async () => {
    const owner = await registerAndLogin()
    const claimant = await registerAndLogin()
    const item = await createItem(owner.accessToken)

    const res = await request(app)
      .post(`/api/v1/items/${item.id}/claims`)
      .set('Authorization', `Bearer ${claimant.accessToken}`)
      .send({ message: 'This is mine, I promise you it is mine.', evidence: [] })

    expect(res.status).toBe(400)
  })

  it('moves ACTIVE -> CLAIM_PENDING -> CLAIMED, and only the item owner can accept', async () => {
    const owner = await registerAndLogin()
    const claimant = await registerAndLogin()
    const item = await createItem(owner.accessToken)

    const claimRes = await request(app)
      .post(`/api/v1/items/${item.id}/claims`)
      .set('Authorization', `Bearer ${claimant.accessToken}`)
      .send({
        message: 'This is mine, it has a distinctive mark on it.',
        evidence: [{ type: 'IDENTIFYING_DETAIL', content: 'Scratch on the side.' }],
      })
      .expect(201)
    const claimId = claimRes.body.data.claim.id

    const itemAfterClaim = await request(app).get(`/api/v1/items/${item.id}`).expect(200)
    expect(itemAfterClaim.body.data.item.status).toBe('CLAIM_PENDING')

    const forbiddenAccept = await request(app)
      .post(`/api/v1/claims/${claimId}/accept`)
      .set('Authorization', `Bearer ${claimant.accessToken}`)
    expect(forbiddenAccept.status).toBe(403)

    await request(app)
      .post(`/api/v1/claims/${claimId}/accept`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .expect(200)

    const itemAfterAccept = await request(app).get(`/api/v1/items/${item.id}`).expect(200)
    expect(itemAfterAccept.body.data.item.status).toBe('CLAIMED')

    const secondAccept = await request(app)
      .post(`/api/v1/claims/${claimId}/accept`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
    expect(secondAccept.status).toBe(409)
    expect(secondAccept.body.error.code).toBe('INVALID_CLAIM_TRANSITION')
  })

  it('rejects claiming an item that is not ACTIVE', async () => {
    const owner = await registerAndLogin()
    const claimant = await registerAndLogin()
    const secondClaimant = await registerAndLogin()
    const item = await createItem(owner.accessToken)

    await request(app)
      .post(`/api/v1/items/${item.id}/claims`)
      .set('Authorization', `Bearer ${claimant.accessToken}`)
      .send({
        message: 'This is mine, first claimant.',
        evidence: [{ type: 'DESCRIPTION', content: 'It is mine.' }],
      })
      .expect(201)

    const secondClaim = await request(app)
      .post(`/api/v1/items/${item.id}/claims`)
      .set('Authorization', `Bearer ${secondClaimant.accessToken}`)
      .send({
        message: 'Actually it is mine, second claimant.',
        evidence: [{ type: 'DESCRIPTION', content: 'No really.' }],
      })

    expect(secondClaim.status).toBe(409)
    expect(secondClaim.body.error.code).toBe('ITEM_NOT_CLAIMABLE')
  })
})
