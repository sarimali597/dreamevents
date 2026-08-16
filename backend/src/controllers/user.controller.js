import { z } from 'zod';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().optional(),
  city: z.string().optional(),
  avatar: z.union([z.string().url(), z.string().startsWith('data:image/')]).optional(),
  notificationPreferences: z
  .object({
  email: z.boolean().optional(),
  inApp: z.boolean().optional(),
  })
  .optional(),
});

const publicUser = (user) => ({
  _id: user._id,
  email: user.email,
  name: user.name,
  role: user.role,
  phone: user.phone ?? null,
  avatar: user.avatar ?? null,
  city: user.city ?? 'Sukkur',
  isEmailVerified: user.isEmailVerified,
  sellerProfileId: user.sellerProfileId ?? null,
  notificationPreferences: user.notificationPreferences,
  createdAt: user.createdAt,
});

export const getMe = asyncHandler(async (req, res) => {
  res.json(new ApiResponse('Profile fetched', publicUser(req.user)));
});

export const updateMe = asyncHandler(async (req, res) => {
  const data = updateUserSchema.parse(req.body);

  const user = await User.findById(req.user._id);
  if (!user) {
  throw new ApiError(404, 'User not found');
  }

  Object.assign(user, data);
  await user.save();

  res.json(new ApiResponse('Profile updated', publicUser(user.toObject())));
});