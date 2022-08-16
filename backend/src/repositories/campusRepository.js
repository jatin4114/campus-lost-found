import { prisma } from '../config/prisma.js'

export function findAll() {
  return prisma.campus.findMany({ orderBy: { name: 'asc' } })
}

export function findByDomain(domain) {
  return prisma.campus.findUnique({ where: { domain } })
}

export function create({ name, domain }) {
  return prisma.campus.create({ data: { name, domain: domain || null } })
}
