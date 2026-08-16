import mongoose, { Schema } from 'mongoose';

const SellerProfileSchema = new Schema(
  {
  userId: {
  type: Schema.Types.ObjectId,
  ref: 'User',
  required: true,
  unique: true,
  index: true,
  },
  businessName: {
  type: String,
  required: [true, 'Business name is required'],
  trim: true,
  maxlength: [120, 'Business name cannot exceed 120 characters'],
  index: 'text',
  },
  slug: {
  type: String,
  required: true,
  unique: true,
  lowercase: true,
  trim: true,
  match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be URL-friendly'],
  index: true,
  },
  category: { type: String, required: true, index: true },
  subcategories: [{ type: String, index: true }],
  city: { type: String, required: true, index: true },
  area: { type: String, required: true, index: true },
  address: { type: String, required: true, trim: true, maxlength: 500 },
  description: { type: String, trim: true, maxlength: 2000, index: 'text' },
  coverImage: { type: String, trim: true },
  logo: { type: String, trim: true },
  contactPhone: { type: String, required: true, trim: true },
  contactEmail: { type: String, trim: true, lowercase: true },
  whatsappNumber: { type: String, trim: true },
  socialLinks: {
  instagram: { type: String, trim: true },
  facebook: { type: String, trim: true },
  youtube: { type: String, trim: true },
  whatsapp: { type: String, trim: true },
  },
  startingPrice: {
  type: Number,
  required: true,
  min: [0, 'Starting price cannot be negative'],
  default: 0,
  index: true,
  },
  currency: { type: String, default: 'PKR', uppercase: true, trim: true },
  rating: { type: Number, default: 0, min: 0, max: 5, index: true },
  reviewCount: { type: Number, default: 0, min: 0 },
  verificationStatus: {
  type: String,
  enum: ['unverified', 'pending', 'verified'],
  default: 'unverified',
  index: true,
  },
  status: {
  type: String,
  enum: ['pending', 'approved', 'rejected', 'suspended'],
  default: 'pending',
  index: true,
  },
  rejectionReason: { type: String, trim: true, maxlength: 500 },
  isFeatured: { type: Boolean, default: false, index: true },
  featuredUntil: Date,
  businessHours: [
  {
  day: { type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] },
  open: { type: String, match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'] },
  close: { type: String, match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'] },
  isOpen: { type: Boolean, default: true },
  },
  ],
  policies: {
  cancellation: { type: String, trim: true, maxlength: 1000 },
  advancePayment: { type: String, trim: true, maxlength: 500 },
  extraCharges: { type: String, trim: true, maxlength: 1000 },
  },
  location: {
  type: { type: String, enum: ['Point'], default: 'Point' },
  coordinates: { type: [Number], default: [0, 0] },
  },
  verificationDocuments: {
  cnicFront: { type: String, trim: true },
  cnicBack: { type: String, trim: true },
  businessRegistration: { type: String, trim: true },
  submittedAt: Date,
  },
  onboardingStep: { type: Number, min: 1, max: 6, default: 1 },
  onboardingCompleted: { type: Boolean, default: false },
  statusPrevious: { type: String, default: null },
  isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

SellerProfileSchema.index({ location: '2dsphere' });
SellerProfileSchema.index({ status: 1, verificationStatus: 1, category: 1, city: 1 });
SellerProfileSchema.index({ status: 1, category: 1, city: 1, area: 1, startingPrice: 1 });
SellerProfileSchema.index({ status: 1, isFeatured: 1, rating: -1, createdAt: -1 });
SellerProfileSchema.index(
  { businessName: 'text', description: 'text' },
  { weights: { businessName: 10, description: 3 }, name: 'seller_text_search' }
);

const validSellerStatusTransitions = {
  pending: ['approved', 'rejected'],
  approved: ['suspended'],
  rejected: ['pending'],
  suspended: ['approved'],
};

SellerProfileSchema.pre('validate', function (next) {
  if (this.isModified('status') && this.status) {
  const prevStatus = this.statusPrevious || 'pending';
  const allowed = validSellerStatusTransitions[prevStatus] || [];
  if (prevStatus !== this.status && !allowed.includes(this.status)) {
  return next(new Error(`Invalid seller status transition: ${prevStatus} -> ${this.status}`));
  }
  }
  next();
});

SellerProfileSchema.pre('save', function (next) {
  if (this.isModified('status')) {
  this.statusPrevious = this.status;
  }
  next();
});

SellerProfileSchema.set('toJSON', {
  transform: (_doc, ret) => {
  delete ret.statusPrevious;
  return ret;
  },
});

SellerProfileSchema.pre('validate', function (next) {
  if (!this.slug && this.businessName) {
  this.slug = this.businessName
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');
  }
  next();
});

export const SellerProfile = mongoose.model('SellerProfile', SellerProfileSchema);