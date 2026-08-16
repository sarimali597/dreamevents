import mongoose, { Schema } from 'mongoose';

const CitySchema = new Schema(
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

export const City = mongoose.model('City', CitySchema);