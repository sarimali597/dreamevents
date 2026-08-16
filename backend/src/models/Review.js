import mongoose, { Schema } from 'mongoose';

const ReviewSchema = new Schema(
  {
  bookingId: {
  type: Schema.Types.ObjectId,
  ref: 'Booking',
  required: true,
  unique: true,
  index: true,
  },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  sellerId: { type: Schema.Types.ObjectId, ref: 'SellerProfile', required: true, index: true },
  overallRating: { type: Number, required: true, min: 1, max: 5 },
  subRatings: {
  serviceQuality: { type: Number, required: true, min: 1, max: 5 },
  priceFairness: { type: Number, required: true, min: 1, max: 5 },
  communication: { type: Number, required: true, min: 1, max: 5 },
  timeliness: { type: Number, required: true, min: 1, max: 5 },
  },
  text: { type: String, required: true, trim: true, minlength: 10, maxlength: 2000 },
  photos: [{ type: String, trim: true }],
  sellerReply: {
  text: { type: String, trim: true, maxlength: 1000 },
  repliedAt: Date,
  },
  isFlagged: { type: Boolean, default: false, index: true },
  flagReason: { type: String, trim: true, maxlength: 500 },
  isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

ReviewSchema.index({ sellerId: 1, overallRating: -1, createdAt: -1 });
ReviewSchema.index({ sellerId: 1, isDeleted: 1, createdAt: -1 });

ReviewSchema.pre('save', async function (next) {
  if (this.isNew) {
  const Booking = mongoose.model('Booking');
  const booking = await Booking.findById(this.bookingId);
  if (!booking) {
  return next(new Error('Review must be linked to a valid booking'));
  }
  if (booking.status !== 'completed') {
  return next(new Error('Reviews can only be created for completed bookings'));
  }
  if (booking.userId.toString() !== this.userId.toString()) {
  return next(new Error('Only the booking customer can leave a review'));
  }
  }
  next();
});

ReviewSchema.post('save', async function (doc) {
  const SellerProfile = mongoose.model('SellerProfile');
  const Review = mongoose.model('Review');

  const stats = await Review.aggregate([
  { $match: { sellerId: doc.sellerId, isDeleted: false } },
  {
  $group: {
  _id: '$sellerId',
  avgRating: { $avg: '$overallRating' },
  count: { $sum: 1 },
  },
  },
  ]);

  if (stats.length > 0) {
  await SellerProfile.findByIdAndUpdate(doc.sellerId, {
  rating: Math.round(stats[0].avgRating * 10) / 10,
  reviewCount: stats[0].count,
  });
  }
});

export const Review = mongoose.model('Review', ReviewSchema);