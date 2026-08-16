import { z } from 'zod';
import { User } from '../models/User.js';
import { SellerProfile } from '../models/SellerProfile.js';
import { Booking } from '../models/Booking.js';
import { Review } from '../models/Review.js';
import { Report } from '../models/Report.js';
import { Category } from '../models/Category.js';
import { City } from '../models/City.js';
import { LedgerEntry } from '../models/LedgerEntry.js';
import { SupportPayment } from '../models/SupportPayment.js';
import { AdminActivityLog } from '../models/AdminActivityLog.js';
import { createNotification } from '../services/notification.service.js';
import { sendSellerApprovedEmail, sendSellerRejectedEmail } from '../utils/email.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const logActivity = (req, action, targetType, targetId, previousValue, newValue, reason) => {
  return AdminActivityLog.create({
  adminId: req.user._id,
  action,
  targetType,
  targetId,
  previousValue,
  newValue,
  reason,
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
  }).catch(() => {});
};

const paginate = (req) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  return { page, limit, skip: (page - 1) * limit };
};

export const getAdminStats = asyncHandler(async (_req, res) => {
  const [customers, sellers, approvedSellers, pendingSellers, bookings, confirmedBookings, completedBookings, revenue, supportRevenue, openReports, categories] =
  await Promise.all([
  User.countDocuments({ role: 'customer', isDeleted: false }),
  SellerProfile.countDocuments(),
  SellerProfile.countDocuments({ status: 'approved' }),
  SellerProfile.countDocuments({ status: 'pending' }),
  Booking.countDocuments(),
  Booking.countDocuments({ status: 'confirmed' }),
  Booking.countDocuments({ status: 'completed' }),
  LedgerEntry.aggregate([
  { $match: { type: 'deposit_received' } },
  { $group: { _id: null, total: { $sum: '$amount' } } },
  ]),
  SupportPayment.aggregate([
  { $match: { status: 'completed' } },
  { $group: { _id: null, total: { $sum: '$amount' } } },
  ]),
  Report.countDocuments({ status: { $in: ['open', 'under_review'] } }),
  Category.countDocuments(),
  ]);

  const recentActivity = await AdminActivityLog.find()
  .sort({ createdAt: -1 })
  .limit(10)
  .lean();

  res.json(
  new ApiResponse('Admin stats', {
  users: {
  customers,
  sellers,
  approvedSellers,
  pendingSellers,
  },
  bookings: {
  total: bookings,
  confirmed: confirmedBookings,
  completed: completedBookings,
  },
  revenue: revenue[0]?.total ?? 0,
  supportRevenue: supportRevenue[0]?.total ?? 0,
  moderation: { openReports },
  categories,
  recentActivity,
  })
  );
});

export const listAdminSellers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req);
  const filter = {};

  if (req.query.status) filter.status = String(req.query.status);
  if (req.query.verificationStatus) filter.verificationStatus = String(req.query.verificationStatus);
  if (req.query.q) {
  filter.$or = [
  { businessName: { $regex: String(req.query.q), $options: 'i' } },
  { slug: { $regex: String(req.query.q), $options: 'i' } },
  { category: { $regex: String(req.query.q), $options: 'i' } },
  ];
  }

  const total = await SellerProfile.countDocuments(filter);
  const sellers = await SellerProfile.find(filter)
  .sort({ createdAt: -1 })
  .skip(skip)
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

export const getAdminSeller = asyncHandler(async (req, res) => {
  const seller = await SellerProfile.findById(req.params.id)
  .populate('userId', 'name email phone role')
  .lean();

  if (!seller) {
  throw new ApiError(404, 'Seller not found');
  }

  res.json(new ApiResponse('Seller fetched', seller));
});

export const approveSeller = asyncHandler(async (req, res) => {
  const { reason } = z.object({ reason: z.string().max(500).optional() }).parse(req.body ?? {});

  const seller = await SellerProfile.findById(req.params.id);
  if (!seller) {
  throw new ApiError(404, 'Seller not found');
  }

  if (seller.status === 'approved') {
  return res.json(new ApiResponse('Seller already approved', seller));
  }

  const previous = seller.status;
  if (seller.status === 'rejected') {
  seller.status = 'pending';
  seller.rejectionReason = '';
  await seller.save();
  }

  seller.status = 'approved';
  seller.verificationStatus = 'verified';
  await seller.save();

  await logActivity(req, 'approve_seller', 'seller', seller._id, previous, seller.status, reason);

  await createNotification({
  userId: seller.userId,
  type: 'seller_approved',
  title: 'Profile approved',
  body: `${seller.businessName} is now live on DreamEvents.`,
  link: '/seller-dashboard',
  sendEmail: {
  to: seller.contactEmail,
  subject: 'Your DreamEvents profile is live',
  html: sendSellerApprovedEmail(seller.businessName),
  },
  }).catch(() => {});

  res.json(new ApiResponse('Seller approved', seller));
});

