import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { prisma } from '../../src/config/prisma.js'
import { app, getFirstCategoryId, getFirstLocationId, registerAndLogin } from './helpers.js'

describe('item soft delete', () => {
  it('hides a deleted item from reads but keeps the row and audits the deletion', async () => {
    const { accessToken } = await registerAndLogin()
    const categoryId = await getFirstCategoryId()
    const locationId = await getFirstLocationId()

    const created = await request(app)
      .post('/api/v1/items')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        type: 'LOST',
        title: 'Soft Delete Me',
        description: 'A sufficiently long description for validation purposes.',
        categoryId,
        locationId,
        eventDate: '2026-09-01',
      })
      .expect(201)
    const itemId = created.body.data.item.id

    await request(app)
      .delete(`/api/v1/items/${itemId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)

    // Gone from the public API...
    await request(app).get(`/api/v1/items/${itemId}`).expect(404)
    const searchRes = await request(app).get('/api/v1/items').query({ search: 'Soft Delete Me' }).expect(200)
    expect(searchRes.body.data).toHaveLength(0)

    // ...but the row itself still exists, soft-deleted.
    const rawRow = await prisma.item.findUnique({ where: { id: itemId } })
    expect(rawRow).not.toBeNull()
    expect(rawRow.deletedAt).not.toBeNull()

    // ...and the deletion was audited.
    const auditEntry = await prisma.auditLog.findFirst({
      where: { entityType: 'Item', entityId: itemId, action: 'ITEM_DELETED' },
    })
    expect(auditEntry).not.toBeNull()
    expect(auditEntry.metadata).toMatchObject({ wasOwner: true })
  })
})
