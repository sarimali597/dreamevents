import mongoose, { Schema } from 'mongoose';

const MenuItemSchema = new Schema(
  {
  sellerId: { type: Schema.Types.ObjectId, ref: 'SellerProfile', required: true, index: true },
  menuCategoryId: { type: Schema.Types.ObjectId, ref: 'MenuCategory', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, trim: true, maxlength: 500 },
  unitPrice: { type: Number, required: true, min: 0 },
  minQuantity: { type: Number, required: true, min: 1, default: 1 },
  isActive: { type: Boolean, default: true },
  image: { type: String, trim: true },
  },
  { timestamps: true }
);

MenuItemSchema.index({ sellerId: 1, menuCategoryId: 1, isActive: 1 });

export const MenuItem = mongoose.model('MenuItem', MenuItemSchema);