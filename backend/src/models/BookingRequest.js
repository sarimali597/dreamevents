import mongoose, { Schema } from 'mongoose';

const BookingRequestSchema = new Schema(
  {
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  sellerId: { type: Schema.Types.ObjectId, ref: 'SellerProfile', required: true, index: true },
  eventId: { type: Schema.Types.ObjectId, ref: 'Event', default: null, index: true },
  eventType: {
  type: String,
  required: true,
  enum: ['wedding', 'mehndi', 'engagement', 'birthday', 'corporate', 'family', 'other'],
  },
  eventDate: { type: Date, required: true, index: true },
  timeWindow: { type: String, trim: true, maxlength: 50 },
  guestCount: { type: Number, required: true, min: 1 },
  budgetRange: {
  min: { type: Number, min: 0 },
  max: { type: Number, min: 0 },
  },
  specialRequirements: { type: String, trim: true, maxlength: 2000 },
  message: { type: String, required: true, trim: true, maxlength: 2000 },
  status: {
  type: String,
  required: true,
  enum: ['pending', 'seller_replied', 'estimate_sent', 'negotiating', 'accepted', 'rejected', 'expired', 'cancelled'],
  default: 'pending',
  index: true,
  },
  sellerResponse: { type: String, trim: true, maxlength: 2000 },
  alternativeDate: Date,
  acceptedAt: Date,
  depositAmount: { type: Number, min: 0 },
  depositConfirmed: { type: Boolean, default: false },
  expiresAt: Date,
  statusPrevious: { type: String, default: null },
  isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

BookingRequestSchema.index({ sellerId: 1, status: 1, createdAt: -1 });
BookingRequestSchema.index({ userId: 1, status: 1, createdAt: -1 });
BookingRequestSchema.index({ sellerId: 1, eventDate: 1, status: 1 });
BookingRequestSchema.index({ status: 1, expiresAt: 1 });

BookingRequestSchema.set('toJSON', {
  transform: (_doc, ret) => {
  delete ret.statusPrevious;
  return ret;
  },
});

const validBookingRequestTransitions = {
  pending: ['seller_replied', 'estimate_sent', 'rejected', 'cancelled'],
  seller_replied: ['estimate_sent', 'negotiating', 'rejected', 'cancelled'],
  estimate_sent: ['negotiating', 'accepted', 'rejected', 'cancelled'],
  negotiating: ['estimate_sent', 'accepted', 'rejected', 'cancelled'],
  accepted: ['expired', 'cancelled'],
  rejected: [],
  expired: [],
  cancelled: [],
};

BookingRequestSchema.pre('validate', function (next) {
  if (this.isModified('status')) {
  const prev = this.statusPrevious || 'pending';
  const allowed = validBookingRequestTransitions[prev] || [];
  if (prev !== this.status && !allowed.includes(this.status)) {
  return next(new Error(`Invalid booking request transition: ${prev} -> ${this.status}`));
  }
  if (this.status === 'accepted' && !this.acceptedAt) {
  this.acceptedAt = new Date();
  this.expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
  }
  }
  next();
});

BookingRequestSchema.pre('save', function (next) {
  if (this.isModified('status')) {
  this.statusPrevious = this.status;
  }
  next();
});

export const BookingRequest = mongoose.model('BookingRequest', BookingRequestSchema);