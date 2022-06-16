import { prisma } from '../config/prisma.js'

const itemInclude = {
  category: true,
  location: true,
  images: { orderBy: { position: 'asc' }, take: 1 },
}

export function upsert({ lostItemId, foundItemId, score }) {
  return prisma.match.upsert({
    where: { lostItemId_foundItemId: { lostItemId, foundItemId } },
    update: { score },
    create: { lostItemId, foundItemId, score },
  })
}

export function findForItem(itemId) {
  return prisma.match.findMany({
    where: { OR: [{ lostItemId: itemId }, { foundItemId: itemId }] },
    orderBy: { score: 'desc' },
    include: { lostItem: { include: itemInclude }, foundItem: { include: itemInclude } },
  })
}

export function findForUser(userId) {
  return prisma.match.findMany({
    where: {
      OR: [{ lostItem: { userId } }, { foundItem: { userId } }],
      status: { not: 'DISMISSED' },
    },
    orderBy: { score: 'desc' },
    include: { lostItem: { include: itemInclude }, foundItem: { include: itemInclude } },
  })
}

export function updateStatus(id, status) {
  return prisma.match.update({ where: { id }, data: { status } })
}
