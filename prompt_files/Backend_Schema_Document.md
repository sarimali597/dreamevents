# DreamEvents — Backend Schema Document

**Version 1.0 · MongoDB + Mongoose · Companion to PRD, TRD, App Flow, and UI/UX Brief**

---

## How to Read This Document

This document is the **single source of truth for every database collection, field, index, relationship, validation rule, and middleware hook** in the DreamEvents V1 backend. It is written for an AI coding agent generating Mongoose models and Express controllers. Every schema below is production-ready: fields are typed, validated, indexed, and referenced exactly as the business logic in the PRD and App Flow Document requires.

**Companion references:**
- PRD Section 6 (Feature Requirements by Module) defines *what* data exists and why.
- TRD Section 5 (Data Layer) defines *how* we connect and query.
- App Flow Document Section 5 (State Machines) defines the valid transitions that schemas enforce via middleware.
- UI/UX Design Brief Section 2 (Design Tokens) defines the semantic color mappings that status fields drive.

---

## 1. Schema Design Philosophy

### 1.1 One collection per entity
No unbounded embedded arrays. Messages, reviews, availability entries, and gallery images live in their own collections and reference their parent via `ObjectId`. This prevents document growth beyond MongoDB's 16MB limit and keeps queries predictable.

### 1.2 Reference pattern with strategic population
All relationships use `ObjectId` refs with Mongoose `.populate()`. The `ref` string always matches the model name exactly (e.g., `ref: 'SellerProfile'`). Population paths are documented per schema so controllers know what to populate.

### 1.3 Schema validation at the ODM layer
Every field that has business meaning is validated at the Mongoose level (required, enums, min/max, custom validators). This is the first line of defense; Zod validation in controllers is the second.

### 1.4 State transitions in middleware
Status fields (e.g., `bookingRequest.status`, `sellerProfile.status`) have pre-save middleware that validates transitions against the state machines in App Flow Document Section 5. Invalid transitions throw `ValidationError` before the write reaches MongoDB.

### 1.5 Audit fields on every document
Every schema includes:
- `createdAt: Date` (default: `Date.now`, immutable)
- `updatedAt: Date` (default: `Date.now`, auto-updated by `timestamps: true`)

### 1.6 Soft deletes
No document is ever hard-deleted by application code in V1. A `isDeleted: { type: Boolean, default: false }` field exists on user-facing collections, and queries default to `{ isDeleted: false }`. Admin "remove" actions set this flag and log the action.

---

## 2. Collection Overview

| Collection | Purpose | Expected Growth | Key Indexes |
|---|---|---|---|
| `users` | Auth identity + role for all humans | Low (one per person) | `email` unique, `phone` unique, `role` |
| `sellerProfiles` | Public storefront + business data | Medium (hundreds at launch) | `slug` unique, `status` + `category`, `city` + `area`, `businessName` text |
| `categories` | Master list of service categories | Very low (4 in V1) | `slug` unique |
| `cities` | Master list of cities + areas | Very low (1 city in V1) | `slug` unique |
| `services` | Individual services offered by sellers | Medium | `sellerId`, `category` |
| `menuCategories` | Grouping headers for catering menus | Low | `sellerId` |
| `menuItems` | Individual dishes/items with unit pricing | Medium | `sellerId` + `menuCategoryId` |
| `packages` | Bundled service offerings | Low | `sellerId` |
| `galleryImages` | Seller gallery photos | Medium | `sellerId` + `category` |
| `events` | Customer event plans ("My Wedding — Dec 20") | Medium | `userId`, `eventDate` |
| `bookingRequests` | Core negotiation thread header | High | `userId`, `sellerId`, `eventDate`, `status` |
| `estimates` | Structured price quotes | High | `bookingRequestId`, `sellerId`, `status` |
| `bookings` | Confirmed reservations (post-deposit) | Medium | `sellerId` + `eventDate`, `userId`, `status` |
| `availability` | Per-seller per-date calendar grid | High | `sellerId` + `date` compound unique |
| `ledgerEntries` | Shared payment record (not actual money) | Medium | `bookingRequestId`, `sellerId` |
| `messages` | Chat thread per booking request | Very high | `bookingRequestId` + `createdAt` |
| `reviews` | Verified post-event reviews | Medium | `bookingId` unique, `sellerId` + `rating` |
| `favorites` | Saved sellers and posts | Medium | `userId` + `sellerId` compound unique |
| `feedPosts` | Seller inspiration posts | Medium | `sellerId` + `createdAt` |
| `notifications` | In-app notification feed | Very high | `userId` + `read` + `createdAt` |
| `supportPayments` | "Buy Us a Coffee" tip records | Low | `userId`, `safepayOrderId` |
| `adminActivityLogs` | Admin actions for audit trail | Medium | `adminId` + `createdAt` |
| `reports` | User-submitted reports | Low | `status` + `createdAt` |

---

## 3. Core User & Auth Collections

### 3.1 `users`

The single identity table for every human in the system. Role determines route access (see PRD Section 5, TRD Section 4.3).

```js
import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password?: string;  // null for OAuth-only users
  phone?: string;
  phoneVerified: boolean;
  role: 'customer' | 'seller' | 'admin';
  name: string;
  avatar?: string;  // Cloudinary URL
  isEmailVerified: boolean;
  googleId?: string;
  sellerProfileId?: mongoose.Types.ObjectId;  // populated only if role === 'seller'
  city?: string;
  notificationPreferences: {
  email: boolean;
  inApp: boolean;
  };
  lastLoginAt?: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
  email: {
  type: String,
  required: [true, 'Email is required'],
  unique: true,
  lowercase: true,
  trim: true,
  match: [/^\\S+@\\S+\\.\\S+$/, 'Please enter a valid email'],
  index: true,
  },
  password: {
  type: String,
  minlength: [8, 'Password must be at least 8 characters'],
  select: false, // never returned in queries unless explicitly requested
  },
  phone: {
  type: String,
  unique: true,
  sparse: true, // allows null/undefined without violating unique
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

// Compound index for common admin queries
UserSchema.index({ role: 1, isDeleted: 1, createdAt: -1 });

// Password hashing middleware
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Instance method
UserSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

// Virtual: isSeller (convenience for middleware checks)
UserSchema.virtual('isSeller').get(function () {
  return this.role === 'seller' && !!this.sellerProfileId;
});

export const User = mongoose.model<IUser>('User', UserSchema);
```

**Validation rules:**
- Either `password` or `googleId` must be present (enforced in controller, not schema, because both can be null during phone-OTP-only intermediate states).
- `sellerProfileId` is required only when `role === 'seller'` (enforced at application layer in onboarding completion).
- `phone` must be unique if provided, but optional.

