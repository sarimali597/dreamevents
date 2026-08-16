import { z } from 'zod';
import { SellerProfile } from '../models/SellerProfile.js';
import { BookingRequest } from '../models/BookingRequest.js';
import { Booking } from '../models/Booking.js';
import { Message } from '../models/Message.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const profileSchema = z.object({
  businessName: z.string().min(2).max(120),
  category: z.string().min(1),
  subcategories: z.array(z.string()).default([]),
  city: z.string().min(1),
  area: z.string().min(1),
  address: z.string().min(5).max(500),
  description: z.string().max(2000).optional(),
  coverImage: z.union([z.string().url(), z.string().startsWith('data:image/')]).optional(),
  logo: z.union([z.string().url(), z.string().startsWith('data:image/')]).optional(),
  contactPhone: z.string().min(7).max(20),
  contactEmail: z.string().email().optional(),
  whatsappNumber: z.string().max(20).optional(),
  socialLinks: z
  .object({
  instagram: z.string().url().optional(),
  facebook: z.string().url().optional(),
  youtube: z.string().url().optional(),
  whatsapp: z.string().url().optional(),
  })
  .partial()
  .optional(),
  startingPrice: z.number().min(0).default(0),
  currency: z.string().default('PKR'),
  businessHours: z
  .array(
  z.object({
  day: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
  open: z.string(),
  close: z.string(),
  isOpen: z.boolean().default(true),
  })
  )
  .optional(),
  policies: z
  .object({
  cancellation: z.string().max(1000).optional(),
  advancePayment: z.string().max(500).optional(),
  extraCharges: z.string().max(1000).optional(),
  })
  .partial()
  .optional(),
});

const PUBLIC_SELLER_FILTER = { status: 'approved', isDeleted: false };

export const createSellerProfile = asyncHandler(async (req, res) => {
  const data = profileSchema.parse(req.body);

  const existing = await SellerProfile.findOne({ userId: req.user._id });
  if (existing) {
  throw new ApiError(409, 'Seller profile already exists');
  }

  const profile = await SellerProfile.create({
  userId: req.user._id,
  ...data,
  onboardingStep: 1,
  onboardingCompleted: false,
  verificationStatus: 'unverified',
  status: 'pending',
  });

  res.status(201).json(new ApiResponse('Seller profile created', profile));
});

export const updateSellerProfile = asyncHandler(async (req, res) => {
  const data = profileSchema.partial().parse(req.body);

  const profile = await SellerProfile.findOne({ _id: req.params.id, userId: req.user._id });
  if (!profile) {
  throw new ApiError(404, 'Seller profile not found');
  }

  Object.assign(profile, data);

  if (profile.status === 'rejected') {
  profile.status = 'pending';
  profile.verificationStatus = 'unverified';
  profile.rejectionReason = '';
  }

  await profile.save();
  res.json(new ApiResponse('Seller profile updated', profile));
});

export const advanceOnboardingStep = asyncHandler(async (req, res) => {
  const { step } = z.object({ step: z.coerce.number().int().min(1).max(6) }).parse(req.body);

  const profile = await SellerProfile.findOne({ userId: req.user._id });
  if (!profile) {
  throw new ApiError(404, 'Seller profile not found — create it first');
  }

  profile.onboardingStep = step;
  if (step === 6) {
  profile.onboardingCompleted = true;
  }
  await profile.save();

  res.json(new ApiResponse('Onboarding step advanced', {
  onboardingStep: profile.onboardingStep,
  onboardingCompleted: profile.onboardingCompleted,
  }));
});

export const listPublicSellers = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 12));
  const { category, city, area, subcategory, q, sort } = req.query;

  const filter = { ...PUBLIC_SELLER_FILTER };
  if (category) filter.category = String(category);
  if (city) filter.city = String(city);
  if (area) filter.area = String(area);
  if (subcategory) filter.subcategories = String(subcategory);

  if (q) {
  filter.$or = [
  { businessName: { $regex: String(q), $options: 'i' } },
  { description: { $regex: String(q), $options: 'i' } },
  { city: { $regex: String(q), $options: 'i' } },
  { category: { $regex: String(q), $options: 'i' } },
  ];
  }

  let sortOptions = { isFeatured: -1, rating: -1, createdAt: -1 };
  if (sort === 'rating') sortOptions = { rating: -1, reviewCount: -1 };
  else if (sort === 'price_asc') sortOptions = { startingPrice: 1 };
  else if (sort === 'price_desc') sortOptions = { startingPrice: -1 };
  else if (sort === 'newest') sortOptions = { createdAt: -1 };

  const total = await SellerProfile.countDocuments(filter);
  const sellers = await SellerProfile.find(filter)
  .sort(sortOptions)
  .skip((page - 1) * limit)
  .limit(limit)
  .lean();

  res.json(
  new ApiResponse('Sellers fetched', {
  sellers,
  total,
  page,
  pages: Math.ceil(total / limit) || 1,
  })
  );
});

export const getPublicSellerProfile = asyncHandler(async (req, res) => {
  const profile = await SellerProfile.findOne({
  slug: req.params.slug,
  ...PUBLIC_SELLER_FILTER,
  }).lean();

  if (!profile) {
  throw new ApiError(404, 'Seller not found');
  }

  res.json(new ApiResponse('Seller profile fetched', profile));
});

export const getSellerDashboard = asyncHandler(async (req, res) => {
  const profile = await SellerProfile.findOne({ userId: req.user._id });
  if (!profile) {
  throw new ApiError(404, 'Seller profile not found — complete onboarding first');
  }

  const activeRequestStatuses = ['pending', 'seller_replied', 'estimate_sent', 'negotiating'];

  const [pendingRequests, activeBookings, completedBookings, recentRequests, unreadMessages] =
  await Promise.all([
  BookingRequest.countDocuments({ sellerId: profile._id, status: { $in: activeRequestStatuses } }),
  Booking.countDocuments({
  sellerId: profile._id,
  status: 'confirmed',
  eventDate: { $gte: new Date() },
  }),
  Booking.countDocuments({ sellerId: profile._id, status: 'completed' }),
  BookingRequest.find({ sellerId: profile._id })
  .sort({ createdAt: -1 })
  .limit(5)
  .lean(),
  Message.countDocuments({
  bookingRequestId: { $in: await BookingRequest.find({ sellerId: profile._id }).distinct('_id') },
  senderRole: { $ne: 'seller' },
  isRead: false,
  }),
  ]);

  res.json(
  new ApiResponse('Dashboard fetched', {
  profile,
  stats: {
  pendingRequests,
  activeBookings,
  completedBookings,
  unreadMessages,
  },
  recentRequests,
  })
  );
});