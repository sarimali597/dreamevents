import { z } from 'zod';
import { FeedPost } from '../models/FeedPost.js';
import { SellerProfile } from '../models/SellerProfile.js';
import { Service } from '../models/Service.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const feedPostSchema = z.object({
  mediaUrl: z.union([z.string().url(), z.string().startsWith('data:image/')]),
  mediaType: z.enum(['image', 'video']).default('image'),
  caption: z.string().max(1000).optional(),
  taggedServiceId: z.string().optional(),
});

export const listFeedPosts = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));

  const total = await FeedPost.countDocuments();
  const posts = await FeedPost.find()
  .sort({ createdAt: -1 })
  .skip((page - 1) * limit)
  .limit(limit)
  .populate('sellerId', 'businessName slug coverImage logo category city')
  .populate('taggedServiceId', 'name price priceType')
  .lean();

  res.json(
  new ApiResponse('Feed posts fetched', {
  posts,
  total,
  page,
  pages: Math.ceil(total / limit) || 1,
  })
  );
});

export const createFeedPost = asyncHandler(async (req, res) => {
  const data = feedPostSchema.parse(req.body);

  const profile = await SellerProfile.findOne({ userId: req.user._id });
  if (!profile) {
  throw new ApiError(404, 'Seller profile not found');
  }

  if (data.taggedServiceId) {
  const service = await Service.findOne({ _id: data.taggedServiceId, sellerId: profile._id });
  if (!service) {
  throw new ApiError(404, 'Tagged service not found');
  }
  }

  const post = await FeedPost.create({
  sellerId: profile._id,
  ...data,
  });

  res.status(201).json(new ApiResponse('Feed post created', post));
});

export const deleteFeedPost = asyncHandler(async (req, res) => {
  const profile = await SellerProfile.findOne({ userId: req.user._id });
  if (!profile) {
  throw new ApiError(404, 'Seller profile not found');
  }

  const post = await FeedPost.findOneAndDelete({
  _id: req.params.id,
  sellerId: profile._id,
  });

  if (!post) {
  throw new ApiError(404, 'Feed post not found');
  }

  res.json(new ApiResponse('Feed post deleted', { id: post._id }));
});