**Population paths:**
- `sellerProfileId` → `SellerProfile` (used in auth middleware to attach full seller context to `req.user`).

---

### 3.2 `refreshTokens` (Optional but Recommended)

If you want to support token rotation and revocation (e.g., "log out all devices"), store refresh tokens separately. For V1 simplicity, a hashed refresh token can be stored on the `User` document in a `refreshTokenHash` field, but a separate collection is more robust.

```js
const RefreshTokenSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  tokenHash: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  isRevoked: { type: Boolean, default: false },
  userAgent: String,
  ipAddress: String,
}, { timestamps: true });

RefreshTokenSchema.index({ tokenHash: 1 });
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index
```

For V1, the simpler approach (storing `refreshToken` in an httpOnly cookie and validating JWT signature only) is acceptable. Add this collection only if multi-device logout is a V1 requirement.

---

## 4. Seller & Catalog Collections

### 4.1 `categories`

Master reference table. V1 seeds 4 categories. Built as a collection (not an enum) so Phase 2 adds categories via admin UI, not a code deploy (PRD 3.2, App Flow Section 8).

```js
export interface ICategory extends Document {
  name: string;  // e.g., "Venue"
  slug: string;  // e.g., "venues"
  description?: string;
  icon?: string;  // lucide icon name or custom SVG path
  sortOrder: number;
  isActive: boolean;
  subcategories: Array<{
  name: string;
  slug: string;
  }>;
  filters: Array<{
  key: string;
  label: string;
  type: 'boolean' | 'select' | 'multiselect' | 'number';
  options?: string[];
  }>;
}

const CategorySchema = new Schema<ICategory>(
  {
  name: { type: String, required: true, trim: true, maxlength: 50 },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String, trim: true, maxlength: 500 },
  icon: { type: String, trim: true },
  sortOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  subcategories: [
  {
  name: { type: String, required: true },
  slug: { type: String, required: true },
  },
  ],
  filters: [
  {
  key: { type: String, required: true },
  label: { type: String, required: true },
  type: { type: String, enum: ['boolean', 'select', 'multiselect', 'number'], required: true },
  options: [{ type: String }],
  },
  ],
  },
  { timestamps: true }
);

CategorySchema.index({ isActive: 1, sortOrder: 1 });
```

**V1 seed data:**
| name | slug | subcategories (examples) |
|---|---|---|
| Venue | venues | Marriage Hall, Banquet Hall, Farmhouse, Restaurant Event Space |
| Catering | catering | Full-Service, Home-Chef Scale, Buffet, Plated |
| Photography | photography | Wedding Photographer, Videographer, Drone Operator |
| Decoration | decoration | Floral, Stage, Lighting, Entrance, Theme-Based, Corporate |

---

### 4.2 `cities`

Master reference table. V1 seeds Sukkur. Phase 2 adds cities via admin UI.

```js
export interface ICity extends Document {
  name: string;  // "Sukkur"
  slug: string;  // "sukkur"
  displayName: string; // "Sukkur, Sindh"
  areas: Array<{
  name: string;
  slug: string;
  latitude?: number;
  longitude?: number;
  }>;
  isActive: boolean;
  sortOrder: number;
}

const CitySchema = new Schema<ICity>(
  {
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  displayName: { type: String, required: true, trim: true },
  areas: [
  {
  name: { type: String, required: true },
  slug: { type: String, required: true },
  latitude: Number,
  longitude: Number,
  },
  ],
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

CitySchema.index({ isActive: 1, sortOrder: 1 });
```

**V1 seed data:**
- City: Sukkur
- Areas: Sadar, Military Road, Barrage Colony, Shalimar, Minara Road, New Sukkur, Rohri Road, etc.

---

### 4.3 `sellerProfiles`

The most important document in the catalog. This is the public storefront. Every seller has exactly one `SellerProfile`, created during onboarding and linked to their `User` record via `userId`.

```js
export interface ISellerProfile extends Document {
  userId: mongoose.Types.ObjectId;
  businessName: string;
  slug: string;  // URL-friendly, unique
  category: string;  // ref: Category.slug
  subcategories: string[];  // ref: Category.subcategories[].slug
  city: string;  // ref: City.slug
  area: string;  // ref: City.areas[].slug
  address: string;
  description: string;
  coverImage?: string;  // Cloudinary URL
  logo?: string;  // Cloudinary URL
  contactPhone: string;
  contactEmail?: string;
  whatsappNumber?: string;
  socialLinks: {
  instagram?: string;
  facebook?: string;
  youtube?: string;
  whatsapp?: string;
  };
  startingPrice: number;  // in PKR, lowest service price
  currency: string;  // default "PKR", stored for future multi-currency
  rating: number;  // computed average, 0-5, default 0
  reviewCount: number;  // computed, default 0
  verificationStatus: 'unverified' | 'pending' | 'verified';
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  rejectionReason?: string;
  isFeatured: boolean;
  featuredUntil?: Date;
  businessHours?: {
  day: string;
  open: string;
  close: string;
  isOpen: boolean;
  }[];
  policies: {
  cancellation?: string;
  advancePayment?: string;
  extraCharges?: string;
  };
  location?: {
  type: 'Point';
  coordinates: [number, number];
  };
  verificationDocuments: {
  cnicFront?: string;
  cnicBack?: string;
  businessRegistration?: string;
  submittedAt?: Date;
  };
  onboardingStep: number;
  onboardingCompleted: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SellerProfileSchema = new Schema<ISellerProfile>(
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
  day: { type: String, enum: ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] },
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
  isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

// Geo index for map queries
SellerProfileSchema.index({ location: '2dsphere' });

// Compound indexes for search and filtering
SellerProfileSchema.index({ status: 1, verificationStatus: 1, category: 1, city: 1 });
SellerProfileSchema.index({ status: 1, category: 1, city: 1, area: 1, startingPrice: 1 });
SellerProfileSchema.index({ status: 1, isFeatured: 1, rating: -1, createdAt: -1 });

// Text search index (fallback if Atlas Search is unavailable)
SellerProfileSchema.index(
  { businessName: 'text', description: 'text' },
  { weights: { businessName: 10, description: 3 }, name: 'seller_text_search' }
);

// State machine enforcement (App Flow 5.5)
const validSellerStatusTransitions: Record<string, string[]> = {
  pending: ['approved', 'rejected'],
  approved: ['suspended'],
  rejected: ['pending'],
  suspended: ['approved'],
};

SellerProfileSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status) {
  const prevStatus = this._previousStatus || 'pending';
  const allowed = validSellerStatusTransitions[prevStatus] || [];
  if (!allowed.includes(this.status) && prevStatus !== this.status) {
  return next(new Error(`Invalid seller status transition: ${prevStatus} -> ${this.status}`));
  }
  }
  next();
});

SellerProfileSchema.pre('save', function (next) {
  if (this.isModified('status')) {
  (this)._previousStatus = this.status;
  }
  next();
});

// Auto-generate slug from businessName if not provided
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

export const SellerProfile = mongoose.model<ISellerProfile>('SellerProfile', SellerProfileSchema);
```

