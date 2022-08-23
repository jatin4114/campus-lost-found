import { prisma } from '../config/prisma.js'

export function findByUser(userId) {
  return prisma.savedSearch.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } })
}

export function findAll() {
  return prisma.savedSearch.findMany()
}

export function create({ userId, name, type, categoryId, locationId, search }) {
  return prisma.savedSearch.create({ data: { userId, name, type, categoryId, locationId, search } })
}

export function findById(id) {
  return prisma.savedSearch.findUnique({ where: { id } })
}

export function remove(id) {
  return prisma.savedSearch.delete({ where: { id } })
}
