import { ApiError } from '../middleware/errorHandler.js'
import * as itemImageRepo from '../repositories/itemImageRepository.js'
import { getItem } from './itemService.js'
import * as storageService from './storageService.js'

const MAX_IMAGES_PER_ITEM = 5

function assertOwner(item, user) {
  const isOwner = item.userId === user.id
  const isPrivileged = user.role === 'ADMIN' || user.role === 'MODERATOR'
  if (!isOwner && !isPrivileged) {
    throw new ApiError(403, 'FORBIDDEN', 'You do not have permission to modify this item.')
  }
}

export async function addImages(itemId, user, files) {
  const item = await getItem(itemId)
  assertOwner(item, user)

  if (!files?.length) {
    throw new ApiError(400, 'NO_FILES', 'No image files were provided.')
  }

  const existingCount = await itemImageRepo.countByItem(itemId)
  if (existingCount + files.length > MAX_IMAGES_PER_ITEM) {
    throw new ApiError(
      400,
      'TOO_MANY_IMAGES',
      `An item can have at most ${MAX_IMAGES_PER_ITEM} images (${existingCount} already uploaded).`,
    )
  }

  const saved = await Promise.all(files.map((file) => storageService.save(file.buffer)))

  await itemImageRepo.createMany(
    saved.map((s, index) => ({
      itemId,
      url: s.url,
      thumbnailUrl: s.thumbnailUrl,
      storageKey: s.storageKey,
      thumbnailStorageKey: s.thumbnailStorageKey,
      position: existingCount + index,
    })),
  )

  return getItem(itemId)
}

export async function removeImage(itemId, imageId, user) {
  const item = await getItem(itemId)
  assertOwner(item, user)

  const image = await itemImageRepo.findById(imageId)
  if (!image || image.itemId !== itemId) {
    throw new ApiError(404, 'IMAGE_NOT_FOUND', 'The requested image does not exist.')
  }

  await itemImageRepo.remove(imageId)
  await storageService.remove(image.storageKey, image.thumbnailStorageKey)

  return getItem(itemId)
}