**Critical notes:**
- `verificationDocuments` fields point to Cloudinary assets in a **private bucket** (PRD Section 10). The upload middleware must use a different `folder` parameter for these vs. gallery images.
- `slug` must be unique; the controller must handle collisions (e.g., `my-hall-2`).
- `rating` and `reviewCount` are **denormalized** and updated by a post-save hook on `Review` (see Section 6.1).
- `status: 'approved'` AND `verificationStatus: 'verified'` AND `isDeleted: false` are the three gates for appearing in public search.

---

### 4.4 `services`

Individual services offered by a seller.

```js
export interface IService extends Document {
  sellerId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  price: number;
  priceType: 'fixed' | 'per_person' | 'per_hour' | 'per_day';
  capacity?: number;
  duration?: number;
  inclusions: string[];
  category: string;
  isActive: boolean;
  sortOrder: number;
}

const ServiceSchema = new Schema<IService>(
  {
  sellerId: { type: Schema.Types.ObjectId, ref: 'SellerProfile', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, trim: true, maxlength: 1000 },
  price: { type: Number, required: true, min: 0 },
  priceType: {
  type: String,
  required: true,
  enum: ['fixed', 'per_person', 'per_hour', 'per_day'],
  },
  capacity: { type: Number, min: 0 },
  duration: { type: Number, min: 0 },
  inclusions: [{ type: String, trim: true }],
  category: { type: String, required: true, index: true },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ServiceSchema.index({ sellerId: 1, isActive: 1, sortOrder: 1 });
```

---

### 4.5 `menuCategories` & `menuItems`

Catering-specific. A seller has many menu categories; each category has many items.

```js
export interface IMenuCategory extends Document {
  sellerId: mongoose.Types.ObjectId;
  name: string;
  sortOrder: number;
  isActive: boolean;
}

const MenuCategorySchema = new Schema<IMenuCategory>(
  {
  sellerId: { type: Schema.Types.ObjectId, ref: 'SellerProfile', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 50 },
  sortOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

MenuCategorySchema.index({ sellerId: 1, isActive: 1, sortOrder: 1 });

export interface IMenuItem extends Document {
  sellerId: mongoose.Types.ObjectId;
  menuCategoryId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  unitPrice: number;
  minQuantity: number;
  isActive: boolean;
  image?: string;
}

const MenuItemSchema = new Schema<IMenuItem>(
  {
  sellerId: { type: Schema.Types.ObjectId, ref: 'SellerProfile', required: true, index: true },
  menuCategoryId: { type: Schema.Types.ObjectId, ref: 'MenuCategory', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, trim: true, maxlength: 500 },
  unitPrice: { type: Number, required: true, min: 0 },
  minQuantity: { type: Number, required: true, min: 1, default: 1 },
  isActive: { type: Boolean, default: true },
  image: { type: String, trim: true },
  },
  { timestamps: true }
);

MenuItemSchema.index({ sellerId: 1, menuCategoryId: 1, isActive: 1 });
```

---

### 4.6 `packages`

Bundled offerings. V1 supports packages as a seller-managed concept; bundle booking (multi-seller packages) is Roadmap Phase 2.

```js
export interface IPackage extends Document {
  sellerId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  price: number;
  priceType: 'fixed' | 'per_person';
  inclusions: string[];
  servicesIncluded: mongoose.Types.ObjectId[];
  isActive: boolean;
  image?: string;
}

const PackageSchema = new Schema<IPackage>(
  {
  sellerId: { type: Schema.Types.ObjectId, ref: 'SellerProfile', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, trim: true, maxlength: 1000 },
  price: { type: Number, required: true, min: 0 },
  priceType: { type: String, enum: ['fixed', 'per_person'], default: 'fixed' },
  inclusions: [{ type: String, trim: true }],
  servicesIncluded: [{ type: Schema.Types.ObjectId, ref: 'Service' }],
  isActive: { type: Boolean, default: true },
  image: { type: String, trim: true },
  },
  { timestamps: true }
);

PackageSchema.index({ sellerId: 1, isActive: 1 });
```

---

### 4.7 `galleryImages`

Seller gallery photos. Kept in a separate collection to avoid unbounded document growth.

```js
export interface IGalleryImage extends Document {
  sellerId: mongoose.Types.ObjectId;
  url: string;
  thumbnailUrl: string;
  category: 'venue' | 'food' | 'decoration' | 'photos' | 'other';
  caption?: string;
  sortOrder: number;
  isCover: boolean;
  createdAt: Date;
}

const GalleryImageSchema = new Schema<IGalleryImage>(
  {
  sellerId: { type: Schema.Types.ObjectId, ref: 'SellerProfile', required: true, index: true },
  url: { type: String, required: true, trim: true },
  thumbnailUrl: { type: String, required: true, trim: true },
  category: {
  type: String,
  enum: ['venue', 'food', 'decoration', 'photos', 'other'],
  default: 'other',
  index: true,
  },
  caption: { type: String, trim: true, maxlength: 200 },
  sortOrder: { type: Number, default: 0 },
  isCover: { type: Boolean, default: false },
  },
  { timestamps: true }
);

GalleryImageSchema.index({ sellerId: 1, category: 1, sortOrder: 1 });

// Middleware: ensure only one cover per seller
GalleryImageSchema.pre('save', async function (next) {
  if (this.isModified('isCover') && this.isCover) {
  await mongoose.model('GalleryImage').updateMany(
  { sellerId: this.sellerId, _id: { $ne: this._id } },
  { isCover: false }
  );
  }
  next();
});
```

---

## 5. Booking & Transaction Collections

### 5.1 `events` (Customer Event Plans)

A customer creates named event plans to organize their planning. One event can have multiple bookings across different sellers/categories.

