import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { expireStaleItems } from '../../src/jobs/expireItems.js'
import { prisma } from '../../src/config/prisma.js'
import { app, getFirstCategoryId, getFirstLocationId, registerAndLogin } from './helpers.js'

async function createItemWithEventDate(accessToken, eventDate) {
  const categoryId = await getFirstCategoryId()
  const locationId = await getFirstLocationId()
  const res = await request(app)
    .post('/api/v1/items')
    .set('Authorization', `Bearer ${accessToken}`)
    .send({
      type: 'LOST',
      title: `Expiry test item ${Date.now()}`,
      description: 'A sufficiently long description for validation purposes.',
      categoryId,
      locationId,
      eventDate,
    })
    .expect(201)
  return res.body.data.item
}

describe('expireStaleItems', () => {
  it('expires an ACTIVE item whose event date is more than 30 days old', async () => {
    const { accessToken } = await registerAndLogin()
    const staleDate = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
    const item = await createItemWithEventDate(accessToken, staleDate)

    await expireStaleItems()

    const updated = await prisma.item.findUnique({ where: { id: item.id } })
    expect(updated.status).toBe('EXPIRED')
  })

  it('leaves a recent ACTIVE item untouched', async () => {
    const { accessToken } = await registerAndLogin()
    const recentDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    const item = await createItemWithEventDate(accessToken, recentDate)

    await expireStaleItems()

    const updated = await prisma.item.findUnique({ where: { id: item.id } })
    expect(updated.status).toBe('ACTIVE')
  })

  it('does not touch a stale item that is already CLAIMED/RESOLVED, not ACTIVE', async () => {
    const { accessToken } = await registerAndLogin()
    const staleDate = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
    const item = await createItemWithEventDate(accessToken, staleDate)

    await prisma.item.update({ where: { id: item.id }, data: { status: 'RESOLVED' } })
    await expireStaleItems()

    const updated = await prisma.item.findUnique({ where: { id: item.id } })
    expect(updated.status).toBe('RESOLVED')
  })
})
