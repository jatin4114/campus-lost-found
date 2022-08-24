import { prisma } from '../config/prisma.js'

const STALE_AFTER_DAYS = 30
const ONE_HOUR_MS = 60 * 60 * 1000

// Items report a real-world event date, not a "posted" date — an ACTIVE
// report about something that happened a month ago is almost certainly
// stale (found and never claimed, or the reporter moved on) and shouldn't
// keep cluttering search results forever.
export async function expireStaleItems() {
  const cutoff = new Date(Date.now() - STALE_AFTER_DAYS * 24 * 60 * 60 * 1000)

  const result = await prisma.item.updateMany({
    where: { status: 'ACTIVE', eventDate: { lt: cutoff }, deletedAt: null },
    data: { status: 'EXPIRED' },
  })

  if (result.count > 0) {
    console.log(`[expireItems] marked ${result.count} stale item(s) EXPIRED`)
  }

  return result.count
}

export function startExpiryJob(intervalMs = ONE_HOUR_MS) {
  expireStaleItems().catch((err) => console.error('[expireItems] initial run failed', err))
  return setInterval(() => {
    expireStaleItems().catch((err) => console.error('[expireItems] scheduled run failed', err))
  }, intervalMs)
}
