import * as categoryRepo from '../repositories/categoryRepository.js'

export async function list(req, res) {
  const categories = await categoryRepo.findAll()
  res.json({ success: true, data: { categories } })
}
