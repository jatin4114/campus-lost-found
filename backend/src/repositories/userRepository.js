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

const MAX_FAILED_ATTEMPTS = 5
const LOCKOUT_MS = 15 * 60 * 1000

export function recordFailedLogin(id, currentAttempts) {
  const attempts = currentAttempts + 1
  const data = { failedLoginAttempts: attempts }
  if (attempts >= MAX_FAILED_ATTEMPTS) {
    data.lockedUntil = new Date(Date.now() + LOCKOUT_MS)
    data.failedLoginAttempts = 0
  }
  return prisma.user.update({ where: { id }, data })
}

export function clearFailedLogins(id) {
  return prisma.user.update({ where: { id }, data: { failedLoginAttempts: 0, lockedUntil: null } })
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