export const rejectSeller = asyncHandler(async (req, res) => {
  const { reason } = z.object({ reason: z.string().min(3).max(500) }).parse(req.body);

  const seller = await SellerProfile.findById(req.params.id);
  if (!seller) {
  throw new ApiError(404, 'Seller not found');
  }

  if (seller.status === 'approved') {
  throw new ApiError(400, 'Approved sellers cannot be rejected — suspend them instead');
  }
  if (seller.status === 'rejected') {
  return res.json(new ApiResponse('Seller already rejected', seller));
  }

  const previous = seller.status;
  seller.status = 'rejected';
  seller.rejectionReason = reason;
  seller.verificationStatus = 'unverified';
  await seller.save();

  await logActivity(req, 'reject_seller', 'seller', seller._id, previous, seller.status, reason);

  await createNotification({
  userId: seller.userId,
  type: 'seller_rejected',
  title: 'Profile not approved',
  body: reason,
  link: '/seller-dashboard',
  sendEmail: {
  to: seller.contactEmail,
  subject: 'Update needed for your DreamEvents profile',
  html: sendSellerRejectedEmail(seller.businessName, reason),
  },
  }).catch(() => {});

  res.json(new ApiResponse('Seller rejected', seller));
});

export const suspendSeller = asyncHandler(async (req, res) => {
  const { reason } = z.object({ reason: z.string().max(500).optional() }).parse(req.body ?? {});

  const seller = await SellerProfile.findById(req.params.id);
  if (!seller) {
  throw new ApiError(404, 'Seller not found');
  }

  if (seller.status === 'suspended') {
  return res.json(new ApiResponse('Seller already suspended', seller));
  }
  if (seller.status !== 'approved') {
  throw new ApiError(400, 'Only approved sellers can be suspended');
  }

  const previous = seller.status;
  seller.status = 'suspended';
  await seller.save();

  await logActivity(req, 'suspend_seller', 'seller', seller._id, previous, seller.status, reason);

  await createNotification({
  userId: seller.userId,
  type: 'system',
  title: 'Profile suspended',
  body: reason || 'Your seller profile has been suspended.',
  link: '/seller-dashboard',
  }).catch(() => {});

  res.json(new ApiResponse('Seller suspended', seller));
});

export const listAdminUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req);
  const filter = {};

  if (req.query.role) filter.role = String(req.query.role);
  if (req.query.q) {
  filter.$or = [
  { name: { $regex: String(req.query.q), $options: 'i' } },
  { email: { $regex: String(req.query.q), $options: 'i' } },
  { phone: { $regex: String(req.query.q), $options: 'i' } },
  ];
  }

  const total = await User.countDocuments(filter);
  const users = await User.find(filter)
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit)
  .select('-password')
  .lean();

  res.json(
  new ApiResponse('Users fetched', {
  users,
  total,
  page,
  pages: Math.ceil(total / limit) || 1,
  })
  );
});

export const suspendUser = asyncHandler(async (req, res) => {
  if (String(req.params.id) === String(req.user._id)) {
  throw new ApiError(400, 'You cannot suspend your own account');
  }

  const user = await User.findById(req.params.id);
  if (!user) {
  throw new ApiError(404, 'User not found');
  }

  user.isDeleted = true;
  await user.save();

  await logActivity(req, 'suspend_user', 'user', user._id, false, true, null);

  res.json(new ApiResponse('User suspended', { id: user._id }));
});

export const listAdminBookings = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req);
  const filter = {};

  if (req.query.status) filter.status = String(req.query.status);

  const total = await Booking.countDocuments(filter);
  const bookings = await Booking.find(filter)
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit)
  .populate('sellerId', 'businessName slug')
  .populate('userId', 'name email')
  .lean();

  res.json(
  new ApiResponse('Bookings fetched', {
  bookings,
  total,
  page,
  pages: Math.ceil(total / limit) || 1,
  })
  );
});

export const listAdminReports = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req);
  const filter = {};

  if (req.query.status) filter.status = String(req.query.status);
  if (req.query.targetType) filter.targetType = String(req.query.targetType);

  const total = await Report.countDocuments(filter);
  const reports = await Report.find(filter)
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit)
  .populate('reporterId', 'name email')
  .lean();

  res.json(
  new ApiResponse('Reports fetched', {
  reports,
  total,
  page,
  pages: Math.ceil(total / limit) || 1,
  })
  );
});

