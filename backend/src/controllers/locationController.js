import * as locationRepo from '../repositories/locationRepository.js'

export async function list(req, res) {
  const locations = await locationRepo.findAll()
  res.json({ success: true, data: { locations } })
}
