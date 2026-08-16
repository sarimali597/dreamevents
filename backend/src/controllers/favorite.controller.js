import { z } from 'zod';
import { Favorite } from '../models/Favorite.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const favoriteSchema = z.object({
  type: z.enum(['seller', 'feedPost']),
  sellerId: z.string().optional(),
  feedPostId: z.string().optional(),
});

export const createFavorite = asyncHandler(async (req, res) => {
  const data = favoriteSchema.parse(req.body);

  if (data.type === 'seller' && !data.sellerId) {
  throw new ApiError(400, 'sellerId is required for seller favorites');
  }
  if (data.type === 'feedPost' && !data.feedPostId) {
  throw new ApiError(400, 'feedPostId is required for feed post favorites');
  }

  const existing = await Favorite.findOne({
  userId: req.user._id,
  type: data.type,
  ...(data.type === 'seller' ? { sellerId: data.sellerId } : { feedPostId: data.feedPostId }),
  });

  if (existing) {
  return res.json(new ApiResponse('Already in favorites', existing));
  }

  const favorite = await Favorite.create({
  userId: req.user._id,
  ...data,
  });

  res.status(201).json(new ApiResponse('Added to favorites', favorite));
});

export const listFavorites = asyncHandler(async (req, res) => {
  const type = req.query.type === 'feedPost' ? 'feedPost' : 'seller';

  const favorites = await Favorite.find({ userId: req.user._id, type })
  .sort({ createdAt: -1 })
  .populate(
  type === 'seller' ? 'sellerId' : 'feedPostId',
  type === 'seller'
  ? 'businessName slug coverImage category city rating reviewCount'
  : 'mediaUrl mediaType caption createdAt'
  )
  .lean();

  res.json(new ApiResponse('Favorites fetched', favorites));
});

export const removeFavorite = asyncHandler(async (req, res) => {
  const favorite = await Favorite.findOneAndDelete({
  _id: req.params.id,
  userId: req.user._id,
  });

  if (!favorite) {
  throw new ApiError(404, 'Favorite not found');
  }

  res.json(new ApiResponse('Removed from favorites', { id: favorite._id }));
});

export const checkFavorite = asyncHandler(async (req, res) => {
  const { type, sellerId, feedPostId } = req.query;

  const filter = { userId: req.user._id };
  if (type === 'feedPost') {
  filter.feedPostId = feedPostId || null;
  filter.type = 'feedPost';
  } else {
  filter.sellerId = sellerId || null;
  filter.type = 'seller';
  }

  const favorite = await Favorite.findOne(filter).lean();
  res.json(new ApiResponse('Favorite status', { isFavorite: !!favorite, favorite }));
});