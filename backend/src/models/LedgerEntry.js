import mongoose, { Schema } from 'mongoose';

const LedgerEntrySchema = new Schema(
  {
  bookingRequestId: { type: Schema.Types.ObjectId, ref: 'BookingRequest', required: true, index: true },
  bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', default: null, index: true },
  type: {
  type: String,
  required: true,
  enum: ['deposit_sent', 'deposit_received', 'balance_sent', 'balance_received', 'refund'],
  index: true,
  },
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'PKR' },
  method: { type: String, trim: true, maxlength: 50 },
  reference: { type: String, trim: true, maxlength: 200 },
  recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  notes: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

LedgerEntrySchema.index({ bookingRequestId: 1, createdAt: -1 });
LedgerEntrySchema.index({ bookingId: 1, createdAt: -1 });

export const LedgerEntry = mongoose.model('LedgerEntry', LedgerEntrySchema);