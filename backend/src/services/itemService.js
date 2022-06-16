import { ApiError } from '../middleware/errorHandler.js'
import * as itemRepo from '../repositories/itemRepository.js'
import { generateMatchesForItem } from './matchingService.js'

const UNEDITABLE_STATUSES = new Set(['CLAIMED', 'RESOLVED'])

export async function createItem(userId, payload) {
  const item = await itemRepo.create({ ...payload, userId })
  // Matching runs against same-category active items and is cheap at this
  // scale; if the candidate set grows large this should move to a queue.
  await generateMatchesForItem(item).catch((err) => {
    console.error('Match generation failed for item', item.id, err)
  })
  return item
}

export async function getItem(id) {
  const item = await itemRepo.findById(id)
  if (!item) {
    throw new ApiError(404, 'ITEM_NOT_FOUND', 'The requested item does not exist.')
  }
  return item
}

function assertOwnerOrModerator(item, user) {
  const isOwner = item.userId === user.id
  const isPrivileged = user.role === 'ADMIN' || user.role === 'MODERATOR'
  if (!isOwner && !isPrivileged) {
    throw new ApiError(403, 'FORBIDDEN', 'You do not have permission to modify this item.')
  }
}

export async function updateItem(id, user, payload) {
  const item = await getItem(id)
  assertOwnerOrModerator(item, user)

  if (UNEDITABLE_STATUSES.has(item.status)) {
    throw new ApiError(409, 'ITEM_NOT_EDITABLE', `An item with status ${item.status} cannot be edited.`)
  }

  return itemRepo.update(id, payload)
}

export async function deleteItem(id, user) {
  const item = await getItem(id)
  assertOwnerOrModerator(item, user)

  if (UNEDITABLE_STATUSES.has(item.status)) {
    throw new ApiError(409, 'ITEM_NOT_EDITABLE', `An item with status ${item.status} cannot be deleted.`)
  }

  await itemRepo.remove(id)
}

export async function searchItems(filters) {
  return itemRepo.search(filters)
}

export async function getMyItems(userId) {
  return itemRepo.findByUser(userId)
}
