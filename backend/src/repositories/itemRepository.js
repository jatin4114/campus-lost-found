import { Prisma } from '@prisma/client'
import { prisma } from '../config/prisma.js'

const includeDefault = {
  images: { orderBy: { position: 'asc' } },
  category: true,
  location: true,
  user: { select: { id: true, name: true, avatarUrl: true } },
}

const notDeleted = { deletedAt: null }

export function create(data) {
  return prisma.item.create({ data, include: includeDefault })
}

export function findById(id) {
  return prisma.item.findFirst({ where: { id, ...notDeleted }, include: includeDefault })
}

export function update(id, data) {
  return prisma.item.update({ where: { id }, data, include: includeDefault })
}

// Soft delete: keeps the row (and its claims/images/matches history) for
// audit purposes, just hides it from every normal read path.
export function remove(id) {
  return prisma.item.update({ where: { id }, data: { deletedAt: new Date() } })
}

export function findActiveByTypeAndCategory(type, categoryId, excludeItemId) {
  return prisma.item.findMany({
    where: {
      type,
      categoryId,
      status: 'ACTIVE',
      id: { not: excludeItemId },
      ...notDeleted,
    },
    include: includeDefault,
  })
}

// Builds the shared structured-filter conditions as raw SQL fragments, so
// they apply identically whether or not a text search is also present.
function buildConditions({ type, category, location, status, dateFrom, dateTo }) {
  const conditions = [Prisma.sql`"deletedAt" IS NULL`]

  if (type) conditions.push(Prisma.sql`"type" = ${type}::"ItemType"`)
  if (category) conditions.push(Prisma.sql`"categoryId" = ${category}`)
  if (location) conditions.push(Prisma.sql`"locationId" = ${location}`)
  if (status) conditions.push(Prisma.sql`"status" = ${status}::"ItemStatus"`)
  else conditions.push(Prisma.sql`"status" != 'EXPIRED'::"ItemStatus"`)

  if (dateFrom) conditions.push(Prisma.sql`"eventDate" >= ${dateFrom}`)
  if (dateTo) conditions.push(Prisma.sql`"eventDate" <= ${dateTo}`)

  return conditions
}

function buildOrderBy(sort, hasSearch) {
  if (hasSearch) return Prisma.sql`rank DESC, "createdAt" DESC`
  if (sort === 'oldest') return Prisma.sql`"createdAt" ASC`
  if (sort === 'eventDate') return Prisma.sql`"eventDate" DESC`
  return Prisma.sql`"createdAt" DESC`
}

// Full-text search over the generated `searchVector` column (title weighted
// above description — see the migration) via websearch_to_tsquery, which
// tolerates free-form user input (quotes, "-exclude") without throwing the
// way plainto_tsquery can on stray punctuation. Falls back to a plain
// filtered/sorted query when there's no search term.
export async function search(filters) {
  const conditions = buildConditions(filters)
  const hasSearch = Boolean(filters.search)

  if (hasSearch) {
    conditions.push(Prisma.sql`"searchVector" @@ websearch_to_tsquery('english', ${filters.search})`)
  }

  const whereSql = Prisma.join(conditions, ' AND ')
  const rankSelect = hasSearch
    ? Prisma.sql`, ts_rank("searchVector", websearch_to_tsquery('english', ${filters.search})) AS rank`
    : Prisma.empty
  const orderBySql = buildOrderBy(filters.sort, hasSearch)
  const skip = (filters.page - 1) * filters.limit

  const [rows, totalRows] = await Promise.all([
    prisma.$queryRaw`
      SELECT "id"${rankSelect}
      FROM "Item"
      WHERE ${whereSql}
      ORDER BY ${orderBySql}
      LIMIT ${filters.limit} OFFSET ${skip}
    `,
    prisma.$queryRaw`SELECT COUNT(*)::int AS count FROM "Item" WHERE ${whereSql}`,
  ])

  const orderedIds = rows.map((r) => r.id)
  const items = orderedIds.length
    ? await prisma.item.findMany({ where: { id: { in: orderedIds } }, include: includeDefault })
    : []
  const itemsById = new Map(items.map((item) => [item.id, item]))
  const data = orderedIds.map((id) => itemsById.get(id)).filter(Boolean)

  const total = totalRows[0]?.count ?? 0

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
  return prisma.item.findMany({
    where: { userId, ...notDeleted },
    orderBy: { createdAt: 'desc' },
    include: includeDefault,
  })
}
