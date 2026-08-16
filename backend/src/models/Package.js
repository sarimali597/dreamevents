import mongoose, { Schema } from 'mongoose';

const PackageSchema = new Schema(
  {
  sellerId: { type: Schema.Types.ObjectId, ref: 'SellerProfile', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, trim: true, maxlength: 1000 },
  price: { type: Number, required: true, min: 0 },
  priceType: { type: String, enum: ['fixed', 'per_person'], default: 'fixed' },
  inclusions: [{ type: String, trim: true }],
  servicesIncluded: [{ type: Schema.Types.ObjectId, ref: 'Service' }],
  isActive: { type: Boolean, default: true },
  image: { type: String, trim: true },
  },
  { timestamps: true }
);

PackageSchema.index({ sellerId: 1, isActive: 1 });

export const Package = mongoose.model('Package', PackageSchema);