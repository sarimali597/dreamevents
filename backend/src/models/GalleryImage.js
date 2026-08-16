import mongoose, { Schema } from 'mongoose';

const GalleryImageSchema = new Schema(
  {
  sellerId: { type: Schema.Types.ObjectId, ref: 'SellerProfile', required: true, index: true },
  url: { type: String, required: true, trim: true },
  thumbnailUrl: { type: String, required: true, trim: true },
  category: {
  type: String,
  enum: ['venue', 'food', 'decoration', 'photos', 'other'],
  default: 'other',
  index: true,
  },
  caption: { type: String, trim: true, maxlength: 200 },
  sortOrder: { type: Number, default: 0 },
  isCover: { type: Boolean, default: false },
  },
  { timestamps: true }
);

GalleryImageSchema.index({ sellerId: 1, category: 1, sortOrder: 1 });

GalleryImageSchema.pre('save', async function (next) {
  if (this.isModified('isCover') && this.isCover) {
  await mongoose.model('GalleryImage').updateMany(
  { sellerId: this.sellerId, _id: { $ne: this._id } },
  { isCover: false }
  );
  }
  next();
});

export const GalleryImage = mongoose.model('GalleryImage', GalleryImageSchema);