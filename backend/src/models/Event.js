import mongoose, { Schema } from 'mongoose';

const EventSchema = new Schema(
  {
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 120 },
  eventType: {
  type: String,
  required: true,
  enum: ['wedding', 'mehndi', 'engagement', 'birthday', 'corporate', 'family', 'other'],
  },
  eventDate: { type: Date, required: true, index: true },
  city: { type: String, required: true, trim: true, default: 'Sukkur' },
  guestCount: { type: Number, min: 1 },
  budget: { type: Number, min: 0 },
  notes: { type: String, trim: true, maxlength: 2000 },
  status: {
  type: String,
  enum: ['planning', 'request_sent', 'negotiating', 'partially_booked', 'fully_booked', 'completed', 'cancelled'],
  default: 'planning',
  index: true,
  },
  linkedBookingIds: [{ type: Schema.Types.ObjectId, ref: 'BookingRequest' }],
  },
  { timestamps: true }
);

EventSchema.index({ userId: 1, eventDate: -1 });
EventSchema.index({ userId: 1, status: 1 });

export const Event = mongoose.model('Event', EventSchema);