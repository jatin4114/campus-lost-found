import * as campusRepo from '../repositories/campusRepository.js'

export async function list(req, res) {
  const campuses = await campusRepo.findAll()
  res.json({ success: true, data: { campuses } })
}
