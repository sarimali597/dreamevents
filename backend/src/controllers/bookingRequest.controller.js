import { z } from 'zod';
import { BookingRequest } from '../models/BookingRequest.js';
import { Availability } from '../models/Availability.js';
import { SellerProfile } from '../models/SellerProfile.js';
import { Message } from '../models/Message.js';
import { createNotification } from '../services/notification.service.js';
import { sendBookingRequestEmail } from '../utils/email.js';
import { rollupEventStatus } from './event.controller.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const requestSchema = z.object({
  sellerId: z.string().min(1),
  eventId: z.string().optional(),
  eventType: z.enum(['wedding', 'mehndi', 'engagement', 'birthday', 'corporate', 'family', 'other']),
  eventDate: z.coerce.date(),
  timeWindow: z.string().max(50).optional(),
  guestCount: z.number().min(1),
  budgetRange: z
  .object({
  min: z.number().min(0).optional(),
  max: z.number().min(0).optional(),
  })
  .optional(),
  specialRequirements: z.string().max(2000).optional(),
  message: z.string().min(5).max(2000),
});

const respondSchema = z.object({
  action: z.enum(['accept', 'reject', 'reply']),
  message: z.string().max(2000).optional(),
  depositAmount: z.number().min(0).optional(),
});

export const createBookingRequest = asyncHandler(async (req, res) => {
  const data = requestSchema.parse(req.body);

  const seller = await SellerProfile.findOne({ _id: data.sellerId, status: 'approved', isDeleted: false });
  if (!seller) {
  throw new ApiError(404, 'Seller not found or not approved');
  }

  const eventDate = new Date(data.eventDate);
  if (eventDate.getTime() < Date.now()) {
  throw new ApiError(400, 'Event date must be in the future');
  }

  const date = new Date(eventDate);
  date.setUTCHours(0, 0, 0, 0);
  const availability = await Availability.findOne({ sellerId: data.sellerId, date });

  if (availability && availability.status !== 'available') {
  throw new ApiError(
  409,
  `This date is ${availability.status} — please pick another date or contact the seller`
  );
  }

  const request = await BookingRequest.create({
  userId: req.user._id,
  ...data,
  eventDate: date,
  status: 'pending',
  });

  if (availability) {
  availability.status = 'pending';
  availability.bookingRequestId = request._id;
  await availability.save();
  } else {
  await Availability.create({
  sellerId: data.sellerId,
  date,
  status: 'pending',
  bookingRequestId: request._id,
  });
  }

  if (data.eventId) {
  await BookingRequest.updateOne(
  { _id: data.eventId },
  { $addToSet: { linkedBookingIds: request._id } }
  ).catch(() => {});
  await rollupEventStatus(data.eventId);
  }

  await Message.create({
  bookingRequestId: request._id,
  senderId: req.user._id,
  senderRole: 'customer',
  type: 'system_notification',
  content: `Booking request sent: ${data.eventType} event on ${date.toISOString().slice(0, 10)} for ${data.guestCount} guest(s).`,
  });

  await createNotification({
  userId: seller.userId,
  type: 'new_booking_request',
  title: 'New booking request',
  body: `${req.user.name} sent a booking request for ${date.toISOString().slice(0, 10)} (${data.guestCount} guests).`,
  link: '/seller-dashboard/requests',
  metadata: { bookingRequestId: request._id },
  sendEmail: {
  to: seller.contactEmail || seller.user?.email,
  subject: `New booking request on DreamEvents`,
  html: sendBookingRequestEmail(seller.businessName),
  },
  }).catch(() => {});

  res.status(201).json(new ApiResponse('Booking request sent', request));
});

export const listBookingRequests = asyncHandler(async (req, res) => {
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

  const total = await BookingRequest.countDocuments(filter);
  const requests = await BookingRequest.find(filter)
  .sort({ createdAt: -1 })
  .skip((page - 1) * limit)
  .limit(limit)
  .populate('sellerId', 'businessName slug coverImage category city rating')
  .populate('eventId', 'name eventDate eventType')
  .lean();

  res.json(
  new ApiResponse('Booking requests fetched', {
  requests,
  total,
  page,
  pages: Math.ceil(total / limit) || 1,
  })
  );
});

export const getBookingRequest = asyncHandler(async (req, res) => {
  const request = await BookingRequest.findById(req.params.id)
  .populate('sellerId', 'businessName slug coverImage category city rating')
  .populate('eventId', 'name eventDate eventType')
  .populate('userId', 'name email phone avatar');

  if (!request || request.isDeleted) {
  throw new ApiError(404, 'Booking request not found');
  }

  const profile = await SellerProfile.findOne({ userId: req.user._id });
  const isParticipant =
  req.user.role === 'admin' ||
  String(request.userId) === String(req.user._id) ||
  (profile && String(request.sellerId) === String(profile._id));

  if (!isParticipant) {
  throw new ApiError(403, 'Not authorized to view this request');
  }

  res.json(new ApiResponse('Booking request fetched', request));
});

