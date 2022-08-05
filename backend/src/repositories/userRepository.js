import { prisma } from '../config/prisma.js'

export function findByEmail(email) {
  return prisma.user.findUnique({ where: { email } })
}

export function findById(id) {
  return prisma.user.findUnique({ where: { id } })
}

export function createUser(data) {
  return prisma.user.create({ data })
}

export function markVerified(id) {
  return prisma.user.update({ where: { id }, data: { isVerified: true } })
}

export function updatePassword(id, passwordHash) {
  return prisma.user.update({ where: { id }, data: { passwordHash } })
}

export function setActive(id, isActive) {
  return prisma.user.update({ where: { id }, data: { isActive } })
}

export function findAll() {
  return prisma.user.findMany({ orderBy: { createdAt: 'desc' } })
}

export function toPublicUser(user) {
  // eslint-disable-next-line no-unused-vars -- destructuring strips passwordHash
  const { passwordHash: _passwordHash, ...publicUser } = user
  return publicUser
}
