import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { BookingRequest } from '../models/BookingRequest.js';

export const setupSocketHandlers = (io) => {
  io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
  return next(new Error('Authentication error'));
  }
  try {
  const decoded = jwt.verify(token, env.JWT_SECRET);
  socket.data.user = { id: decoded.userId, role: decoded.role };
  next();
  } catch (_error) {
  next(new Error('Authentication error'));
  }
  });

  io.on('connection', (socket) => {
  const { id: userId, role } = socket.data.user;
  socket.join(`user:${userId}`);

  socket.on('join-booking', async (bookingRequestId) => {
  try {
  const request = await BookingRequest.findById(bookingRequestId);
  if (!request) {
  return socket.emit('error', { message: 'Booking request not found' });
  }
  const isParticipant =
  String(request.customerId) === String(userId) ||
  String(request.sellerId) === String(userId) ||
  role === 'admin';
  if (!isParticipant) {
  return socket.emit('error', { message: 'Not authorized to join this thread' });
  }
  socket.join(`booking:${bookingRequestId}`);
  } catch (_error) {
  socket.emit('error', { message: 'Invalid booking request' });
  }
  });

  socket.on('leave-room', (bookingRequestId) => {
  socket.leave(`booking:${bookingRequestId}`);
  });

  socket.on('typing', ({ bookingRequestId, isTyping }) => {
  socket.to(`booking:${bookingRequestId}`).emit('typing', {
  bookingRequestId,
  userId,
  isTyping: Boolean(isTyping),
  });
  });
  });
};