```js
export interface IEvent extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  eventType: string;
  eventDate: Date;
  city: string;
  guestCount?: number;
  budget?: number;
  notes?: string;
  status: 'planning' | 'request_sent' | 'negotiating' | 'partially_booked' | 'fully_booked' | 'completed' | 'cancelled';
  linkedBookingIds: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema(
  {
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 120 },
  eventType: {
  type: String,
  required: true,
  enum: ['wedding', 'mehndi', 'engagement', 'birthday', 'corporate', 'family', 'other'],
  },
  eventDate: { type: Date, required: true, index: true },
  city: { type: String, required: true, trim: true, default: 'Sukkur' },
  guestCount: { type: Number, min: 1 },
  budget: { type: Number, min: 0 },
  notes: { type: String, trim: true, maxlength: 2000 },
  status: {
  type: String,
  enum: ['planning', 'request_sent', 'negotiating', 'partially_booked', 'fully_booked', 'completed', 'cancelled'],
  default: 'planning',
  index: true,
  },
  linkedBookingIds: [{ type: Schema.Types.ObjectId, ref: 'BookingRequest' }],
  },
  { timestamps: true }
);

EventSchema.index({ userId: 1, eventDate: -1 });
EventSchema.index({ userId: 1, status: 1 });
```

**Status auto-rollup logic:** This is computed in the controller/service layer, not a schema hook, because it depends on the aggregate status of all linked `BookingRequest` documents.

---

### 5.2 `bookingRequests`

The core negotiation header. Every booking request creates a conversation thread. Status drives the entire booking flow (App Flow Section 5.1).

```js
export interface IBookingRequest extends Document {
  userId: mongoose.Types.ObjectId;
  sellerId: mongoose.Types.ObjectId;
  eventId?: mongoose.Types.ObjectId;
  eventType: string;
  eventDate: Date;
  timeWindow?: string;
  guestCount: number;
  budgetRange?: { min?: number; max?: number };
  specialRequirements?: string;
  message: string;
  status: 'pending' | 'seller_replied' | 'estimate_sent' | 'negotiating' | 'accepted' | 'rejected' | 'expired' | 'cancelled';
  sellerResponse?: string;
  alternativeDate?: Date;
  acceptedAt?: Date;
  depositAmount?: number;
  depositConfirmed: boolean;
  expiresAt?: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BookingRequestSchema = new Schema(
  {
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  sellerId: { type: Schema.Types.ObjectId, ref: 'SellerProfile', required: true, index: true },
  eventId: { type: Schema.Types.ObjectId, ref: 'Event', default: null, index: true },
  eventType: {
  type: String,
  required: true,
  enum: ['wedding', 'mehndi', 'engagement', 'birthday', 'corporate', 'family', 'other'],
  },
  eventDate: { type: Date, required: true, index: true },
  timeWindow: { type: String, trim: true, maxlength: 50 },
  guestCount: { type: Number, required: true, min: 1 },
  budgetRange: {
  min: { type: Number, min: 0 },
  max: { type: Number, min: 0 },
  },
  specialRequirements: { type: String, trim: true, maxlength: 2000 },
  message: { type: String, required: true, trim: true, maxlength: 2000 },
  status: {
  type: String,
  required: true,
  enum: ['pending', 'seller_replied', 'estimate_sent', 'negotiating', 'accepted', 'rejected', 'expired', 'cancelled'],
  default: 'pending',
  index: true,
  },
  sellerResponse: { type: String, trim: true, maxlength: 2000 },
  alternativeDate: Date,
  acceptedAt: Date,
  depositAmount: { type: Number, min: 0 },
  depositConfirmed: { type: Boolean, default: false },
  expiresAt: Date,
  isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

// Critical compound indexes
BookingRequestSchema.index({ sellerId: 1, status: 1, createdAt: -1 });
BookingRequestSchema.index({ userId: 1, status: 1, createdAt: -1 });
BookingRequestSchema.index({ sellerId: 1, eventDate: 1, status: 1 });
BookingRequestSchema.index({ status: 1, expiresAt: 1 });

// State machine enforcement (App Flow 5.1)
const validBookingRequestTransitions: Record<string, string[]> = {
  pending: ['seller_replied', 'estimate_sent', 'rejected', 'cancelled'],
  seller_replied: ['estimate_sent', 'negotiating', 'rejected', 'cancelled'],
  estimate_sent: ['negotiating', 'accepted', 'rejected', 'cancelled'],
  negotiating: ['estimate_sent', 'accepted', 'rejected', 'cancelled'],
  accepted: ['expired', 'cancelled'],
  rejected: [],
  expired: [],
  cancelled: [],
};

BookingRequestSchema.pre('save', function (next) {
  if (this.isModified('status')) {
  const prev = (this)._previousStatus || 'pending';
  const allowed = validBookingRequestTransitions[prev] || [];
  if (prev !== this.status && !allowed.includes(this.status)) {
  return next(new Error(`Invalid booking request transition: ${prev} -> ${this.status}`));
  }
  if (this.status === 'accepted' && !this.acceptedAt) {
  this.acceptedAt = new Date();
  this.expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
  }
  }
  next();
});

BookingRequestSchema.pre('save', function (next) {
  if (this.isModified('status')) {
  (this)._previousStatus = this.status;
  }
  next();
});

export const BookingRequest = mongoose.model('BookingRequest', BookingRequestSchema);
```

**Critical business rule:** A `bookingRequest` with `status: 'accepted'` and `depositConfirmed: false` creates a **Hold** on the seller's calendar. If the seller does not confirm deposit within 48 hours of `acceptedAt`, the cron job expires it (TRD Section 4.5).

---

### 5.3 `estimates`

Structured price quotes. Each estimate is versioned. When a seller sends a revised offer, a new `Estimate` is created and the previous one is marked `superseded`.

```js
export interface IEstimateLineItem {
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface IEstimate extends Document {
  bookingRequestId: mongoose.Types.ObjectId;
  sellerId: mongoose.Types.ObjectId;
  version: number;
  lineItems: IEstimateLineItem[];
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  serviceChargePercent: number;
  serviceChargeAmount: number;
  taxPercent: number;
  taxAmount: number;
  total: number;
  validityDate: Date;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'superseded' | 'expired';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EstimateLineItemSchema = new Schema<IEstimateLineItem>(
  {
  name: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, trim: true, maxlength: 500 },
  quantity: { type: Number, required: true, min: 0 },
  unitPrice: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const EstimateSchema = new Schema<IEstimate>(
  {
  bookingRequestId: { type: Schema.Types.ObjectId, ref: 'BookingRequest', required: true, index: true },
  sellerId: { type: Schema.Types.ObjectId, ref: 'SellerProfile', required: true, index: true },
  version: { type: Number, required: true, min: 1, default: 1 },
  lineItems: { type: [EstimateLineItemSchema], required: true, validate: [(val: any[]) => val.length > 0, 'At least one line item is required'] },
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

// Pre-save: auto-calculate totals from line items (TRD Section 10.1)
EstimateSchema.pre('save', function (next) {
  if (this.isModified('lineItems') || this.isModified('discountPercent') || this.isModified('serviceChargePercent') || this.isModified('taxPercent')) {
  this.subtotal = this.lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  this.discountAmount = (this.subtotal * this.discountPercent) / 100;
  const afterDiscount = this.subtotal - this.discountAmount;
  this.serviceChargeAmount = (afterDiscount * this.serviceChargePercent) / 100;
  this.taxAmount = (afterDiscount * this.taxPercent) / 100;
  this.total = afterDiscount + this.serviceChargeAmount + this.taxAmount;
  this.lineItems.forEach(item => {
  item.total = item.quantity * item.unitPrice;
  });
  }
  next();
});

export const Estimate = mongoose.model<IEstimate>('Estimate', EstimateSchema);
```

