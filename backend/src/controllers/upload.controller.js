import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { uploadToCloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';

export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
  throw new ApiError(400, 'image file is required');
  }

  const file = req.file;

  if (isCloudinaryConfigured()) {
  const { url, publicId } = await uploadToCloudinary(file.buffer, 'dreamevents', {
  resource_type: 'image',
  });
  return res.json(new ApiResponse('Image uploaded', { url, publicId, mode: 'cloudinary' }));
  }

  const dataUri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
  res.json(new ApiResponse('Image uploaded (demo mode)', { url: dataUri, mode: 'data-uri' }));
});
