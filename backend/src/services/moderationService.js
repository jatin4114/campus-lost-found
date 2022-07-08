import { ApiError } from '../middleware/errorHandler.js'
import * as itemRepo from '../repositories/itemRepository.js'
import * as moderationActionRepo from '../repositories/moderationActionRepository.js'
import * as reportRepo from '../repositories/reportRepository.js'
import * as userRepo from '../repositories/userRepository.js'
import { record } from './auditLogService.js'
import { getReport } from './reportService.js'

const VALID_ACTIONS = new Set(['DISMISS_REPORT', 'HIDE_ITEM', 'WARN_USER', 'SUSPEND_USER'])

export async function reviewReport(reportId, moderator, { action }, requestMeta = {}) {
  if (!VALID_ACTIONS.has(action)) {
    throw new ApiError(400, 'INVALID_MODERATION_ACTION', `Unknown moderation action: ${action}`)
  }

  const report = await getReport(reportId)
  if (report.status !== 'PENDING') {
    throw new ApiError(409, 'REPORT_ALREADY_REVIEWED', 'This report has already been reviewed.')
  }

  if (action === 'HIDE_ITEM') {
    await itemRepo.update(report.itemId, { status: 'EXPIRED' })
  }

  if (action === 'SUSPEND_USER') {
    await userRepo.setActive(report.item.userId, false)
  }

  const newStatus = action === 'DISMISS_REPORT' ? 'DISMISSED' : 'ACTIONED'
  const updatedReport = await reportRepo.updateStatus(reportId, newStatus, moderator.id)

  await moderationActionRepo.create({ reportId, moderatorId: moderator.id, action })

  await record(moderator.id, action, 'Report', reportId, {
    metadata: { itemId: report.itemId },
    ipAddress: requestMeta.ipAddress,
  })

  return updatedReport
}