---

### 5.4 `bookings`

Created only when the seller confirms deposit receipt. This is the permanent record of a confirmed reservation.

```js
export interface IBooking extends Document {
  bookingRequestId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  sellerId: mongoose.Types.ObjectId;
  eventId?: mongoose.Types.ObjectId;
  eventDate: Date;
  eventType: string;
  guestCount: number;
  estimateId: mongoose.Types.ObjectId;
  totalAmount: number;
  depositAmount: number;
  balanceAmount: number;
  status: 'confirmed' | 'completed' | 'cancelled_by_customer' | 'cancelled_by_seller' | 'disputed';
  depositConfirmedAt: Date;
  completedAt?: Date;
  cancellationReason?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
  bookingRequestId: { type: Schema.Types.ObjectId, ref: 'BookingRequest', required: true, unique: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  sellerId: { type: Schema.Types.ObjectId, ref: 'SellerProfile', required: true, index: true },
  eventId: { type: Schema.Types.ObjectId, ref: 'Event', default: null, index: true },
  eventDate: { type: Date, required: true, index: true },
  eventType: { type: String, required: true },
  guestCount: { type: Number, required: true, min: 1 },
  estimateId: { type: Schema.Types.ObjectId, ref: 'Estimate', required: true },
  totalAmount: { type: Number, required: true, min: 0 },
  depositAmount: { type: Number, required: true, min: 0 },
  balanceAmount: { type: Number, required: true, min: 0 },
  status: {
  type: String,
  enum: ['confirmed', 'completed', 'cancelled_by_customer', 'cancelled_by_seller', 'disputed'],
  default: 'confirmed',
  index: true,
  },
  depositConfirmedAt: { type: Date, required: true },
  completedAt: Date,
  cancellationReason: { type: String, trim: true, maxlength: 1000 },
  isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

BookingSchema.index({ sellerId: 1, eventDate: 1 });
BookingSchema.index({ userId: 1, eventDate: -1 });
BookingSchema.index({ status: 1, eventDate: 1 });

// State machine (App Flow 5.3)
const validBookingTransitions: Record<string, string[]> = {
  confirmed: ['completed', 'cancelled_by_customer', 'cancelled_by_seller', 'disputed'],
  completed: [],
  cancelled_by_customer: [],
  cancelled_by_seller: [],
  disputed: ['completed', 'cancelled_by_customer', 'cancelled_by_seller'],
};

BookingSchema.pre('save', function (next) {
  if (this.isModified('status')) {
  const prev = (this)._previousStatus || 'confirmed';
  const allowed = validBookingTransitions[prev] || [];
  if (prev !== this.status && !allowed.includes(this.status)) {
  return next(new Error(`Invalid booking transition: ${prev} -> ${this.status}`));
  }
  if (this.status === 'completed' && !this.completedAt) {
  this.completedAt = new Date();
  }
  }
  next();
});

BookingSchema.pre('save', function (next) {
  if (this.isModified('status')) {
  (this)._previousStatus = this.status;
  }
  next();
});

export const Booking = mongoose.model<IBooking>('Booking', BookingSchema);
```

**Critical business rule:** `Booking.status: 'completed'` is the **only** gate that allows `Review` creation (PRD 6.6, App Flow Section 7).

---

### 5.5 `availability`

Per-seller, per-date calendar grid. This is the source of truth for whether a seller can be booked on a given date.

```js
export interface IAvailability extends Document {
  sellerId: mongoose.Types.ObjectId;
  date: Date;  // stored as UTC midnight
  status: 'available' | 'pending' | 'booked' | 'blocked';
  bookingRequestId?: mongoose.Types.ObjectId;
  bookingId?: mongoose.Types.ObjectId;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AvailabilitySchema = new Schema<IAvailability>(
  {
  sellerId: { type: Schema.Types.ObjectId, ref: 'SellerProfile', required: true, index: true },
  date: {
  type: Date,
  required: true,
  set: (v: Date) => {
  const d = new Date(v);
  d.setUTCHours(0, 0, 0, 0);
  return d;
  },
  },
  status: {
  type: String,
  enum: ['available', 'pending', 'booked', 'blocked'],
  default: 'available',
  index: true,
  },
  bookingRequestId: { type: Schema.Types.ObjectId, ref: 'BookingRequest', default: null, index: true },
  bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', default: null, index: true },
  note: { type: String, trim: true, maxlength: 200 },
  },
  { timestamps: true }
);

// CRITICAL: compound unique index prevents duplicate date entries per seller
AvailabilitySchema.index({ sellerId: 1, date: 1 }, { unique: true });
AvailabilitySchema.index({ sellerId: 1, date: 1, status: 1 });

// State machine (App Flow 5.4)
const validAvailabilityTransitions: Record<string, string[]> = {
  available: ['pending', 'blocked'],
  pending: ['booked', 'available'],
  booked: ['available'],
  blocked: ['available'],
};

AvailabilitySchema.pre('save', function (next) {
  if (this.isModified('status')) {
  const prev = (this)._previousStatus || 'available';
  const allowed = validAvailabilityTransitions[prev] || [];
  if (prev !== this.status && !allowed.includes(this.status)) {
  return next(new Error(`Invalid availability transition: ${prev} -> ${this.status}`));
  }
  }
  next();
});

AvailabilitySchema.pre('save', function (next) {
  if (this.isModified('status')) {
  (this)._previousStatus = this.status;
  }
  next();
});

export const Availability = mongoose.model<IAvailability>('Availability', AvailabilitySchema);
```

**Critical notes:**
- `date` is always stored as UTC midnight to ensure consistent querying regardless of timezone.
- The `sellerId + date` unique constraint prevents race conditions where two requests book the same date.
- When a `BookingRequest` is accepted, the controller creates/updates the `Availability` document with `status: 'pending'` and `bookingRequestId`.
- When the seller confirms deposit, the controller updates it to `status: 'booked'` and sets `bookingId`.
- The 48-hour expiry cron job (TRD Section 4.5) reverts `pending` back to `available` if `depositConfirmed` is false.