export const removeReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
  throw new ApiError(404, 'Review not found');
  }

  review.isDeleted = true;
  review.isFlagged = false;
  await review.save();

  await Report.updateMany(
  { targetType: 'review', targetId: review._id, status: { $in: ['open', 'under_review'] } },
  { $set: { status: 'resolved', adminId: req.user._id, resolution: 'Review removed by admin', resolvedAt: new Date() } }
  );

  await logActivity(req, 'remove_review', 'review', review._id, null, 'deleted', null);

  res.json(new ApiResponse('Review removed', { id: review._id }));
});

export const resolveReport = asyncHandler(async (req, res) => {
  const { resolution } = z.object({ resolution: z.string().max(1000).optional() }).parse(req.body ?? {});

  const report = await Report.findById(req.params.id);
  if (!report) {
  throw new ApiError(404, 'Report not found');
  }

  report.status = 'resolved';
  report.adminId = req.user._id;
  report.resolution = resolution ?? 'Resolved by admin';
  report.resolvedAt = new Date();
  await report.save();

  await logActivity(req, 'resolve_report', 'report', report._id, null, report.status, resolution);

  res.json(new ApiResponse('Report resolved', report));
});

export const dismissReport = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);
  if (!report) {
  throw new ApiError(404, 'Report not found');
  }

  report.status = 'dismissed';
  report.adminId = req.user._id;
  report.resolvedAt = new Date();
  await report.save();

  await logActivity(req, 'dismiss_report', 'report', report._id, null, report.status, null);

  res.json(new ApiResponse('Report dismissed', report));
});

export const listAdminCategories = asyncHandler(async (_req, res) => {
  const categories = await Category.find().sort({ sortOrder: 1 }).lean();
  res.json(new ApiResponse('Categories fetched', categories));
});

export const upsertCategory = asyncHandler(async (req, res) => {
  const schema = z.object({
  name: z.string().min(2).max(50),
  slug: z.string().optional(),
  description: z.string().max(500).optional(),
  icon: z.string().optional(),
  sortOrder: z.number().default(0),
  isActive: z.boolean().default(true),
  subcategories: z
  .array(
  z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  })
  )
  .default([]),
  filters: z
  .array(
  z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(['boolean', 'select', 'multiselect', 'number']),
  options: z.array(z.string()).default([]),
  })
  )
  .default([]),
  });
  const data = schema.parse(req.body);

  const slug =
  data.slug ?? data.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  const category = await Category.findOneAndUpdate(
  { slug },
  { $set: { ...data, slug } },
  { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await logActivity(req, 'upsert_category', 'category', category._id, null, category.slug, null);

  res.json(new ApiResponse('Category saved', category));
});

export const listAdminCities = asyncHandler(async (_req, res) => {
  const cities = await City.find().sort({ sortOrder: 1 }).lean();
  res.json(new ApiResponse('Cities fetched', cities));
});

export const upsertCity = asyncHandler(async (req, res) => {
  const schema = z.object({
  name: z.string().min(2),
  slug: z.string().optional(),
  displayName: z.string().min(2),
  areas: z.array(z.string().min(1)).default([]),
  sortOrder: z.number().default(0),
  isActive: z.boolean().default(true),
  });
  const data = schema.parse(req.body);

  const slug =
  data.slug ?? data.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  const city = await City.findOneAndUpdate(
  { slug },
  {
  $set: {
  ...data,
  slug,
  areas: data.areas.map((area) => ({
  name: area,
  slug: area.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
  })),
  },
  },
  { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await logActivity(req, 'upsert_city', 'city', city._id, null, city.slug, null);

  res.json(new ApiResponse('City saved', city));
});

export const setFeaturedSellers = asyncHandler(async (req, res) => {
  const { sellerIds } = z
  .object({ sellerIds: z.array(z.string()).max(8).optional() })
  .parse(req.body ?? {});

  const ids = (sellerIds ?? []).map((id) => {
  if (!/^[0-9a-fA-F]{24}$/.test(id)) {
  throw new ApiError(400, `Invalid seller id: ${id}`);
  }
  return id;
  });

  await SellerProfile.updateMany(
  { _id: { $in: ids } },
  { $set: { isFeatured: true, featuredUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) } }
  );
  await SellerProfile.updateMany({ _id: { $nin: ids } }, { $set: { isFeatured: false } });

  await logActivity(req, 'set_featured_sellers', 'homepage', null, null, ids, null);

  res.json(new ApiResponse('Featured sellers updated', { featured: ids.length }));
});