import mongoose, { Schema } from 'mongoose';

const FavoriteSchema = new Schema(
  {
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['seller', 'feedPost'], required: true },
  sellerId: { type: Schema.Types.ObjectId, ref: 'SellerProfile', default: null, index: true },
  feedPostId: { type: Schema.Types.ObjectId, ref: 'FeedPost', default: null, index: true },
  },
  { timestamps: true }
);

FavoriteSchema.index({ userId: 1, type: 1, sellerId: 1 }, { unique: true, sparse: true });
FavoriteSchema.index({ userId: 1, type: 1, feedPostId: 1 }, { unique: true, sparse: true });

export const Favorite = mongoose.model('Favorite', FavoriteSchema);