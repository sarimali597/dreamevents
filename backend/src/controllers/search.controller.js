import { SellerProfile } from '../models/SellerProfile.js';
import { Category } from '../models/Category.js';
import { City } from '../models/City.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const searchSellers = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 12));
  const {
  q,
  category,
  subcategory,
  city,
  area,
  minPrice,
  maxPrice,
  rating,
  sort,
  } = req.query;

  const filter = { status: 'approved', isDeleted: false };

  if (category) filter.category = String(category);
  if (subcategory) filter.subcategories = String(subcategory);
  if (city) filter.city = String(city);
  if (area) filter.area = String(area);

  if (minPrice || maxPrice) {
  filter.startingPrice = {};
  if (minPrice) filter.startingPrice.$gte = Number(minPrice);
  if (maxPrice) filter.startingPrice.$lte = Number(maxPrice);
  }

  if (rating) {
  filter.rating = { $gte: Number(rating) };
  }

  if (q) {
  const term = String(q).trim();
  filter.$or = [
  { businessName: { $regex: term, $options: 'i' } },
  { description: { $regex: term, $options: 'i' } },
  { category: { $regex: term, $options: 'i' } },
  { city: { $regex: term, $options: 'i' } },
  { area: { $regex: term, $options: 'i' } },
  { subcategories: { $regex: term, $options: 'i' } },
  ];
  }

  let sortOptions = { isFeatured: -1, rating: -1, createdAt: -1 };
  if (sort === 'rating') sortOptions = { rating: -1, reviewCount: -1 };
  else if (sort === 'price_asc') sortOptions = { startingPrice: 1 };
  else if (sort === 'price_desc') sortOptions = { startingPrice: -1 };
  else if (sort === 'newest') sortOptions = { createdAt: -1 };

  const total = await SellerProfile.countDocuments(filter);
  const sellers = await SellerProfile.find(filter)
  .sort(sortOptions)
  .skip((page - 1) * limit)
  .limit(limit)
  .lean();

  res.json(
  new ApiResponse('Search results', {
  sellers,
  total,
  page,
  pages: Math.ceil(total / limit) || 1,
  })
  );
});

export const listCategories = asyncHandler(async (_req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ sortOrder: 1 }).lean();
  res.json(new ApiResponse('Categories fetched', categories));
});

export const getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug, isActive: true }).lean();
  if (!category) {
  throw new ApiError(404, 'Category not found');
  }
  res.json(new ApiResponse('Category fetched', category));
});

export const listCities = asyncHandler(async (_req, res) => {
  const cities = await City.find({ isActive: true }).sort({ sortOrder: 1 }).lean();
  res.json(new ApiResponse('Cities fetched', cities));
});

export const getCityBySlug = asyncHandler(async (req, res) => {
  const city = await City.findOne({ slug: req.params.slug, isActive: true }).lean();
  if (!city) {
  throw new ApiError(404, 'City not found');
  }
  res.json(new ApiResponse('City fetched', city));
});