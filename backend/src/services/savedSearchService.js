import { ApiError } from '../middleware/errorHandler.js'
import * as savedSearchRepo from '../repositories/savedSearchRepository.js'
import { notify } from './notificationService.js'

export async function getMySavedSearches(userId) {
  return savedSearchRepo.findByUser(userId)
}

export async function createSavedSearch(userId, payload) {
  return savedSearchRepo.create({ userId, ...payload })
}

export async function deleteSavedSearch(id, userId) {
  const savedSearch = await savedSearchRepo.findById(id)
  if (!savedSearch || savedSearch.userId !== userId) {
    throw new ApiError(404, 'SAVED_SEARCH_NOT_FOUND', 'The requested saved search does not exist.')
  }
  await savedSearchRepo.remove(id)
}

function matchesItem(savedSearch, item) {
  if (savedSearch.type && savedSearch.type !== item.type) return false
  if (savedSearch.categoryId && savedSearch.categoryId !== item.categoryId) return false
  if (savedSearch.locationId && savedSearch.locationId !== item.locationId) return false

  if (savedSearch.search) {
    const needle = savedSearch.search.toLowerCase()
    const haystack = `${item.title} ${item.description}`.toLowerCase()
    if (!haystack.includes(needle)) return false
  }

  return true
}

// Called after a new item is created: notifies every user whose saved
// search matches it. Simple substring matching for the text term (not the
// full tsvector machinery) since this only ever checks one new item against
// each saved filter, not a bulk search.
export async function notifyMatchingSavedSearches(item) {
  const savedSearches = await savedSearchRepo.findAll()

  for (const savedSearch of savedSearches) {
    if (savedSearch.userId === item.userId) continue
    if (!matchesItem(savedSearch, item)) continue

    await notify(savedSearch.userId, {
      type: 'SAVED_SEARCH_MATCH',
      title: 'New item matches your saved search',
      message: `"${item.title}" matches your saved search "${savedSearch.name}".`,
      metadata: { itemId: item.id, savedSearchId: savedSearch.id },
    })
  }
}
