import mongoose, { Schema } from 'mongoose';

const CategorySchema = new Schema(
  {
  name: { type: String, required: true, trim: true, maxlength: 50 },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String, trim: true, maxlength: 500 },
  icon: { type: String, trim: true },
  /**
  * Cover image for the category tile on the homepage / SEO landing pages.
  * `image` is the canonical field; `imageUrl` is exposed as a virtual alias
  * so existing frontend code reading `imageUrl` keeps working.
  */
  image: { type: String, trim: true },
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
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

CategorySchema.index({ isActive: 1, sortOrder: 1 });

/** Alias so clients can read either `image` or `imageUrl`. */
CategorySchema.virtual('imageUrl')
  .get(function () {
  return this.image;
  })
  .set(function (v) {
  this.image = v;
  });

export const Category = mongoose.model('Category', CategorySchema);