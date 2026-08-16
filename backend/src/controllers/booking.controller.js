import { z } from 'zod';
import { Booking } from '../models/Booking.js';
import { BookingRequest } from '../models/BookingRequest.js';
import { LedgerEntry } from '../models/LedgerEntry.js';
import { SellerProfile } from '../models/SellerProfile.js';
import { User } from '../models/User.js';
import { Message } from '../models/Message.js';
import { createNotification } from '../services/notification.service.js';
import { sendBookingConfirmedEmail } from '../utils/email.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const confirmDepositSchema = z.object({
  method: z.string().max(50).optional(),
  reference: z.string().max(200).optional(),
  notes: z.string().max(500).optional(),
});

const ledgerSchema = z.object({
  type: z.enum(['deposit_sent', 'deposit_received', 'balance_sent', 'balance_received', 'refund']),
  amount: z.number().min(0),
  method: z.string().max(50).optional(),
  reference: z.string().max(200).optional(),
  notes: z.string().max(500).optional(),
});

export const confirmDeposit = asyncHandler(async (req, res) => {
  const data = confirmDepositSchema.parse(req.body);

  const profile = await SellerProfile.findOne({ userId: req.user._id });
  if (!profile) {
  throw new ApiError(404, 'Seller profile not found');
  }

  const booking = await Booking.findById(req.params.id);
  if (!booking || String(booking.sellerId) !== String(profile._id)) {
  throw new ApiError(404, 'Booking not found');
  }

  const request = await BookingRequest.findById(booking.bookingRequestId);
  if (request) {
  request.depositConfirmed = true;
  await request.save();
  }

  await LedgerEntry.create({
  bookingRequestId: booking.bookingRequestId,
  bookingId: booking._id,
  type: 'deposit_received',
  amount: booking.depositAmount,
  method: data.method,
  reference: data.reference,
  recordedBy: req.user._id,
  notes: data.notes,
  });

  const customer = await User.findById(booking.userId);

  await Message.create({
  bookingRequestId: booking.bookingRequestId,
  senderId: req.user._id,
  senderRole: 'seller',
  type: 'booking_summary',
  content: `Deposit of ${booking.depositAmount.toLocaleString('en-PK')} PKR received — booking confirmed. Balance due: ${booking.balanceAmount.toLocaleString('en-PK')} PKR.`,
  });

  await createNotification({
  userId: booking.userId,
  type: 'booking_confirmed',
  title: 'Deposit received — booking confirmed',
  body: `${profile.businessName} confirmed your deposit of ${booking.depositAmount.toLocaleString('en-PK')} PKR.`,
  link: '/bookings',
  metadata: { bookingRequestId: booking.bookingRequestId, bookingId: String(booking._id) },
  sendEmail: customer
  ? {
  to: customer.email,
  subject: 'Booking confirmed on DreamEvents',
  html: sendBookingConfirmedEmail(customer.name),
  }
  : undefined,
  }).catch(() => {});

  res.json(new ApiResponse('Deposit confirmed', { id: booking._id, status: booking.status }));
});

export const listBookings = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));

  let filter = {};
  if (req.user.role === 'customer') {
  filter = { userId: req.user._id };
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

  const total = await Booking.countDocuments(filter);
  const bookings = await Booking.find(filter)
  .sort({ eventDate: -1 })
  .skip((page - 1) * limit)
  .limit(limit)
  .populate('sellerId', 'businessName slug coverImage city')
  .populate('userId', 'name email phone avatar')
  .populate('eventId', 'name eventType eventDate')
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

export const getBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
  .populate('sellerId', 'businessName slug coverImage city')
  .populate('userId', 'name email phone avatar')
  .populate('eventId', 'name eventType eventDate')
  .populate('estimateId');

  if (!booking) {
  throw new ApiError(404, 'Booking not found');
  }

  const profile = await SellerProfile.findOne({ userId: req.user._id });
  const isParticipant =
  req.user.role === 'admin' ||
  String(booking.userId) === String(req.user._id) ||
  (profile && String(booking.sellerId) === String(profile._id));

  if (!isParticipant) {
  throw new ApiError(403, 'Not authorized to view this booking');
  }

  res.json(new ApiResponse('Booking fetched', booking));
});

export const listLedgerEntries = asyncHandler(async (req, res) => {
  const request = await BookingRequest.findById(req.params.bookingRequestId);
  if (!request) {
  throw new ApiError(404, 'Booking request not found');
  }

  const profile = await SellerProfile.findOne({ userId: req.user._id });
  const isParticipant =
  req.user.role === 'admin' ||
  String(request.userId) === String(req.user._id) ||
  (profile && String(request.sellerId) === String(profile._id));

  if (!isParticipant) {
  throw new ApiError(403, 'Not authorized to view this ledger');
  }

  const entries = await LedgerEntry.find({ bookingRequestId: request._id })
  .sort({ createdAt: -1 })
  .lean();

  res.json(new ApiResponse('Ledger entries fetched', entries));
});

export const createLedgerEntry = asyncHandler(async (req, res) => {
  const data = ledgerSchema.parse(req.body);

  const request = await BookingRequest.findById(req.params.bookingRequestId);
  if (!request) {
  throw new ApiError(404, 'Booking request not found');
  }

  const profile = await SellerProfile.findOne({ userId: req.user._id });
  if (!profile || String(request.sellerId) !== String(profile._id)) {
  throw new ApiError(403, 'Only the seller can record ledger entries');
  }

  const entry = await LedgerEntry.create({
  bookingRequestId: request._id,
  type: data.type,
  amount: data.amount,
  method: data.method,
  reference: data.reference,
  recordedBy: req.user._id,
  notes: data.notes,
  });

  res.status(201).json(new ApiResponse('Ledger entry recorded', entry));
});