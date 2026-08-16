import { z } from 'zod';
import { Event } from '../models/Event.js';
import { BookingRequest } from '../models/BookingRequest.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const eventSchema = z.object({
  name: z.string().min(2).max(120),
  eventType: z.enum(['wedding', 'mehndi', 'engagement', 'birthday', 'corporate', 'family', 'other']),
  eventDate: z.coerce.date(),
  city: z.string().min(1).default('Sukkur'),
  guestCount: z.number().min(1).optional(),
  budget: z.number().min(0).optional(),
  notes: z.string().max(2000).optional(),
});

export const rollupEventStatus = async (eventId) => {
  const requests = await BookingRequest.find({ eventId }).lean();
  if (requests.length === 0) return;

  const statuses = new Set(requests.map((r) => r.status));
  let status = 'planning';

  if (statuses.has('accepted')) {
  status = statuses.size === 1 ? 'fully_booked' : 'partially_booked';
  } else if (statuses.has('negotiating') || statuses.has('estimate_sent')) {
  status = 'negotiating';
  } else if (statuses.has('pending') || statuses.has('seller_replied')) {
  status = 'request_sent';
  }

  await Event.findByIdAndUpdate(eventId, { status });
};

export const createEvent = asyncHandler(async (req, res) => {
  const data = eventSchema.parse(req.body);

  if (new Date(data.eventDate).getTime() < Date.now()) {
  throw new ApiError(400, 'Event date must be in the future');
  }

  const event = await Event.create({ userId: req.user._id, ...data, status: 'planning' });
  res.status(201).json(new ApiResponse('Event created', event));
});

export const listMyEvents = asyncHandler(async (req, res) => {
  const filter = { userId: req.user._id };
  if (req.query.status) {
  filter.status = String(req.query.status);
  }

  const events = await Event.find(filter).sort({ eventDate: -1 }).lean();
  res.json(new ApiResponse('Events fetched', events));
});

export const getEvent = asyncHandler(async (req, res) => {
  const event = await Event.findOne({ _id: req.params.id, userId: req.user._id }).lean();
  if (!event) {
  throw new ApiError(404, 'Event not found');
  }
  res.json(new ApiResponse('Event fetched', event));
});

export const updateEvent = asyncHandler(async (req, res) => {
  const data = eventSchema.partial().parse(req.body);

  const event = await Event.findOne({ _id: req.params.id, userId: req.user._id });
  if (!event) {
  throw new ApiError(404, 'Event not found');
  }

  if (data.eventDate && new Date(data.eventDate).getTime() < Date.now()) {
  throw new ApiError(400, 'Event date must be in the future');
  }

  Object.assign(event, data);
  await event.save();
  res.json(new ApiResponse('Event updated', event));
});

export const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findOne({ _id: req.params.id, userId: req.user._id });
  if (!event) {
  throw new ApiError(404, 'Event not found');
  }

  event.status = 'cancelled';
  await event.save();
  res.json(new ApiResponse('Event cancelled', { id: event._id }));
});