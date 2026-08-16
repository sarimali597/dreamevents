import { z } from 'zod';
import { Message } from '../models/Message.js';
import { BookingRequest } from '../models/BookingRequest.js';
import { SellerProfile } from '../models/SellerProfile.js';
import { User } from '../models/User.js';
import { createNotification } from '../services/notification.service.js';
import { emitToBooking } from '../sockets/io.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const getParticipantProfile = async (userId) => {
  if (userId.role === 'seller') {
  return SellerProfile.findOne({ userId: userId._id });
  }
  return null;
};

const assertParticipant = async (request, user) => {
  if (user.role === 'admin') return;
  const profile = await getParticipantProfile(user);
  const isParticipant =
  String(request.userId) === String(user._id) ||
  (profile && String(request.sellerId) === String(profile._id));
  if (!isParticipant) {
  throw new ApiError(403, 'Not authorized for this thread');
  }
};

export const listThreadMessages = asyncHandler(async (req, res) => {
  const request = await BookingRequest.findById(req.params.bookingRequestId);
  if (!request) {
  throw new ApiError(404, 'Booking request not found');
  }
  await assertParticipant(request, req.user);

  const messages = await Message.find({ bookingRequestId: request._id })
  .sort({ createdAt: 1 })
  .lean();

  await Message.updateMany(
  { bookingRequestId: request._id, isRead: false, senderId: { $ne: req.user._id } },
  { $set: { isRead: true, readAt: new Date() } }
  );

  res.json(new ApiResponse('Messages fetched', messages));
});

export const sendMessage = asyncHandler(async (req, res) => {
  const schema = z.object({
  bookingRequestId: z.string().min(1),
  content: z.string().min(1).max(5000),
  type: z
  .enum(['text', 'image', 'estimate', 'booking_summary', 'system_notification'])
  .default('text'),
  imageUrl: z.string().url().optional(),
  });
  const data = schema.parse(req.body);

  const request = await BookingRequest.findById(data.bookingRequestId);
  if (!request) {
  throw new ApiError(404, 'Booking request not found');
  }
  await assertParticipant(request, req.user);

  const senderRole = req.user.role === 'seller' ? 'seller' : req.user.role === 'admin' ? 'system' : 'customer';

  const message = await Message.create({
  bookingRequestId: request._id,
  senderId: req.user._id,
  senderRole,
  type: data.type,
  content: data.content,
  imageUrl: data.imageUrl,
  });

  emitToBooking(String(request._id), 'message:new', message);

  const otherPartyId =
  String(request.userId) === String(req.user._id) ? request.sellerId : request.userId;

  if (otherPartyId && otherPartyId !== 'system') {
  await createNotification({
  userId: otherPartyId,
  type: 'new_message',
  title: 'New message',
  body: data.content.length > 120 ? `${data.content.slice(0, 120)}…` : data.content,
  link: '/messages',
  metadata: { bookingRequestId: String(request._id) },
  }).catch(() => {});
  }

  res.status(201).json(new ApiResponse('Message sent', message));
});

export const listConversations = asyncHandler(async (req, res) => {
  const profile = await getParticipantProfile(req.user);

  const filter = req.user.role === 'seller'
  ? { sellerId: profile._id }
  : req.user.role === 'customer'
  ? { userId: req.user._id }
  : {};

  const requests = await BookingRequest.find(filter).sort({ updatedAt: -1 }).lean();

  const threads = await Promise.all(
  requests.map(async (request) => {
  const lastMessage = await Message.findOne({ bookingRequestId: request._id })
  .sort({ createdAt: -1 })
  .lean();
  const unreadCount = await Message.countDocuments({
  bookingRequestId: request._id,
  isRead: false,
  senderId: { $ne: req.user._id },
  });

  let peer = null;
  if (req.user.role === 'customer') {
  peer = await SellerProfile.findById(request.sellerId)
  .select('businessName slug coverImage city category')
  .lean();
  } else if (req.user.role === 'seller') {
  peer = await User.findById(request.userId).select('name email phone avatar').lean();
  } else {
  const seller = await SellerProfile.findById(request.sellerId)
  .select('businessName slug coverImage')
  .lean();
  const customer = await User.findById(request.userId).select('name email').lean();
  peer = { seller, customer };
  }

  return {
  bookingRequestId: request._id,
  eventType: request.eventType,
  eventDate: request.eventDate,
  status: request.status,
  peer,
  lastMessage: lastMessage ?? null,
  unreadCount,
  };
  })
  );

  threads.sort((a, b) => {
  const ta = a.lastMessage?.createdAt ?? new Date(0);
  const tb = b.lastMessage?.createdAt ?? new Date(0);
  return tb - ta;
  });

  res.json(new ApiResponse('Conversations fetched', threads));
});