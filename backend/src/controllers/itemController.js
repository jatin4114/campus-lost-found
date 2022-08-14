import * as itemService from '../services/itemService.js'

export async function create(req, res) {
  const item = await itemService.createItem(req.user.id, req.body)
  res.status(201).json({ success: true, data: { item } })
}

export async function getOne(req, res) {
  const item = await itemService.getItem(req.params.id)
  res.json({ success: true, data: { item } })
}

export async function update(req, res) {
  const item = await itemService.updateItem(req.params.id, req.user, req.body)
  res.json({ success: true, data: { item } })
}

export async function remove(req, res) {
  await itemService.deleteItem(req.params.id, req.user, { ipAddress: req.ip })
  res.json({ success: true, data: null })
}

export async function list(req, res) {
  const result = await itemService.searchItems(req.parsedQuery)
  res.json({ success: true, ...result })
}

export async function mine(req, res) {
  const items = await itemService.getMyItems(req.user.id)
  res.json({ success: true, data: { items } })
}
