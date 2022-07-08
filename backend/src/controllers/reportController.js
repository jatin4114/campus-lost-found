import * as reportService from '../services/reportService.js'

export async function create(req, res) {
  const report = await reportService.submitReport(req.user.id, req.body)
  res.status(201).json({ success: true, data: { report } })
}
