import zlib from 'node:zlib'
import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { app, getFirstCategoryId, getFirstLocationId, registerAndLogin } from './helpers.js'

// A minimal valid 4x4 PNG (bigger than 1x1 so sharp's resize has something
// real to do), built at test time rather than committing a binary fixture.
function makeTestPng() {
  function chunk(tag, data) {
    const buf = Buffer.alloc(8 + data.length + 4)
    buf.writeUInt32BE(data.length, 0)
    buf.write(tag, 4, 'ascii')
    data.copy(buf, 8)
    const crc = zlib.crc32(Buffer.concat([Buffer.from(tag), data]))
    buf.writeUInt32BE(crc >>> 0, 8 + data.length)
    return buf
  }
  const width = 4
  const height = 4
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr.writeUInt8(8, 8) // bit depth
  ihdr.writeUInt8(2, 9) // color type: RGB
  const rowSize = width * 3 + 1
  const raw = Buffer.alloc(rowSize * height)
  for (let y = 0; y < height; y += 1) {
    raw[y * rowSize] = 0
    for (let x = 0; x < width; x += 1) {
      raw[y * rowSize + 1 + x * 3] = 255
      raw[y * rowSize + 1 + x * 3 + 1] = 0
      raw[y * rowSize + 1 + x * 3 + 2] = 0
    }
  }
  const idat = zlib.deflateSync(raw)
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

async function createItem(accessToken) {
  const categoryId = await getFirstCategoryId()
  const locationId = await getFirstLocationId()
  const res = await request(app)
    .post('/api/v1/items')
    .set('Authorization', `Bearer ${accessToken}`)
    .send({
      type: 'LOST',
      title: `Image test item ${Date.now()}`,
      description: 'A sufficiently long description for validation purposes.',
      categoryId,
      locationId,
      eventDate: '2026-09-01',
    })
    .expect(201)
  return res.body.data.item
}

describe('item image upload pipeline', () => {
  it('uploads an image, generates a thumbnail, and serves both as webp', async () => {
    const { accessToken } = await registerAndLogin()
    const item = await createItem(accessToken)
    const png = makeTestPng()

    const uploadRes = await request(app)
      .post(`/api/v1/items/${item.id}/images`)
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('images', png, { filename: 'test.png', contentType: 'image/png' })
      .expect(201)

    const image = uploadRes.body.data.item.images[0]
    expect(image.url).toMatch(/\.webp$/)
    expect(image.thumbnailUrl).toMatch(/-thumb\.webp$/)

    const fullRes = await request(app).get(image.url)
    expect(fullRes.status).toBe(200)
    expect(fullRes.headers['content-type']).toBe('image/webp')

    const thumbRes = await request(app).get(image.thumbnailUrl)
    expect(thumbRes.status).toBe(200)
    expect(thumbRes.headers['content-type']).toBe('image/webp')
  })

  it('deletes both the full image and its thumbnail from disk', async () => {
    const { accessToken } = await registerAndLogin()
    const item = await createItem(accessToken)
    const png = makeTestPng()

    const uploadRes = await request(app)
      .post(`/api/v1/items/${item.id}/images`)
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('images', png, { filename: 'test.png', contentType: 'image/png' })
      .expect(201)
    const image = uploadRes.body.data.item.images[0]

    await request(app)
      .delete(`/api/v1/items/${item.id}/images/${image.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)

    const fullRes = await request(app).get(image.url)
    expect(fullRes.status).toBe(404)
    const thumbRes = await request(app).get(image.thumbnailUrl)
    expect(thumbRes.status).toBe(404)
  })

  it('rejects a non-image file', async () => {
    const { accessToken } = await registerAndLogin()
    const item = await createItem(accessToken)

    const res = await request(app)
      .post(`/api/v1/items/${item.id}/images`)
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('images', Buffer.from('not an image'), { filename: 'test.txt', contentType: 'text/plain' })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('INVALID_FILE_TYPE')
  })

  it("rejects a non-owner's upload", async () => {
    const owner = await registerAndLogin()
    const other = await registerAndLogin()
    const item = await createItem(owner.accessToken)

    const res = await request(app)
      .post(`/api/v1/items/${item.id}/images`)
      .set('Authorization', `Bearer ${other.accessToken}`)
      .attach('images', makeTestPng(), { filename: 'test.png', contentType: 'image/png' })

    expect(res.status).toBe(403)
  })
})
