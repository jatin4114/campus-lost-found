import * as adminService from '../services/adminService.js'
import * as auditLogService from '../services/auditLogService.js'
import * as moderationService from '../services/moderationService.js'
import * as reportService from '../services/reportService.js'
import * as taxonomyService from '../services/taxonomyService.js'
import { toCsv } from '../utils/csv.js'

function sendCsv(res, filename, csv) {
  res.setHeader('Content-Type', 'text/csv; charset=utf-8')
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
  res.send(csv)
}

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

export async function listCampuses(req, res) {
  res.json({ success: true, data: { campuses: await taxonomyService.listCampuses() } })
}

export async function createCampus(req, res) {
  const campus = await taxonomyService.createCampus(req.body)
  res.status(201).json({ success: true, data: { campus } })
}

export async function createCategory(req, res) {
  const category = await taxonomyService.createCategory(req.body.name)
  res.status(201).json({ success: true, data: { category } })
}

export async function updateCategory(req, res) {
  const category = await taxonomyService.updateCategory(req.params.id, req.body.name)
  res.json({ success: true, data: { category } })
}

export async function deleteCategory(req, res) {
  await taxonomyService.deleteCategory(req.params.id)
  res.json({ success: true, data: null })
}

export async function createLocation(req, res) {
  const location = await taxonomyService.createLocation(req.body)
  res.status(201).json({ success: true, data: { location } })
}

export async function updateLocation(req, res) {
  const location = await taxonomyService.updateLocation(req.params.id, req.body)
  res.json({ success: true, data: { location } })
}

export async function deleteLocation(req, res) {
  await taxonomyService.deleteLocation(req.params.id)
  res.json({ success: true, data: null })
}

export async function auditLogs(req, res) {
  res.json({ success: true, ...(await auditLogService.list(req.parsedQuery)) })
}

export async function exportUsers(req, res) {
  const users = await adminService.exportUsers()
  const csv = toCsv(users, [
    { label: 'id', value: (u) => u.id },
    { label: 'name', value: (u) => u.name },
    { label: 'email', value: (u) => u.email },
    { label: 'role', value: (u) => u.role },
    { label: 'isVerified', value: (u) => u.isVerified },
    { label: 'isActive', value: (u) => u.isActive },
    { label: 'createdAt', value: (u) => u.createdAt.toISOString() },
  ])
  await auditLogService.record(req.user.id, 'EXPORT_USERS', 'User', 'bulk', { ipAddress: req.ip })
  sendCsv(res, 'users.csv', csv)
}

export async function exportItems(req, res) {
  const items = await adminService.exportItems()
  const csv = toCsv(items, [
    { label: 'id', value: (i) => i.id },
    { label: 'type', value: (i) => i.type },
    { label: 'title', value: (i) => i.title },
    { label: 'status', value: (i) => i.status },
    { label: 'category', value: (i) => i.category?.name },
    { label: 'location', value: (i) => i.location?.name },
    { label: 'reportedBy', value: (i) => i.user?.name },
    { label: 'reportedByEmail', value: (i) => i.user?.email },
    { label: 'eventDate', value: (i) => i.eventDate.toISOString() },
    { label: 'createdAt', value: (i) => i.createdAt.toISOString() },
  ])
  await auditLogService.record(req.user.id, 'EXPORT_ITEMS', 'Item', 'bulk', { ipAddress: req.ip })
  sendCsv(res, 'items.csv', csv)
}

export async function exportReports(req, res) {
  const reports = await adminService.exportReports()
  const csv = toCsv(reports, [
    { label: 'id', value: (r) => r.id },
    { label: 'reason', value: (r) => r.reason },
    { label: 'status', value: (r) => r.status },
    { label: 'item', value: (r) => r.item?.title },
    { label: 'reportedBy', value: (r) => r.reporter?.name },
    { label: 'reportedByEmail', value: (r) => r.reporter?.email },
    { label: 'description', value: (r) => r.description },
    { label: 'createdAt', value: (r) => r.createdAt.toISOString() },
  ])
  await auditLogService.record(req.user.id, 'EXPORT_REPORTS', 'Report', 'bulk', { ipAddress: req.ip })
  sendCsv(res, 'reports.csv', csv)
}
