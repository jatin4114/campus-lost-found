import { prisma } from '../config/prisma.js'

export function findAll() {
  return prisma.category.findMany({ orderBy: { name: 'asc' } })
}

export function create(name) {
  return prisma.category.create({ data: { name } })
}

export function update(id, name) {
  return prisma.category.update({ where: { id }, data: { name } })
}

export function remove(id) {
  return prisma.category.delete({ where: { id } })
}
