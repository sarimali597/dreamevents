import cron from 'node-cron';
import { BookingRequest } from '../models/BookingRequest.js';
import { Booking } from '../models/Booking.js';
import { Availability } from '../models/Availability.js';
import { createNotification } from '../services/notification.service.js';

const REQUEST_HOLD_HOURS = 48;

const expireAcceptedRequests = async () => {
  const cutoff = new Date(Date.now() - REQUEST_HOLD_HOURS * 60 * 60 * 1000);
  const requests = await BookingRequest.find({
  status: 'accepted',
  acceptedAt: { $lte: cutoff },
  depositConfirmed: false,
  });

  for (const request of requests) {
  request.status = 'expired';
  await request.save();
  await Availability.updateMany(
  { sellerId: request.sellerId, bookingRequestId: request._id },
  { $set: { status: 'available' }, $unset: { bookingRequestId: 1, bookingId: 1 } }
  );
  await createNotification({
  userId: request.userId,
  type: 'system',
  title: 'Booking request expired',
  body: `Your booking request expired because the deposit was not confirmed within ${REQUEST_HOLD_HOURS} hours. Contact the seller to start again.`,
  link: '/messages',
  });
  }

  if (requests.length > 0) {
  console.log(`[scheduler] Expired ${requests.length} booking request(s)`);
  }
};

const releaseStalePendingAvailability = async () => {
  const cutoff = new Date(Date.now() - REQUEST_HOLD_HOURS * 60 * 60 * 1000);
  const stale = await Availability.find({
  status: 'pending',
  updatedAt: { $lte: cutoff },
  });

  for (const slot of stale) {
  slot.status = 'available';
  slot.bookingRequestId = null;
  await slot.save();
  }

  if (stale.length > 0) {
  console.log(`[scheduler] Released ${stale.length} stale availability slot(s)`);
  }
};

const autoCompleteBookings = async () => {
  const bookings = await Booking.find({
  status: 'confirmed',
  eventDate: { $lte: new Date() },
  });

  for (const booking of bookings) {
  booking.status = 'completed';
  await booking.save();
  }

  if (bookings.length > 0) {
  console.log(`[scheduler] Completed ${bookings.length} booking(s)`);
  }
};

export const startScheduler = () => {
  cron.schedule('*/10 * * * *', () => {
  expireAcceptedRequests().catch((error) => console.error('[scheduler] expire job failed:', error));
  releaseStalePendingAvailability().catch((error) => console.error('[scheduler] release job failed:', error));
  });

  cron.schedule('0 * * * *', () => {
  autoCompleteBookings().catch((error) => console.error('[scheduler] complete job failed:', error));
  });

  console.log('[scheduler] Started (10-min maintenance jobs, hourly booking auto-complete)');
};