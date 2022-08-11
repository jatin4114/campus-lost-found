import { prisma } from '../config/prisma.js'

export function findAll() {
  return prisma.location.findMany({ orderBy: { name: 'asc' } })
}

export function findById(id) {
  return prisma.location.findUnique({ where: { id } })
}

export function create({ campusId, name, building, latitude, longitude }) {
  return prisma.location.create({ data: { campusId, name, building, latitude, longitude } })
}

export function update(id, data) {
  return prisma.location.update({ where: { id }, data })
}

export function remove(id) {
  return prisma.location.delete({ where: { id } })
}
