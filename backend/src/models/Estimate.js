import mongoose, { Schema } from 'mongoose';

const EstimateLineItemSchema = new Schema(
  {
  name: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, trim: true, maxlength: 500 },
  quantity: { type: Number, required: true, min: 0 },
  unitPrice: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const EstimateSchema = new Schema(
  {
  bookingRequestId: { type: Schema.Types.ObjectId, ref: 'BookingRequest', required: true, index: true },
  sellerId: { type: Schema.Types.ObjectId, ref: 'SellerProfile', required: true, index: true },
  version: { type: Number, required: true, min: 1, default: 1 },
  lineItems: {
  type: [EstimateLineItemSchema],
  required: true,
  validate: [(val) => val.length > 0, 'At least one line item is required'],
  },
  subtotal: { type: Number, required: true, min: 0 },
  discountPercent: { type: Number, default: 0, min: 0, max: 100 },
  discountAmount: { type: Number, default: 0, min: 0 },
  serviceChargePercent: { type: Number, default: 0, min: 0 },
  serviceChargeAmount: { type: Number, default: 0, min: 0 },
  taxPercent: { type: Number, default: 0, min: 0 },
  taxAmount: { type: Number, default: 0, min: 0 },
  total: { type: Number, required: true, min: 0 },
  validityDate: { type: Date, required: true },
  status: {
  type: String,
  enum: ['draft', 'sent', 'viewed', 'accepted', 'rejected', 'superseded', 'expired'],
  default: 'draft',
  index: true,
  },
  notes: { type: String, trim: true, maxlength: 1000 },
  },
  { timestamps: true }
);

EstimateSchema.index({ bookingRequestId: 1, version: -1 });
EstimateSchema.index({ sellerId: 1, status: 1, createdAt: -1 });

EstimateSchema.pre('validate', function (next) {
  if (
  this.isModified('lineItems') ||
  this.isModified('discountPercent') ||
  this.isModified('serviceChargePercent') ||
  this.isModified('taxPercent')
  ) {
  this.subtotal = this.lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  this.discountAmount = (this.subtotal * this.discountPercent) / 100;
  const afterDiscount = this.subtotal - this.discountAmount;
  this.serviceChargeAmount = (afterDiscount * this.serviceChargePercent) / 100;
  this.taxAmount = (afterDiscount * this.taxPercent) / 100;
  this.total = afterDiscount + this.serviceChargeAmount + this.taxAmount;
  this.lineItems.forEach((item) => {
  item.total = item.quantity * item.unitPrice;
  });
  }
  next();
});

export const Estimate = mongoose.model('Estimate', EstimateSchema);