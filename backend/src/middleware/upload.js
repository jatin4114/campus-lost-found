import multer from 'multer'
import { ApiError } from './errorHandler.js'

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024
const MAX_FILES = 5

export const uploadItemImages = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES, files: MAX_FILES },
  fileFilter(req, file, cb) {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      return cb(new ApiError(400, 'INVALID_FILE_TYPE', 'Only JPEG, PNG, or WebP images are allowed.'))
    }
    cb(null, true)
  },
}).array('images', MAX_FILES)
