import mongoose, { Schema } from 'mongoose';

const ServiceSchema = new Schema(
  {
  sellerId: { type: Schema.Types.ObjectId, ref: 'SellerProfile', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, trim: true, maxlength: 1000 },
  price: { type: Number, required: true, min: 0 },
  priceType: {
  type: String,
  required: true,
  enum: ['fixed', 'per_person', 'per_hour', 'per_day'],
  },
  capacity: { type: Number, min: 0 },
  duration: { type: Number, min: 0 },
  inclusions: [{ type: String, trim: true }],
  category: { type: String, required: true, index: true },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ServiceSchema.index({ sellerId: 1, isActive: 1, sortOrder: 1 });

export const Service = mongoose.model('Service', ServiceSchema);