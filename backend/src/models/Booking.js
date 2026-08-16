import mongoose, { Schema } from 'mongoose';

const BookingSchema = new Schema(
  {
  bookingRequestId: { type: Schema.Types.ObjectId, ref: 'BookingRequest', required: true, unique: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  sellerId: { type: Schema.Types.ObjectId, ref: 'SellerProfile', required: true, index: true },
  eventId: { type: Schema.Types.ObjectId, ref: 'Event', default: null, index: true },
  eventDate: { type: Date, required: true, index: true },
  eventType: { type: String, required: true },
  guestCount: { type: Number, required: true, min: 1 },
  estimateId: { type: Schema.Types.ObjectId, ref: 'Estimate', required: true },
  totalAmount: { type: Number, required: true, min: 0 },
  depositAmount: { type: Number, required: true, min: 0 },
  balanceAmount: { type: Number, required: true, min: 0 },
  status: {
  type: String,
  enum: ['confirmed', 'completed', 'cancelled_by_customer', 'cancelled_by_seller', 'disputed'],
  default: 'confirmed',
  index: true,
  },
  depositConfirmedAt: { type: Date, required: true },
  completedAt: Date,
  cancellationReason: { type: String, trim: true, maxlength: 1000 },
  statusPrevious: { type: String, default: null },
  isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

BookingSchema.index({ sellerId: 1, eventDate: 1 });
BookingSchema.index({ userId: 1, eventDate: -1 });
BookingSchema.index({ status: 1, eventDate: 1 });

const validBookingTransitions = {
  confirmed: ['completed', 'cancelled_by_customer', 'cancelled_by_seller', 'disputed'],
  completed: [],
  cancelled_by_customer: [],
  cancelled_by_seller: [],
  disputed: ['completed', 'cancelled_by_customer', 'cancelled_by_seller'],
};

BookingSchema.pre('validate', function (next) {
  if (this.isModified('status')) {
  const prev = this.statusPrevious || 'confirmed';
  const allowed = validBookingTransitions[prev] || [];
  if (prev !== this.status && !allowed.includes(this.status)) {
  return next(new Error(`Invalid booking transition: ${prev} -> ${this.status}`));
  }
  if (this.status === 'completed' && !this.completedAt) {
  this.completedAt = new Date();
  }
  }
  next();
});

BookingSchema.pre('save', function (next) {
  if (this.isModified('status')) {
  this.statusPrevious = this.status;
  }
  next();
});

BookingSchema.set('toJSON', {
  transform: (_doc, ret) => {
  delete ret.statusPrevious;
  return ret;
  },
});

export const Booking = mongoose.model('Booking', BookingSchema);