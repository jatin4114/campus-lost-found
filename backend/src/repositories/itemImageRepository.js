import { prisma } from '../config/prisma.js'

export function countByItem(itemId) {
  return prisma.itemImage.count({ where: { itemId } })
}

export function createMany(images) {
  return prisma.itemImage.createMany({ data: images })
}

export function findById(id) {
  return prisma.itemImage.findUnique({ where: { id } })
}

export function remove(id) {
  return prisma.itemImage.delete({ where: { id } })
}