---

### 5.6 `ledgerEntries`

Shared payment record. Not a financial ledger in the accounting sense — just a lightweight mutual record of what was agreed and paid outside the platform (PRD 6.5, TRD Section 11.1).

```js
export interface ILedgerEntry extends Document {
  bookingRequestId: mongoose.Types.ObjectId;
  bookingId?: mongoose.Types.ObjectId;
  type: 'deposit_sent' | 'deposit_received' | 'balance_sent' | 'balance_received' | 'refund';
  amount: number;
  currency: string;
  method?: string;
  reference?: string;
  recordedBy: mongoose.Types.ObjectId;
  notes?: string;
  createdAt: Date;
}

const LedgerEntrySchema = new Schema<ILedgerEntry>(
  {
  bookingRequestId: { type: Schema.Types.ObjectId, ref: 'BookingRequest', required: true, index: true },
  bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', default: null, index: true },
  type: {
  type: String,
  required: true,
  enum: ['deposit_sent', 'deposit_received', 'balance_sent', 'balance_received', 'refund'],
  index: true,
  },
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'PKR' },
  method: { type: String, trim: true, maxlength: 50 },
  reference: { type: String, trim: true, maxlength: 200 },
  recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  notes: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

LedgerEntrySchema.index({ bookingRequestId: 1, createdAt: -1 });
LedgerEntrySchema.index({ bookingId: 1, createdAt: -1 });
```

**Business rule:** Either party can record a ledger entry. The system does not verify the payment actually occurred — it is a shared record of trust. The **seller** marking `deposit_received` is the action that triggers `Booking` creation (via the controller, not a schema hook, because it requires a MongoDB transaction across `BookingRequest`, `Booking`, `Availability`, and `LedgerEntry` — see TRD Section 11.1).

---

# Part 3: Engagement Collections
part3 = """
## 6. Engagement Collections

### 6.1 `reviews`

Verified reviews only. A review can only be created against a `completed` booking (PRD 6.6).

```js
export interface IReview extends Document {
  bookingId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  sellerId: mongoose.Types.ObjectId;
  overallRating: number;
  subRatings: {
  serviceQuality: number;
  priceFairness: number;
  communication: number;
  timeliness: number;
  };
  text: string;
  photos?: string[];
  sellerReply?: {
  text: string;
  repliedAt: Date;
  };
  isFlagged: boolean;
  flagReason?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
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

// CRITICAL: pre-save hook enforces "completed booking only" rule
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

// Post-save: update denormalized rating on SellerProfile
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

export const Review = mongoose.model<IReview>('Review', ReviewSchema);
```

---

### 6.2 `messages`

Chat messages within a booking request thread. Supports text, image attachments, and structured cards (estimates, booking summaries).

```js
export interface IMessage extends Document {
  bookingRequestId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  senderRole: 'customer' | 'seller' | 'system';
  type: 'text' | 'image' | 'estimate' | 'booking_summary' | 'system_notification';
  content: string;
  imageUrl?: string;
  metadata?: {
  estimateId?: string;
  bookingRequestId?: string;
  actionType?: 'accept' | 'reject' | 'request_changes';
  };
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
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

export const Message = mongoose.model<IMessage>('Message', MessageSchema);
```

**Structured cards:** When `type: 'estimate'`, `content` contains a JSON string representing the estimate summary. The frontend parses this and renders the structured card UI (PRD 6.3, UI/UX Brief Section 5). The `metadata.estimateId` links to the actual `Estimate` document for the Accept/Reject actions.

---

### 6.3 `favorites`

Saved sellers and feed posts. Flat list in V1 (multi-board collections are Roadmap).

```js
export interface IFavorite extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'seller' | 'feedPost';
  sellerId?: mongoose.Types.ObjectId;
  feedPostId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const FavoriteSchema = new Schema<IFavorite>(
  {
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['seller', 'feedPost'], required: true },
  sellerId: { type: Schema.Types.ObjectId, ref: 'SellerProfile', default: null, index: true },
  feedPostId: { type: Schema.Types.ObjectId, ref: 'FeedPost', default: null, index: true },
  },
  { timestamps: true }
);

// Prevent duplicate favorites
FavoriteSchema.index({ userId: 1, type: 1, sellerId: 1 }, { unique: true, sparse: true });
FavoriteSchema.index({ userId: 1, type: 1, feedPostId: 1 }, { unique: true, sparse: true });

export const Favorite = mongoose.model<IFavorite>('Favorite', FavoriteSchema);
```

---

### 6.4 `feedPosts`

Seller inspiration posts. Appear on the inspiration feed and seller profiles.

```js
export interface IFeedPost extends Document {
  sellerId: mongoose.Types.ObjectId;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  caption: string;
  taggedServiceId?: mongoose.Types.ObjectId;
  likesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

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
```

---

### 6.5 `notifications`

In-app notification feed. Every state transition that matters to a human writes here (PRD 6.7).

```js
export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: string;
  title: string;
  body: string;
  link?: string;  // frontend route to navigate to
  metadata?: Record<string, any>;
  isRead: boolean;
  readAt?: Date;
  isEmailSent: boolean;
  emailSentAt?: Date;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
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

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
```

---

## 7. Platform & Admin Collections

### 7.1 `supportPayments`

"Buy Us a Coffee" tip records. Completely decoupled from the booking flow (PRD 6.5, TRD Section 11.2).

```js
export interface ISupportPayment extends Document {
  userId?: mongoose.Types.ObjectId;  // optional — tips can be anonymous
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  safepayOrderId?: string;
  message?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const SupportPaymentSchema = new Schema(
  {
  userId: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'PKR' },
  status: {
  type: String,
  enum: ['pending', 'completed', 'failed'],
  default: 'pending',
  index: true,
  },
  safepayOrderId: { type: String, trim: true, index: true },
  message: { type: String, trim: true, maxlength: 500 },
  metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const SupportPayment = mongoose.model('SupportPayment', SupportPaymentSchema);
```

---

### 7.2 `adminActivityLogs`

Audit trail for all admin actions. Required for compliance and dispute resolution.

```js
export interface IAdminActivityLog extends Document {
  adminId: mongoose.Types.ObjectId;
  action: string;
  targetType: 'seller' | 'user' | 'review' | 'booking' | 'category' | 'city' | 'report' | 'homepage';
  targetId?: mongoose.Types.ObjectId;
  previousValue?: Record<string, any>;
  newValue?: Record<string, any>;
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const AdminActivityLogSchema = new Schema<IAdminActivityLog>(
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

export const AdminActivityLog = mongoose.model<IAdminActivityLog>('AdminActivityLog', AdminActivityLogSchema);
```

---

### 7.3 `reports`

User-submitted reports (fake seller, inappropriate content, review disputes).

```js
export interface IReport extends Document {
  reporterId: mongoose.Types.ObjectId;
  targetType: 'seller' | 'review' | 'feedPost' | 'message';
  targetId: mongoose.Types.ObjectId;
  reason: string;
  description?: string;
  status: 'open' | 'under_review' | 'resolved' | 'dismissed';
  adminId?: mongoose.Types.ObjectId;
  resolution?: string;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

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
```

---

# Part 4: Indexes, Atlas Search, Data Integrity, Security, Seeding
part4 = """
## 8. Indexes & Query Optimization

