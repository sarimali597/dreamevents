import { z } from 'zod';
import { Estimate } from '../models/Estimate.js';
import { BookingRequest } from '../models/BookingRequest.js';
import { Booking } from '../models/Booking.js';
import { Availability } from '../models/Availability.js';
import { SellerProfile } from '../models/SellerProfile.js';
import { User } from '../models/User.js';
import { Message } from '../models/Message.js';
import { createNotification } from '../services/notification.service.js';
import { sendEstimateEmail, sendBookingConfirmedEmail } from '../utils/email.js';
import { rollupEventStatus } from './event.controller.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const estimateSchema = z.object({
  bookingRequestId: z.string().min(1),
  lineItems: z
  .array(
  z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  quantity: z.number().min(0),
  unitPrice: z.number().min(0),
  })
  )
  .min(1),
  discountPercent: z.number().min(0).max(100).default(0),
  serviceChargePercent: z.number().min(0).default(0),
  taxPercent: z.number().min(0).default(0),
  validityDate: z.coerce.date(),
  notes: z.string().max(1000).optional(),
});

const acceptSchema = z.object({
  depositAmount: z.number().min(0),
});

export const createEstimate = asyncHandler(async (req, res) => {
  const data = estimateSchema.parse(req.body);

  const profile = await SellerProfile.findOne({ userId: req.user._id });
  if (!profile) {
  throw new ApiError(404, 'Seller profile not found');
  }

  const request = await BookingRequest.findById(data.bookingRequestId);
  if (!request || String(request.sellerId) !== String(profile._id)) {
  throw new ApiError(404, 'Booking request not found');
  }

  if (!['pending', 'seller_replied', 'estimate_sent', 'negotiating'].includes(request.status)) {
  throw new ApiError(400, `Cannot send an estimate for a request in ${request.status} state`);
  }

  const latest = await Estimate.findOne({ bookingRequestId: request._id }).sort({ version: -1 });
  const version = (latest?.version ?? 0) + 1;

  await Estimate.updateMany(
  { bookingRequestId: request._id, status: { $in: ['draft', 'sent', 'viewed'] } },
  { status: 'superseded' }
  );

  const estimate = await Estimate.create({
  bookingRequestId: request._id,
  sellerId: profile._id,
  version,
  lineItems: data.lineItems,
  discountPercent: data.discountPercent,
  serviceChargePercent: data.serviceChargePercent,
  taxPercent: data.taxPercent,
  validityDate: data.validityDate,
  notes: data.notes,
  status: 'sent',
  });

  if (request.status !== 'estimate_sent') {
  request.status = 'estimate_sent';
  await request.save();
  }

  const customer = await User.findById(request.userId);

  await Message.create({
  bookingRequestId: request._id,
  senderId: req.user._id,
  senderRole: 'seller',
  type: 'estimate',
  content: `Estimate #${version} sent — total ${estimate.total.toLocaleString('en-PK')} PKR.`,
  metadata: { estimateId: String(estimate._id) },
  });

  await createNotification({
  userId: request.userId,
  type: 'new_estimate',
  title: 'New estimate received',
  body: `${profile.businessName} sent an estimate of ${estimate.total.toLocaleString('en-PK')} PKR.`,
  link: '/messages',
  metadata: { bookingRequestId: request._id, estimateId: String(estimate._id) },
  sendEmail: customer
  ? {
  to: customer.email,
  subject: `New estimate from ${profile.businessName}`,
  html: sendEstimateEmail(customer.name),
  }
  : undefined,
  }).catch(() => {});

  res.status(201).json(new ApiResponse('Estimate sent', estimate));
});

export const listEstimates = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));

  let filter = {};
  if (req.user.role === 'customer') {
  const requestIds = await BookingRequest.find({ userId: req.user._id }).distinct('_id');
  filter = { bookingRequestId: { $in: requestIds } };
  } else if (req.user.role === 'seller') {
  const profile = await SellerProfile.findOne({ userId: req.user._id });
  if (!profile) {
  throw new ApiError(404, 'Seller profile not found');
  }
  filter = { sellerId: profile._id };
  }

  if (req.query.status) {
  filter.status = String(req.query.status);
  }

  const total = await Estimate.countDocuments(filter);
  const estimates = await Estimate.find(filter)
  .sort({ createdAt: -1 })
  .skip((page - 1) * limit)
  .limit(limit)
  .populate('bookingRequestId', 'eventType eventDate guestCount status')
  .lean();

  res.json(
  new ApiResponse('Estimates fetched', {
  estimates,
  total,
  page,
  pages: Math.ceil(total / limit) || 1,
  })
  );
});

