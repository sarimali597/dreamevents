import mongoose, { Schema } from 'mongoose';

const NotificationSchema = new Schema(
  {
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: {
  type: String,
  required: true,
  enum: [
  'new_booking_request',
  'request_accepted',
  'request_rejected',
  'new_estimate',
  'estimate_revised',
  'estimate_accepted',
  'booking_confirmed',
  'payment_reminder',
  'new_message',
  'new_review',
  'seller_reply_to_review',
  'availability_changed',
  'seller_approved',
  'seller_rejected',
  'system',
  ],
  index: true,
  },
  title: { type: String, required: true, trim: true, maxlength: 200 },
  body: { type: String, required: true, trim: true, maxlength: 500 },
  link: { type: String, trim: true, maxlength: 500 },
  metadata: { type: Schema.Types.Mixed },
  isRead: { type: Boolean, default: false, index: true },
  readAt: Date,
  isEmailSent: { type: Boolean, default: false },
  emailSentAt: Date,
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, type: 1, createdAt: -1 });

export const Notification = mongoose.model('Notification', NotificationSchema);