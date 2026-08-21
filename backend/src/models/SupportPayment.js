import mongoose, { Schema } from 'mongoose';

const SupportPaymentSchema = new Schema(
  {
  userId: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'PKR' },
  status: {
  type: String,
  enum: ['pending', 'completed', 'failed'],
  default: 'pending',
  index: true,
  },
  coffeeName: { type: String, trim: true, maxlength: 120 },
  safepayOrderId: { type: String, trim: true, index: true },
  message: { type: String, trim: true, maxlength: 500 },
  metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

// Expose the document _id as `reference` so the success page can look it up
// from the ?reference= query param without leaking internal field names.
SupportPaymentSchema.virtual('reference').get(function () {
  return this._id.toString();
});

export const SupportPayment = mongoose.model('SupportPayment', SupportPaymentSchema);