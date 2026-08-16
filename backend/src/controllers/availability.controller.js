import { z } from 'zod';
import { Availability } from '../models/Availability.js';
import { SellerProfile } from '../models/SellerProfile.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getSellerCalendar = asyncHandler(async (req, res) => {
  const { sellerId } = req.params;
  const year = Number(req.query.year) || new Date().getFullYear();
  const month = Number(req.query.month) || new Date().getMonth() + 1;

  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));

  const entries = await Availability.find({ sellerId, date: { $gte: start, $lt: end } })
  .sort({ date: 1 })
  .lean();

  const days = {};
  for (const entry of entries) {
  days[entry.date.toISOString().slice(0, 10)] = entry;
  }

  res.json(new ApiResponse('Calendar fetched', { year, month, days }));
});

export const updateSellerCalendar = asyncHandler(async (req, res) => {
  const { sellerId } = req.params;

  const profile = await SellerProfile.findOne({ userId: req.user._id });
  if (!profile || profile._id.toString() !== String(sellerId)) {
  throw new ApiError(403, 'You can only update your own calendar');
  }

  const schema = z.object({
  updates: z
  .array(
  z.object({
  date: z.coerce.date(),
  status: z.enum(['available', 'blocked']),
  note: z.string().max(200).optional(),
  })
  )
  .min(1)
  .max(200),
  });

  const { updates } = schema.parse(req.body);
  const results = [];

  for (const update of updates) {
  const date = new Date(update.date);
  date.setUTCHours(0, 0, 0, 0);
  const key = date.toISOString().slice(0, 10);

  let entry = await Availability.findOne({ sellerId, date });

  if (!entry) {
  entry = new Availability({ sellerId, date, status: update.status, note: update.note });
  } else {
  if (entry.status === 'pending') {
  throw new ApiError(409, `${key} is under a pending booking request`);
  }
  if (entry.status === 'booked') {
  throw new ApiError(409, `${key} has a confirmed booking`);
  }
  entry.status = update.status;
  entry.note = update.note ?? entry.note;
  }

  await entry.save();
  results.push(entry);
  }

  res.json(new ApiResponse('Calendar updated', results));
});