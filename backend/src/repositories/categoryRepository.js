import { prisma } from '../config/prisma.js'

export function findAll() {
  return prisma.category.findMany({ orderBy: { name: 'asc' } })
}
