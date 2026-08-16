import mongoose, { Schema } from 'mongoose';

const ReportSchema = new Schema(
  {
  reporterId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  targetType: {
  type: String,
  required: true,
  enum: ['seller', 'review', 'feedPost', 'message'],
  },
  targetId: { type: Schema.Types.ObjectId, required: true, index: true },
  reason: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, trim: true, maxlength: 2000 },
  status: {
  type: String,
  enum: ['open', 'under_review', 'resolved', 'dismissed'],
  default: 'open',
  index: true,
  },
  adminId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  resolution: { type: String, trim: true, maxlength: 1000 },
  resolvedAt: Date,
  },
  { timestamps: true }
);

ReportSchema.index({ status: 1, createdAt: -1 });
ReportSchema.index({ targetType: 1, targetId: 1 });

export const Report = mongoose.model('Report', ReportSchema);