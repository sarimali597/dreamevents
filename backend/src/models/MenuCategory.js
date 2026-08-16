import mongoose, { Schema } from 'mongoose';

const MenuCategorySchema = new Schema(
  {
  sellerId: { type: Schema.Types.ObjectId, ref: 'SellerProfile', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 50 },
  sortOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

MenuCategorySchema.index({ sellerId: 1, isActive: 1, sortOrder: 1 });

export const MenuCategory = mongoose.model('MenuCategory', MenuCategorySchema);