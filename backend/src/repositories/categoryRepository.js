import { prisma } from '../config/prisma.js'

export function findAll() {
  return prisma.category.findMany({ orderBy: { name: 'asc' } })
}

export function create(name) {
  return prisma.category.create({ data: { name } })
}
