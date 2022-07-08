import * as adminService from '../services/adminService.js'
import * as auditLogService from '../services/auditLogService.js'
import * as categoryRepo from '../repositories/categoryRepository.js'
import * as locationRepo from '../repositories/locationRepository.js'
import * as moderationService from '../services/moderationService.js'
import * as reportService from '../services/reportService.js'

export async function stats(req, res) {
  res.json({ success: true, data: await adminService.getStats() })
}

export async function listUsers(req, res) {
  res.json({ success: true, data: { users: await adminService.listUsers() } })
}

export async function setUserActive(req, res) {
  const isActive = req.path.endsWith('/reactivate')
  const user = await adminService.setUserActive(req.params.id, isActive, req.user, { ipAddress: req.ip })
  res.json({ success: true, data: { user } })
}

export async function listReports(req, res) {
  res.json({ success: true, data: { reports: await reportService.listReports(req.parsedQuery?.status) } })
}

export async function reviewReport(req, res) {
  const report = await moderationService.reviewReport(req.params.id, req.user, req.body, { ipAddress: req.ip })
  res.json({ success: true, data: { report } })
}

export async function createCategory(req, res) {
  const category = await categoryRepo.create(req.body.name)
  res.status(201).json({ success: true, data: { category } })
}

export async function createLocation(req, res) {
  const location = await locationRepo.create(req.body)
  res.status(201).json({ success: true, data: { location } })
}

export async function auditLogs(req, res) {
  res.json({ success: true, ...(await auditLogService.list(req.parsedQuery)) })
}