export const acceptEstimate = asyncHandler(async (req, res) => {
  const { depositAmount } = acceptSchema.parse(req.body);

  const estimate = await Estimate.findById(req.params.id);
  if (!estimate) {
  throw new ApiError(404, 'Estimate not found');
  }

  const request = await BookingRequest.findById(estimate.bookingRequestId);
  if (!request || String(request.userId) !== String(req.user._id)) {
  throw new ApiError(403, 'Not authorized to accept this estimate');
  }

  if (!['sent', 'viewed'].includes(estimate.status)) {
  throw new ApiError(400, `Estimate is in ${estimate.status} state and cannot be accepted`);
  }

  if (!['estimate_sent', 'negotiating'].includes(request.status)) {
  throw new ApiError(400, `Request is in ${request.status} state and cannot be accepted`);
  }

  if (depositAmount > estimate.total) {
  throw new ApiError(400, 'Deposit cannot exceed the estimate total');
  }

  estimate.status = 'accepted';
  await estimate.save();

  request.status = 'accepted';
  request.depositAmount = depositAmount;
  await request.save();

  const booking = await Booking.create({
  bookingRequestId: request._id,
  userId: request.userId,
  sellerId: request.sellerId,
  eventId: request.eventId,
  eventDate: request.eventDate,
  eventType: request.eventType,
  guestCount: request.guestCount,
  estimateId: estimate._id,
  totalAmount: estimate.total,
  depositAmount,
  balanceAmount: estimate.total - depositAmount,
  status: 'confirmed',
  depositConfirmedAt: new Date(),
  });

  await Availability.updateMany(
  { sellerId: request.sellerId, bookingRequestId: request._id },
  { $set: { status: 'booked', bookingId: booking._id } }
  );

  const profile = await SellerProfile.findById(request.sellerId);
  const customer = await User.findById(request.userId);

  await Message.create({
  bookingRequestId: request._id,
  senderId: request.userId,
  senderRole: 'customer',
  type: 'booking_summary',
  content: `Estimate accepted — booking confirmed for ${booking.eventDate.toISOString().slice(0, 10)}. Total: ${booking.totalAmount.toLocaleString('en-PK')} PKR, deposit: ${booking.depositAmount.toLocaleString('en-PK')} PKR.`,
  metadata: { estimateId: String(estimate._id) },
  });

  await createNotification({
  userId: request.sellerId,
  type: 'estimate_accepted',
  title: 'Estimate accepted',
  body: `${customer?.name ?? 'The customer'} accepted your estimate. Booking confirmed.`,
  link: '/seller-dashboard/bookings',
  metadata: { bookingRequestId: request._id, bookingId: String(booking._id) },
  }).catch(() => {});

  await createNotification({
  userId: request.userId,
  type: 'booking_confirmed',
  title: 'Booking confirmed',
  body: `Your booking with ${profile?.businessName ?? 'the seller'} is confirmed. Deposit of ${depositAmount.toLocaleString('en-PK')} PKR is due.`,
  link: '/bookings',
  metadata: { bookingRequestId: request._id, bookingId: String(booking._id) },
  sendEmail: customer
  ? {
  to: customer.email,
  subject: 'Booking confirmed on DreamEvents',
  html: sendBookingConfirmedEmail(customer.name),
  }
  : undefined,
  }).catch(() => {});

  if (request.eventId) {
  await rollupEventStatus(request.eventId);
  }

  res.status(201).json(new ApiResponse('Estimate accepted — booking created', booking));
});

export const rejectEstimate = asyncHandler(async (req, res) => {
  const estimate = await Estimate.findById(req.params.id);
  if (!estimate) {
  throw new ApiError(404, 'Estimate not found');
  }

  const request = await BookingRequest.findById(estimate.bookingRequestId);
  if (!request || String(request.userId) !== String(req.user._id)) {
  throw new ApiError(403, 'Not authorized to reject this estimate');
  }

  if (!['sent', 'viewed'].includes(estimate.status)) {
  throw new ApiError(400, `Estimate is in ${estimate.status} state and cannot be rejected`);
  }

  estimate.status = 'rejected';
  await estimate.save();

  if (request.status === 'estimate_sent') {
  request.status = 'negotiating';
  await request.save();
  }

  const customer = await User.findById(request.userId);

  await Message.create({
  bookingRequestId: request._id,
  senderId: request.userId,
  senderRole: 'customer',
  type: 'text',
  content: `The customer rejected estimate #${estimate.version}.`,
  });

  await createNotification({
  userId: request.sellerId,
  type: 'estimate_revised',
  title: 'Estimate rejected',
  body: `${customer?.name ?? 'The customer'} rejected estimate #${estimate.version} — negotiate or send a revised estimate.`,
  link: '/seller-dashboard/requests',
  metadata: { bookingRequestId: request._id, estimateId: String(estimate._id) },
  }).catch(() => {});

  res.json(new ApiResponse('Estimate rejected', { id: estimate._id, status: estimate.status }));
});