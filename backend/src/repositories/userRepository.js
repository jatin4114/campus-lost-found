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

export function toPublicUser(user) {
  const { passwordHash, ...publicUser } = user
  return publicUser
}
