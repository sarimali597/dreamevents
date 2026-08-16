import { v2 as cloudinary } from 'cloudinary';
import { env } from './env.js';
import { ApiError } from '../utils/ApiError.js';

let configured = false;

if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  });
  configured = true;
}

export const isCloudinaryConfigured = () => configured;

export const uploadToCloudinary = (buffer, folder, options = {}) => {
  return new Promise((resolve, reject) => {
  if (!configured) {
  return reject(new ApiError(503, 'Cloudinary is not configured'));
  }
  const stream = cloudinary.uploader.upload_stream(
  { folder, resource_type: 'auto', ...options },
  (error, result) => {
  if (error) {
  return reject(new ApiError(500, `Cloudinary upload failed: ${error.message}`));
  }
  resolve({ url: result.secure_url, publicId: result.public_id });
  }
  );
  stream.end(buffer);
  });
};

export const deleteFromCloudinary = (publicId) => {
  return new Promise((resolve, reject) => {
  if (!configured || !publicId) {
  return resolve();
  }
  cloudinary.uploader.destroy(publicId, (error, result) => {
  if (error) {
  return reject(new ApiError(500, `Cloudinary delete failed: ${error.message}`));
  }
  resolve(result);
  });
  });
};
