import { z } from 'zod';
import { Review } from '../models/Review.js';
import { Booking } from '../models/Booking.js';
import { SellerProfile } from '../models/SellerProfile.js';
import { Report } from '../models/Report.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const reviewSchema = z.object({
  bookingId: z.string().min(1),
  overallRating: z.number().int().min(1).max(5),
  subRatings: z.object({
  serviceQuality: z.number().int().min(1).max(5),
  priceFairness: z.number().int().min(1).max(5),
  communication: z.number().int().min(1).max(5),
  timeliness: z.number().int().min(1).max(5),
  }),
  text: z.string().min(10).max(2000),
  photos: z.array(z.union([z.string().url(), z.string().startsWith('data:image/')])).default([]),
});

const replySchema = z.object({
  text: z.string().min(1).max(1000),
});

const flagSchema = z.object({
  reason: z.string().min(3).max(200),
  description: z.string().max(2000).optional(),
});

export const createReview = asyncHandler(async (req, res) => {
  const data = reviewSchema.parse(req.body);

  const booking = await Booking.findById(data.bookingId);
  if (!booking) {
  throw new ApiError(404, 'Booking not found');
  }
  if (booking.status !== 'completed') {
  throw new ApiError(400, 'Reviews can only be created for completed bookings');
  }
  if (String(booking.userId) !== String(req.user._id)) {
  throw new ApiError(403, 'Only the booking customer can leave a review');
  }

  const existing = await Review.findOne({ bookingId: data.bookingId });
  if (existing && !existing.isDeleted) {
  throw new ApiError(409, 'You already reviewed this booking');
  }

  const review = await Review.create({
  bookingId: data.bookingId,
  userId: req.user._id,
  sellerId: booking.sellerId,
  overallRating: data.overallRating,
  subRatings: data.subRatings,
  text: data.text,
  photos: data.photos,
  });

  res.status(201).json(new ApiResponse('Review submitted', review));
});

export const listSellerReviews = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));

  const sellerFilter = req.query.sellerId
  ? { sellerId: String(req.query.sellerId) }
  : {};

  const filter = { isDeleted: false, ...sellerFilter };

  const [total, summary, reviews] = await Promise.all([
  Review.countDocuments(filter),
  Review.aggregate([
  { $match: filter },
  {
  $group: {
  _id: null,
  avgRating: { $avg: '$overallRating' },
  count: { $sum: 1 },
  distribution: {
  $push: { rating: '$overallRating' },
  },
  },
  },
  ]),
  Review.find(filter)
  .sort({ createdAt: -1 })
  .skip((page - 1) * limit)
  .limit(limit)
  .populate('userId', 'name avatar')
  .lean(),
  ]);

  res.json(
  new ApiResponse('Reviews fetched', {
  reviews,
  total,
  page,
  pages: Math.ceil(total / limit) || 1,
  summary: summary[0]
  ? {
  avgRating: Math.round(summary[0].avgRating * 10) / 10,
  count: summary[0].count,
  }
  : null,
  })
  );
});

export const replyToReview = asyncHandler(async (req, res) => {
  const { text } = replySchema.parse(req.body);

  const profile = await SellerProfile.findOne({ userId: req.user._id });
  if (!profile) {
  throw new ApiError(404, 'Seller profile not found');
  }

  const review = await Review.findOne({ _id: req.params.id, sellerId: profile._id });
  if (!review || review.isDeleted) {
  throw new ApiError(404, 'Review not found');
  }

  review.sellerReply = {
  text,
  repliedAt: new Date(),
  };
  await review.save();

  res.json(new ApiResponse('Reply posted', review));
});

export const flagReview = asyncHandler(async (req, res) => {
  const data = flagSchema.parse(req.body);

  const review = await Review.findById(req.params.id);
  if (!review || review.isDeleted) {
  throw new ApiError(404, 'Review not found');
  }

  review.isFlagged = true;
  review.flagReason = data.reason;
  await review.save();

  await Report.create({
  reporterId: req.user._id,
  targetType: 'review',
  targetId: review._id,
  reason: data.reason,
  description: data.description,
  });

  res.json(new ApiResponse('Review flagged for moderation', { id: review._id }));
});

export const listMyReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ userId: req.user._id, isDeleted: false })
  .sort({ createdAt: -1 })
  .populate('sellerId', 'businessName slug coverImage')
  .lean();

  res.json(new ApiResponse('My reviews fetched', reviews));
});