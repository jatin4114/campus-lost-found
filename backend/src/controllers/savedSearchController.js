import * as savedSearchService from '../services/savedSearchService.js'

export async function mine(req, res) {
  const savedSearches = await savedSearchService.getMySavedSearches(req.user.id)
  res.json({ success: true, data: { savedSearches } })
}

export async function create(req, res) {
  const savedSearch = await savedSearchService.createSavedSearch(req.user.id, req.body)
  res.status(201).json({ success: true, data: { savedSearch } })
}

export async function remove(req, res) {
  await savedSearchService.deleteSavedSearch(req.params.id, req.user.id)
  res.json({ success: true, data: null })
}