export const respondToRequest = asyncHandler(async (req, res) => {
  const { action, message, depositAmount } = respondSchema.parse(req.body);

  const profile = await SellerProfile.findOne({ userId: req.user._id });
  if (!profile) {
  throw new ApiError(404, 'Seller profile not found');
  }

  const request = await BookingRequest.findById(req.params.id);
  if (!request || String(request.sellerId) !== String(profile._id)) {
  throw new ApiError(404, 'Booking request not found');
  }

  if (action === 'accept') {
  if (!['estimate_sent', 'negotiating'].includes(request.status)) {
  throw new ApiError(400, 'Send an estimate first — a request can only be accepted after an estimate is sent');
  }
  request.status = 'accepted';
  request.depositAmount = depositAmount ?? request.depositAmount ?? 0;
  } else if (action === 'reject') {
  if (['accepted', 'expired', 'cancelled', 'rejected'].includes(request.status)) {
  throw new ApiError(400, `Cannot reject a request in ${request.status} state`);
  }
  request.status = 'rejected';
  } else {
  if (['estimate_sent', 'negotiating', 'accepted', 'expired', 'cancelled', 'rejected'].includes(request.status)) {
  throw new ApiError(400, `Cannot reply to a request in ${request.status} state`);
  }
  request.status = 'seller_replied';
  }

  request.sellerResponse = message ?? request.sellerResponse;
  await request.save();

  if (action === 'reject') {
  await Availability.updateMany(
  { sellerId: request.sellerId, bookingRequestId: request._id },
  { $set: { status: 'available' }, $unset: { bookingRequestId: 1 } }
  );
  }

  await Message.create({
  bookingRequestId: request._id,
  senderId: req.user._id,
  senderRole: 'seller',
  type: 'text',
  content:
  message ||
  (action === 'accept'
  ? 'The seller accepted your booking request.'
  : action === 'reject'
  ? 'The seller declined your booking request.'
  : 'The seller replied to your booking request.'),
  });

  const notificationType = action === 'accept' ? 'request_accepted' : action === 'reject' ? 'request_rejected' : 'new_message';

  await createNotification({
  userId: request.userId,
  type: notificationType,
  title:
  action === 'accept'
  ? 'Booking request accepted'
  : action === 'reject'
  ? 'Booking request declined'
  : 'Seller replied',
  body:
  action === 'accept'
  ? `Your request has been accepted — confirm the deposit to lock your date.`
  : message || `The seller updated your booking request.`,
  link: '/messages',
  metadata: { bookingRequestId: request._id },
  }).catch(() => {});

  if (request.eventId) {
  await rollupEventStatus(request.eventId);
  }

  res.json(new ApiResponse('Request updated', request));
});

export const cancelRequest = asyncHandler(async (req, res) => {
  const request = await BookingRequest.findById(req.params.id);
  if (!request || request.isDeleted) {
  throw new ApiError(404, 'Booking request not found');
  }

  const profile = await SellerProfile.findOne({ userId: req.user._id });
  const isParticipant =
  req.user.role === 'admin' ||
  String(request.userId) === String(req.user._id) ||
  (profile && String(request.sellerId) === String(profile._id));

  if (!isParticipant) {
  throw new ApiError(403, 'Not authorized to cancel this request');
  }

  if (request.depositConfirmed) {
  throw new ApiError(400, 'Deposit already confirmed — manage the booking instead');
  }

  if (['expired', 'cancelled', 'rejected'].includes(request.status)) {
  throw new ApiError(400, `Cannot cancel a request in ${request.status} state`);
  }

  request.status = 'cancelled';
  await request.save();

  await Availability.updateMany(
  { sellerId: request.sellerId, bookingRequestId: request._id },
  { $set: { status: 'available' }, $unset: { bookingRequestId: 1, bookingId: 1 } }
  );

  const otherPartyId =
  String(request.userId) === String(req.user._id) ? request.sellerId : request.userId;

  await createNotification({
  userId: otherPartyId,
  type: 'system',
  title: 'Booking request cancelled',
  body: `A booking request was cancelled by ${req.user.name}.`,
  link: '/messages',
  metadata: { bookingRequestId: request._id },
  }).catch(() => {});

  if (request.eventId) {
  await rollupEventStatus(request.eventId);
  }

  res.json(new ApiResponse('Request cancelled', { id: request._id, status: request.status }));
});