### 8.1 Index strategy summary

Every collection in Section 2 lists its key indexes. Below is the rationale for the most critical compound indexes.

| Index | Collection | Query it serves |
|---|---|---|
| `{ sellerId: 1, date: 1 }` unique | `availability` | Prevents double-booking race conditions; enforces one record per seller per date |
| `{ sellerId: 1, status: 1, createdAt: -1 }` | `bookingRequests` | Seller inbox: "show me my pending requests, newest first" |
| `{ userId: 1, status: 1, createdAt: -1 }` | `bookingRequests` | Customer dashboard: "show my open requests" |
| `{ status: 1, expiresAt: 1 }` | `bookingRequests` | Cron job: "find accepted requests whose hold expired" |
| `{ bookingRequestId: 1, version: -1 }` | `estimates` | "Get the latest estimate for this request" |
| `{ sellerId: 1, eventDate: 1 }` | `bookings` | Seller calendar: "show my confirmed bookings for this month" |
| `{ status: 1, eventDate: 1 }` | `bookings` | Cron job: "mark past confirmed bookings as completed" |
| `{ userId: 1, isRead: 1, createdAt: -1 }` | `notifications` | Notification bell: "my unread notifications, newest first" |
| `{ userId: 1, type: 1, sellerId: 1 }` unique sparse | `favorites` | Prevents duplicate seller saves |

### 8.2 Query patterns to avoid

1. **No unbounded `find()` without pagination.** Every list endpoint must use `{ skip: N, limit: M }` or cursor-based pagination.
2. **No `$where` or JavaScript execution in queries.** Use standard query operators only.
3. **No sorting on unindexed fields at scale.** The indexes above cover all V1 sort patterns.
4. **No `$text` search without a text index.** The `seller_text_search` index on `SellerProfile` covers the fallback case if Atlas Search is unavailable.

### 8.3 Index monitoring

After launch, use MongoDB Atlas's **Query Profiler** and **Index Suggestions** to identify slow queries. The M0 free tier has limited performance diagnostics, so add `explain("executionStats")` to suspicious queries during development.

---

## 9. Atlas Search Configuration

### 9.1 Search index definition

Create this index in the MongoDB Atlas UI (Cluster → Search → Create Index). Name it `seller_search`.

```json
{
  "mappings": {
  "dynamic": false,
  "fields": {
  "businessName": {
  "type": "string",
  "analyzer": "standard",
  "foldDiacritics": true
  },
  "description": {
  "type": "string",
  "analyzer": "standard"
  },
  "category": {
  "type": "string",
  "facet": true
  },
  "subcategories": {
  "type": "string",
  "facet": true
  },
  "city": {
  "type": "string",
  "facet": true
  },
  "area": {
  "type": "string"
  },
  "startingPrice": {
  "type": "number"
  },
  "rating": {
  "type": "number"
  },
  "verificationStatus": {
  "type": "string",
  "facet": true
  },
  "status": {
  "type": "string",
  "facet": true
  }
  }
  }
}
```

### 9.2 Search aggregation pipeline

The `search.controller.js` uses this pattern (TRD Section 6.1):

```js
const pipeline: any[] = [];

if (q) {
  pipeline.push({
  $search: {
  index: 'seller_search',
  text: {
  query: q,
  path: ['businessName', 'description'],
  fuzzy: { maxEdits: 1, prefixLength: 3 }
  }
  }
  });
}

pipeline.push({ $match: { status: 'approved', verificationStatus: 'verified' } });
// ... additional filters and sort stages
```

### 9.3 Fallback strategy

If Atlas Search returns an error (e.g., index not ready, M0 limit hit), fall back to the text index:

```js
// Fallback: use MongoDB text index
const fallbackQuery = {
  $text: { $search: q },
  status: 'approved',
  verificationStatus: 'verified',
};
const results = await SellerProfile.find(fallbackQuery)
  .select({ score: { $meta: 'textScore' } })
  .sort({ score: { $meta: 'textScore' } })
  .limit(20);
```

---

## 10. Data Integrity & Validation Rules

### 10.1 Cross-collection consistency checks

These are **not** enforced by MongoDB (which has no foreign keys), but are validated by application logic:

| Rule | Enforcement location |
|---|---|
| A `User` with `role: 'seller'` must have exactly one `SellerProfile` | Onboarding completion controller |
| A `BookingRequest` must reference a `SellerProfile` with `status: 'approved'` | `bookingRequest.controller.js` before create |
| A `BookingRequest` date must not conflict with `availability.status: 'booked'` | `availability.controller.js` lookup before create |
| An `Estimate` must reference a `BookingRequest` with `status` in `['pending', 'seller_replied', 'estimate_sent', 'negotiating']` | `estimate.controller.js` before create |
| A `Review` must reference a `Booking` with `status: 'completed'` | `Review` schema pre-save hook (Section 6.1) |
| A `Message` must reference a `BookingRequest` that exists and is not `expired` | `message.controller.js` before create |
| `SellerProfile.slug` must be unique across all sellers | Schema unique index + controller collision handling |

### 10.2 Cascading behavior

MongoDB does not support cascading deletes. Implement these in the service layer:

| Parent deleted | Child action |
|---|---|
| `User` soft-deleted | Soft-delete linked `SellerProfile` (if role=seller); anonymize `Review.text` to "[deleted]" |
| `SellerProfile` soft-deleted | Set all `Service.isActive = false`; set `FeedPost` visibility to hidden |
| `BookingRequest` cancelled/expired | Release `Availability` hold; mark linked `Estimate` as `expired` |
| `Booking` cancelled | Revert `Availability` to `available`; prevent new `Review` creation |

### 10.3 Required vs. optional fields

