import * as itemImageService from '../services/itemImageService.js'

export async function addImages(req, res) {
  const item = await itemImageService.addImages(req.params.id, req.user, req.files)
  res.status(201).json({ success: true, data: { item } })
}

export async function removeImage(req, res) {
  const item = await itemImageService.removeImage(req.params.id, req.params.imageId, req.user)
  res.json({ success: true, data: { item } })
}
