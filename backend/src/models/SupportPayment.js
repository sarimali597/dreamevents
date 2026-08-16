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
  safepayOrderId: { type: String, trim: true, index: true },
  message: { type: String, trim: true, maxlength: 500 },
  metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const SupportPayment = mongoose.model('SupportPayment', SupportPaymentSchema);