import { prisma } from '../config/prisma.js'
import * as userRepo from '../repositories/userRepository.js'
import { record } from './auditLogService.js'

export async function getStats() {
  const [totalUsers, activeReports, resolvedReports, pendingClaims, reportedContent] = await Promise.all([
    prisma.user.count(),
    prisma.item.count({ where: { status: 'ACTIVE' } }),
    prisma.item.count({ where: { status: 'RESOLVED' } }),
    prisma.claim.count({ where: { status: 'PENDING' } }),
    prisma.report.count({ where: { status: 'PENDING' } }),
  ])

  const totalItems = activeReports + resolvedReports
  const resolutionRate = totalItems === 0 ? 0 : Math.round((resolvedReports / totalItems) * 1000) / 10

  return { totalUsers, activeReports, resolvedReports, pendingClaims, reportedContent, resolutionRate }
}

export async function listUsers() {
  return userRepo.findAll()
}

export async function setUserActive(userId, isActive, admin, requestMeta = {}) {
  const user = await userRepo.setActive(userId, isActive)
  await record(admin.id, isActive ? 'USER_REACTIVATED' : 'USER_SUSPENDED', 'User', userId, {
    ipAddress: requestMeta.ipAddress,
  })
  return userRepo.toPublicUser(user)
}
