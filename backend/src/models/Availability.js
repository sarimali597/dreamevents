import mongoose, { Schema } from 'mongoose';

const AvailabilitySchema = new Schema(
  {
  sellerId: { type: Schema.Types.ObjectId, ref: 'SellerProfile', required: true, index: true },
  date: {
  type: Date,
  required: true,
  set: (v) => {
  const d = new Date(v);
  d.setUTCHours(0, 0, 0, 0);
  return d;
  },
  },
  status: {
  type: String,
  enum: ['available', 'pending', 'booked', 'blocked'],
  default: 'available',
  index: true,
  },
  bookingRequestId: { type: Schema.Types.ObjectId, ref: 'BookingRequest', default: null, index: true },
  bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', default: null, index: true },
  note: { type: String, trim: true, maxlength: 200 },
  statusPrevious: { type: String, default: null },
  },
  { timestamps: true }
);

AvailabilitySchema.index({ sellerId: 1, date: 1 }, { unique: true });
AvailabilitySchema.index({ sellerId: 1, date: 1, status: 1 });

const validAvailabilityTransitions = {
  available: ['pending', 'blocked'],
  pending: ['booked', 'available'],
  booked: ['available'],
  blocked: ['available'],
};

AvailabilitySchema.pre('validate', function (next) {
  if (this.isModified('status')) {
  const prev = this.statusPrevious || 'available';
  const allowed = validAvailabilityTransitions[prev] || [];
  if (prev !== this.status && !allowed.includes(this.status)) {
  return next(new Error(`Invalid availability transition: ${prev} -> ${this.status}`));
  }
  }
  next();
});

AvailabilitySchema.pre('save', function (next) {
  if (this.isModified('status')) {
  this.statusPrevious = this.status;
  }
  next();
});

AvailabilitySchema.set('toJSON', {
  transform: (_doc, ret) => {
  delete ret.statusPrevious;
  return ret;
  },
});

export const Availability = mongoose.model('Availability', AvailabilitySchema);