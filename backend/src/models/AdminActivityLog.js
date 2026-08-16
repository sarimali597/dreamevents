import mongoose, { Schema } from 'mongoose';

const AdminActivityLogSchema = new Schema(
  {
  adminId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  action: { type: String, required: true, trim: true, maxlength: 100 },
  targetType: {
  type: String,
  required: true,
  enum: ['seller', 'user', 'review', 'booking', 'category', 'city', 'report', 'homepage'],
  },
  targetId: { type: Schema.Types.ObjectId, index: true },
  previousValue: { type: Schema.Types.Mixed },
  newValue: { type: Schema.Types.Mixed },
  reason: { type: String, trim: true, maxlength: 500 },
  ipAddress: { type: String, trim: true },
  userAgent: { type: String, trim: true },
  },
  { timestamps: { updatedAt: false } }
);

AdminActivityLogSchema.index({ adminId: 1, createdAt: -1 });
AdminActivityLogSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });

export const AdminActivityLog = mongoose.model('AdminActivityLog', AdminActivityLogSchema);