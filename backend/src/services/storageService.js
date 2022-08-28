// Local-disk storage for development. Swap this module for an S3/Cloudinary-
// backed implementation to go to production — callers only depend on this
// save/delete interface, never on the filesystem directly.

import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads')

const MAX_DIMENSION = 1600
const THUMBNAIL_WIDTH = 400

// Re-encoding to webp via sharp (without .withMetadata()) strips EXIF by
// default — including GPS coordinates a phone camera embeds, which we don't
// want silently exposed to whoever views an uploaded photo.
export async function save(buffer) {
  await fs.mkdir(UPLOAD_DIR, { recursive: true })

  const id = crypto.randomUUID()
  const storageKey = `${id}.webp`
  const thumbnailStorageKey = `${id}-thumb.webp`

  const image = sharp(buffer).rotate() // auto-orient from EXIF before it's stripped

  await image
    .clone()
    .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 85 })
    .toFile(path.join(UPLOAD_DIR, storageKey))

  await image
    .clone()
    .resize({ width: THUMBNAIL_WIDTH, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(path.join(UPLOAD_DIR, thumbnailStorageKey))

  return {
    storageKey,
    url: `/uploads/${storageKey}`,
    thumbnailStorageKey,
    thumbnailUrl: `/uploads/${thumbnailStorageKey}`,
  }
}

export async function remove(storageKey, thumbnailStorageKey) {
  await fs.unlink(path.join(UPLOAD_DIR, storageKey)).catch(() => {})
  if (thumbnailStorageKey) {
    await fs.unlink(path.join(UPLOAD_DIR, thumbnailStorageKey)).catch(() => {})
  }
}

export { UPLOAD_DIR }
