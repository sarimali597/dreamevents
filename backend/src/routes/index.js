import { Router } from 'express';
import mongoose from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import sellerRoutes from './seller.routes.js';
import serviceRoutes from './service.routes.js';
import searchRoutes from './search.routes.js';
import eventRoutes from './event.routes.js';
import bookingRequestRoutes from './bookingRequest.routes.js';
import availabilityRoutes from './availability.routes.js';
import estimateRoutes from './estimate.routes.js';
import bookingRoutes from './booking.routes.js';
import { messageRouter, notificationRouter } from './message.routes.js';
import { reviewRouter, favoriteRouter, feedPostRouter } from './review.routes.js';
import supportPaymentRoutes from './supportPayment.routes.js';
import adminRoutes from './admin.routes.js';
import uploadRoutes from './upload.routes.js';
import seedRoutes from './seed.routes.js';

const router = Router();

router.get(
  '/health',
  asyncHandler(async (_req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  res.status(dbConnected ? 200 : 503).json(
  new ApiResponse('Health check', {
  status: dbConnected ? 'ok' : 'degraded',
  db: dbConnected ? 'connected' : 'disconnected',
  uptime: process.uptime(),
  timestamp: new Date().toISOString(),
  })
  );
  })
);

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/sellers', sellerRoutes);
router.use('/services', serviceRoutes);
router.use('/search', searchRoutes);
router.use('/events', eventRoutes);
router.use('/booking-requests', bookingRequestRoutes);
router.use('/availability', availabilityRoutes);
router.use('/estimates', estimateRoutes);
router.use('/bookings', bookingRoutes);
router.use('/messages', messageRouter);
router.use('/notifications', notificationRouter);
router.use('/reviews', reviewRouter);
router.use('/favorites', favoriteRouter);
router.use('/feed', feedPostRouter);
router.use('/support', supportPaymentRoutes);
router.use('/admin', adminRoutes);
router.use('/upload', uploadRoutes);
router.use('/seed', seedRoutes);

export default router;