import { ApiError } from '../middleware/errorHandler.js'
import * as reportRepo from '../repositories/reportRepository.js'
import { getItem } from './itemService.js'

export async function submitReport(reporterId, { itemId, reason, description }) {
  await getItem(itemId) // 404s if the item doesn't exist
  return reportRepo.create({ reporterId, itemId, reason, description })
}

export async function listReports(status) {
  return reportRepo.findAll({ status })
}

export async function getReport(id) {
  const report = await reportRepo.findById(id)
  if (!report) {
    throw new ApiError(404, 'REPORT_NOT_FOUND', 'The requested report does not exist.')
  }
  return report
}
