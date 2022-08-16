import { ApiError } from '../middleware/errorHandler.js'
import * as campusRepo from '../repositories/campusRepository.js'
import * as categoryRepo from '../repositories/categoryRepository.js'
import * as locationRepo from '../repositories/locationRepository.js'

function translatePrismaError(err, entityName) {
  if (err.code === 'P2025') {
    throw new ApiError(404, 'NOT_FOUND', `The requested ${entityName} does not exist.`)
  }

  // P2003 covers Prisma's own "known" FK-violation case, but a plain
  // RESTRICT constraint (as opposed to a Prisma-managed onDelete rule) comes
  // back as a PrismaClientUnknownRequestError with no .code at all — only
  // the underlying Postgres error text distinguishes it.
  const isForeignKeyViolation =
    err.code === 'P2003' || /foreign key constraint|violates restrict/i.test(err.message ?? '')
  if (isForeignKeyViolation) {
    throw new ApiError(
      409,
      `${entityName.toUpperCase()}_IN_USE`,
      `This ${entityName} is still referenced by existing items and can't be deleted.`,
    )
  }

  throw err
}

export async function listCampuses() {
  return campusRepo.findAll()
}

export async function createCampus(payload) {
  return campusRepo.create(payload)
}

export async function createCategory(name) {
  return categoryRepo.create(name)
}

export async function updateCategory(id, name) {
  try {
    return await categoryRepo.update(id, name)
  } catch (err) {
    translatePrismaError(err, 'category')
  }
}

export async function deleteCategory(id) {
  try {
    await categoryRepo.remove(id)
  } catch (err) {
    translatePrismaError(err, 'category')
  }
}

export async function createLocation(payload) {
  return locationRepo.create(payload)
}

export async function updateLocation(id, payload) {
  try {
    return await locationRepo.update(id, payload)
  } catch (err) {
    translatePrismaError(err, 'location')
  }
}

export async function deleteLocation(id) {
  try {
    await locationRepo.remove(id)
  } catch (err) {
    translatePrismaError(err, 'location')
  }
}
