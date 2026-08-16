import mongoose, { Schema } from 'mongoose';

const MessageSchema = new Schema(
  {
  bookingRequestId: { type: Schema.Types.ObjectId, ref: 'BookingRequest', required: true, index: true },
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  senderRole: { type: String, enum: ['customer', 'seller', 'system'], required: true },
  type: {
  type: String,
  enum: ['text', 'image', 'estimate', 'booking_summary', 'system_notification'],
  default: 'text',
  index: true,
  },
  content: { type: String, required: true, maxlength: 5000 },
  imageUrl: { type: String, trim: true },
  metadata: {
  estimateId: { type: String },
  bookingRequestId: { type: String },
  actionType: { type: String, enum: ['accept', 'reject', 'request_changes'] },
  },
  isRead: { type: Boolean, default: false, index: true },
  readAt: Date,
  },
  { timestamps: true }
);

MessageSchema.index({ bookingRequestId: 1, createdAt: 1 });
MessageSchema.index({ bookingRequestId: 1, senderRole: 1, isRead: 1 });

export const Message = mongoose.model('Message', MessageSchema);