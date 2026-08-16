import multer from 'multer';
import { ApiError } from '../utils/ApiError.js';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
  return cb(null, true);
  }
  cb(new ApiError(400, `File type not allowed: ${file.mimetype}. Allowed types: ${ALLOWED_TYPES.join(', ')}`));
};

export const uploadMemory = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
  fileFilter,
});

export const uploadImage = uploadMemory.single('image');
