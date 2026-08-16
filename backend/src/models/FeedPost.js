import mongoose, { Schema } from 'mongoose';

const FeedPostSchema = new Schema(
  {
  sellerId: { type: Schema.Types.ObjectId, ref: 'SellerProfile', required: true, index: true },
  mediaUrl: { type: String, required: true, trim: true },
  mediaType: { type: String, enum: ['image', 'video'], default: 'image' },
  caption: { type: String, trim: true, maxlength: 1000 },
  taggedServiceId: { type: Schema.Types.ObjectId, ref: 'Service', default: null },
  likesCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

FeedPostSchema.index({ sellerId: 1, createdAt: -1 });
FeedPostSchema.index({ createdAt: -1 });

export const FeedPost = mongoose.model('FeedPost', FeedPostSchema);