Every schema in this document marks `required: true` explicitly. Fields without `required` are optional. The controller-level Zod schemas should mirror these requirements exactly.

---

## 11. Security & Privacy

### 11.1 Sensitive data storage

| Data | Storage | Access control |
|---|---|---|
| Passwords | `users.password` (bcrypt hash, `select: false`) | Never returned in API responses |
| CNIC images | `sellerProfiles.verificationDocuments.*` (Cloudinary private folder) | Admin-only; signed URLs with short expiry |
| Business registration | Same as above | Admin-only |
| Phone numbers | `users.phone` | Returned only to authenticated owner or admin |
| Email addresses | `users.email` | Public only on seller profiles (contactEmail); customer emails never exposed |
| JWT secrets | `backend/.env` only | Never in frontend, never in logs |
| Refresh tokens | httpOnly cookie | Never in localStorage or client JS |
| Chat messages | `messages.content` | Only participants of the booking request + admin |
| Ledger entries | `ledgerEntries` | Only participants of the booking request + admin |

### 11.2 Cloudinary folder structure

```
dreamevents/
├── public/
│  ├── sellers/{sellerId}/gallery/{imageId}
│  ├── sellers/{sellerId}/logo
│  ├── sellers/{sellerId}/cover
│  ├── sellers/{sellerId}/feed/{postId}
│  ├── reviews/{reviewId}
│  └── users/{userId}/avatar
├── private/
│  └── verification/{sellerId}/
│  ├── cnic-front
│  ├── cnic-back
│  └── business-registration
```

Private folder assets require **signed URLs** generated by the backend with a short expiry (e.g., 5 minutes). The upload middleware routes verification documents to the private folder automatically based on the upload endpoint.

### 11.3 NoSQL injection prevention

- Use `express-mongo-sanitize` middleware (TRD Section 14) to strip `$` and `.` from user input.
- Never construct queries with string concatenation: **always** use parameterized queries or Mongoose's query builder.
- Example of safe query: `User.findOne({ email: req.body.email })` — Mongoose handles sanitization.
- Example of unsafe query (never do this): `User.findOne({ $where: \`this.email === '${req.body.email}'\` })`.

---

## 12. Seeding Strategy

### 12.1 Seed files location

`backend/src/seeds/` — one file per collection, run in order via a master seed script.

### 12.2 Seed order (dependencies)

1. `categories.seed.js` — no dependencies
2. `cities.seed.js` — no dependencies
3. `admin.seed.js` — creates the first admin `User` (from env vars `ADMIN_EMAIL`, `ADMIN_PASSWORD`)
4. `sellers.seed.js` — depends on `categories`, `cities`; creates demo sellers with full profiles
5. `services.seed.js` — depends on `sellers`
6. `menuCategories.seed.js` — depends on catering sellers
7. `menuItems.seed.js` — depends on `menuCategories`
8. `packages.seed.js` — depends on `sellers`, `services`
9. `galleryImages.seed.js` — depends on `sellers`
10. `feedPosts.seed.js` — depends on `sellers`, `services`

### 12.3 Demo data guidelines

- Create **8-12 realistic demo sellers** across all 4 categories in Sukkur.
- Use real Pakistani business names (e.g., "Al-Noor Marriage Hall", "Sukkur Catering Services").
- Upload demo images to Cloudinary as part of the seed script (use Cloudinary upload API with local image files or remote URLs).
- Create **1-2 demo bookings** in `completed` status with linked `Review` documents so the homepage "testimonials" section has real data.
- The admin account should be pre-created so the first deployment has an admin ready to approve real seller applications.

### 12.4 Idempotent seeds

Every seed script must be idempotent: running it twice should not create duplicates. Use `findOneAndUpdate` with `upsert: true` or check existence before creation.

```js
// Example idempotent seed pattern
const seedCategories = async () => {
  const categories = [
  { name: 'Venue', slug: 'venues', ... },
  // ...
  ];
  for (const cat of categories) {
  await Category.findOneAndUpdate({ slug: cat.slug }, cat, { upsert: true });
  }
};
```

### 12.5 Production seed guard

The seed script must check `NODE_ENV` and refuse to run in production unless explicitly forced with a `--force` flag. In production, only the `categories` and `cities` seeds should run (and only if the collections are empty).

---

## 13. Schema Versioning & Migrations

### 13.1 No formal migration tool in V1

Mongoose's flexible schema means most "migrations" are additive (new fields with defaults). For V1, handle schema changes with:

1. **Additive changes:** Add the field with a `default` value. Existing documents get the default on next read/write.
2. **Destructive changes:** Rare in V1. If needed, write a one-off Node script in `backend/src/scripts/` that updates documents in batches.
3. **Index changes:** Create new indexes in Atlas UI or via `createIndexes()` in a script. MongoDB builds indexes in the background on M0 (with performance impact — do this during low traffic).

### 13.2 Future-proofing for Phase 2

The following fields are intentionally included in V1 schemas to avoid migration pain later:

- `users.city` — currently defaults to "Sukkur", supports multi-city later.
- `sellerProfiles.currency` — currently defaults to "PKR", supports multi-currency later.
- `categories.filters` — supports future category-specific filter UI without schema changes.
- `sellerProfiles.location` — 2dsphere index ready for geo features in Phase 2.
- `events.linkedBookingIds` — array ready for multi-seller event plans in Phase 2.

---

## 14. Complete Model Export Map

For the main `models/index.js` barrel export:

```js
export { User } from './User';
export { SellerProfile } from './SellerProfile';
export { Category } from './Category';
export { City } from './City';
export { Service } from './Service';
export { MenuCategory } from './MenuCategory';
export { MenuItem } from './MenuItem';
export { Package } from './Package';
export { GalleryImage } from './GalleryImage';
export { Event } from './Event';
export { BookingRequest } from './BookingRequest';
export { Estimate } from './Estimate';
export { Booking } from './Booking';
export { Availability } from './Availability';
export { LedgerEntry } from './LedgerEntry';
export { Message } from './Message';
export { Review } from './Review';
export { Favorite } from './Favorite';
export { FeedPost } from './FeedPost';
export { Notification } from './Notification';
export { SupportPayment } from './SupportPayment';
export { AdminActivityLog } from './AdminActivityLog';
export { Report } from './Report';
```

---

## 15. Document Change Log

| Version | Date | Changes |
|---|---|---|
| 1.0 | 2026-08-16 | Initial release. 22 collections defined with full Mongoose schemas, indexes, middleware, and state machines. Aligned with PRD v1.0, TRD v1.0, App Flow v1.0, UI/UX Brief v1.0. |

---

*End of Backend Schema Document*
