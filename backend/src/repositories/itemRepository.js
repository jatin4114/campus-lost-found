import { prisma } from '../config/prisma.js'

const includeDefault = {
  images: { orderBy: { position: 'asc' } },
  category: true,
  location: true,
  user: { select: { id: true, name: true, avatarUrl: true } },
}

export function create(data) {
  return prisma.item.create({ data, include: includeDefault })
}

export function findById(id) {
  return prisma.item.findUnique({ where: { id }, include: includeDefault })
}

export function update(id, data) {
  return prisma.item.update({ where: { id }, data, include: includeDefault })
}

export function remove(id) {
  return prisma.item.delete({ where: { id } })
}

export function findActiveByTypeAndCategory(type, categoryId, excludeItemId) {
  return prisma.item.findMany({
    where: {
      type,
      categoryId,
      status: 'ACTIVE',
      id: { not: excludeItemId },
    },
    include: includeDefault,
  })
}

function buildWhere({ search, type, category, location, status, dateFrom, dateTo }) {
  const where = {}
  if (type) where.type = type
  if (category) where.categoryId = category
  if (location) where.locationId = location
  if (status) where.status = status
  else where.status = { not: 'EXPIRED' }

  if (dateFrom || dateTo) {
    where.eventDate = {}
    if (dateFrom) where.eventDate.gte = dateFrom
    if (dateTo) where.eventDate.lte = dateTo
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ]
  }

  return where
}

function buildOrderBy(sort) {
  if (sort === 'oldest') return { createdAt: 'asc' }
  if (sort === 'eventDate') return { eventDate: 'desc' }
  return { createdAt: 'desc' }
}

export async function search(filters) {
  const where = buildWhere(filters)
  const orderBy = buildOrderBy(filters.sort)
  const skip = (filters.page - 1) * filters.limit

  const [data, total] = await Promise.all([
    prisma.item.findMany({ where, orderBy, skip, take: filters.limit, include: includeDefault }),
    prisma.item.count({ where }),
  ])

  return {
    data,
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / filters.limit)),
    },
  }
}

export function findByUser(userId) {
  return prisma.item.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, include: includeDefault })
}
