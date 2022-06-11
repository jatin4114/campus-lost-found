// Local-disk storage for development. Swap this module for an S3/Cloudinary-
// backed implementation to go to production — callers only depend on this
// save/delete interface, never on the filesystem directly.

import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads')

export async function save(buffer, originalName) {
  await fs.mkdir(UPLOAD_DIR, { recursive: true })
  const ext = path.extname(originalName).toLowerCase()
  const storageKey = `${crypto.randomUUID()}${ext}`
  await fs.writeFile(path.join(UPLOAD_DIR, storageKey), buffer)
  return { storageKey, url: `/uploads/${storageKey}` }
}

export async function remove(storageKey) {
  await fs.unlink(path.join(UPLOAD_DIR, storageKey)).catch(() => {})
}

export { UPLOAD_DIR }
