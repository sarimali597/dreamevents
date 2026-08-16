import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new Schema(
  {
  email: {
  type: String,
  required: [true, 'Email is required'],
  unique: true,
  lowercase: true,
  trim: true,
  match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  index: true,
  },
  password: {
  type: String,
  minlength: [8, 'Password must be at least 8 characters'],
  select: false,
  },
  phone: {
  type: String,
  unique: true,
  sparse: true,
  trim: true,
  index: true,
  },
  phoneVerified: { type: Boolean, default: false },
  role: {
  type: String,
  required: true,
  enum: {
  values: ['customer', 'seller', 'admin'],
  message: 'Role must be customer, seller, or admin',
  },
  index: true,
  },
  name: {
  type: String,
  required: [true, 'Name is required'],
  trim: true,
  maxlength: [100, 'Name cannot exceed 100 characters'],
  },
  avatar: {
  type: String,
  trim: true,
  },
  isEmailVerified: { type: Boolean, default: false },
  googleId: {
  type: String,
  unique: true,
  sparse: true,
  index: true,
  },
  sellerProfileId: {
  type: Schema.Types.ObjectId,
  ref: 'SellerProfile',
  default: null,
  index: true,
  },
  city: {
  type: String,
  trim: true,
  default: 'Sukkur',
  },
  notificationPreferences: {
  email: { type: Boolean, default: true },
  inApp: { type: Boolean, default: true },
  },
  lastLoginAt: Date,
  isDeleted: { type: Boolean, default: false, index: true },
  },
  {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  }
);

UserSchema.index({ role: 1, isDeleted: 1, createdAt: -1 });

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

UserSchema.methods.comparePassword = async function (candidate) {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

UserSchema.virtual('isSeller').get(function () {
  return this.role === 'seller' && !!this.sellerProfileId;
});

export const User = mongoose.model('User', UserSchema);