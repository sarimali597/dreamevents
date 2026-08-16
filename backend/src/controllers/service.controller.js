import mongoose from 'mongoose';
import { z } from 'zod';
import { Service } from '../models/Service.js';
import { MenuCategory } from '../models/MenuCategory.js';
import { MenuItem } from '../models/MenuItem.js';
import { Package } from '../models/Package.js';
import { GalleryImage } from '../models/GalleryImage.js';
import { SellerProfile } from '../models/SellerProfile.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const getOwnProfile = async (userId) => {
  const profile = await SellerProfile.findOne({ userId });
  if (!profile) {
  throw new ApiError(404, 'Seller profile not found — complete onboarding first');
  }
  return profile;
};

const getOwnedResource = async (model, id, sellerId) => {
  const doc = await model.findById(id);
  if (!doc || doc.sellerId.toString() !== sellerId.toString()) {
  throw new ApiError(404, 'Resource not found');
  }
  return doc;
};

const serviceSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().max(1000).optional(),
  price: z.number().min(0),
  priceType: z.enum(['fixed', 'per_person', 'per_hour', 'per_day']),
  capacity: z.number().min(0).optional(),
  duration: z.number().min(0).optional(),
  inclusions: z.array(z.string()).default([]),
  category: z.string().min(1),
  sortOrder: z.number().default(0),
});

const menuCategorySchema = z.object({
  name: z.string().min(2).max(50),
  sortOrder: z.number().default(0),
});

const menuItemSchema = z.object({
  menuCategoryId: z.string().min(1),
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  unitPrice: z.number().min(0),
  minQuantity: z.number().min(1).default(1),
  image: z.string().optional(),
});

const packageSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().max(1000).optional(),
  price: z.number().min(0),
  priceType: z.enum(['fixed', 'per_person']).default('fixed'),
  inclusions: z.array(z.string()).default([]),
  servicesIncluded: z.array(z.string()).default([]),
  image: z.string().optional(),
});

const gallerySchema = z.object({
  url: z.string().min(1),
  thumbnailUrl: z.string().min(1),
  category: z.enum(['venue', 'food', 'decoration', 'photos', 'other']).default('other'),
  caption: z.string().max(200).optional(),
  isCover: z.boolean().default(false),
  sortOrder: z.number().default(0),
});

export const createService = asyncHandler(async (req, res) => {
  const profile = await getOwnProfile(req.user._id);
  const data = serviceSchema.parse(req.body);
  const service = await Service.create({ sellerId: profile._id, ...data });
  res.status(201).json(new ApiResponse('Service created', service));
});

export const updateService = asyncHandler(async (req, res) => {
  const profile = await getOwnProfile(req.user._id);
  const data = serviceSchema.partial().parse(req.body);
  const service = await getOwnedResource(Service, String(req.params.id), profile._id);
  Object.assign(service, data);
  await service.save();
  res.json(new ApiResponse('Service updated', service));
});

export const deleteService = asyncHandler(async (req, res) => {
  const profile = await getOwnProfile(req.user._id);
  const service = await getOwnedResource(Service, String(req.params.id), profile._id);
  service.isActive = false;
  await service.save();
  res.json(new ApiResponse('Service removed', { id: service._id }));
});

export const listSellerServices = asyncHandler(async (req, res) => {
  const { sellerId } = req.params;
  const services = await Service.find({ sellerId, isActive: true })
  .sort({ sortOrder: 1, createdAt: 1 })
  .lean();
  res.json(new ApiResponse('Services fetched', services));
});

export const createMenuCategory = asyncHandler(async (req, res) => {
  const profile = await getOwnProfile(req.user._id);
  const data = menuCategorySchema.parse(req.body);
  const mc = await MenuCategory.create({ sellerId: profile._id, ...data });
  res.status(201).json(new ApiResponse('Menu category created', mc));
});

export const updateMenuCategory = asyncHandler(async (req, res) => {
  const profile = await getOwnProfile(req.user._id);
  const data = menuCategorySchema.partial().parse(req.body);
  const mc = await getOwnedResource(MenuCategory, String(req.params.id), profile._id);
  Object.assign(mc, data);
  await mc.save();
  res.json(new ApiResponse('Menu category updated', mc));
});

export const deleteMenuCategory = asyncHandler(async (req, res) => {
  const profile = await getOwnProfile(req.user._id);
  const mc = await getOwnedResource(MenuCategory, String(req.params.id), profile._id);
  mc.isActive = false;
  await mc.save();
  await MenuItem.updateMany({ menuCategoryId: mc._id }, { isActive: false });
  res.json(new ApiResponse('Menu category removed', { id: mc._id }));
});

export const createMenuItem = asyncHandler(async (req, res) => {
  const profile = await getOwnProfile(req.user._id);
  const data = menuItemSchema.parse(req.body);
  const category = await MenuCategory.findOne({
  _id: data.menuCategoryId,
  sellerId: profile._id,
  });
  if (!category) {
  throw new ApiError(404, 'Menu category not found');
  }
  const item = await MenuItem.create({ sellerId: profile._id, ...data });
  res.status(201).json(new ApiResponse('Menu item created', item));
});

export const updateMenuItem = asyncHandler(async (req, res) => {
  const profile = await getOwnProfile(req.user._id);
  const data = menuItemSchema.partial().parse(req.body);
  const item = await getOwnedResource(MenuItem, String(req.params.id), profile._id);
  if (data.menuCategoryId) {
  const category = await MenuCategory.findOne({
  _id: data.menuCategoryId,
  sellerId: profile._id,
  });
  if (!category) {
  throw new ApiError(404, 'Menu category not found');
  }
  }
  Object.assign(item, data);
  await item.save();
  res.json(new ApiResponse('Menu item updated', item));
});

export const deleteMenuItem = asyncHandler(async (req, res) => {
  const profile = await getOwnProfile(req.user._id);
  const item = await getOwnedResource(MenuItem, String(req.params.id), profile._id);
  item.isActive = false;
  await item.save();
  res.json(new ApiResponse('Menu item removed', { id: item._id }));
});

export const listMenu = asyncHandler(async (req, res) => {
  const { sellerId } = req.params;
  const categories = await MenuCategory.find({ sellerId, isActive: true })
  .sort({ sortOrder: 1 })
  .lean();
  const items = await MenuItem.find({ sellerId, isActive: true }).lean();
  const grouped = categories.map((c) => ({
  ...c,
  items: items.filter((i) => i.menuCategoryId.toString() === c._id.toString()),
  }));
  res.json(new ApiResponse('Menu fetched', grouped));
});

export const createPackage = asyncHandler(async (req, res) => {
  const profile = await getOwnProfile(req.user._id);
  const data = packageSchema.parse(req.body);
  const pkg = await Package.create({ sellerId: profile._id, ...data });
  res.status(201).json(new ApiResponse('Package created', pkg));
});

export const updatePackage = asyncHandler(async (req, res) => {
  const profile = await getOwnProfile(req.user._id);
  const data = packageSchema.partial().parse(req.body);
  const pkg = await getOwnedResource(Package, String(req.params.id), profile._id);
  Object.assign(pkg, data);
  await pkg.save();
  res.json(new ApiResponse('Package updated', pkg));
});

export const deletePackage = asyncHandler(async (req, res) => {
  const profile = await getOwnProfile(req.user._id);
  const pkg = await getOwnedResource(Package, String(req.params.id), profile._id);
  pkg.isActive = false;
  await pkg.save();
  res.json(new ApiResponse('Package removed', { id: pkg._id }));
});

export const listSellerPackages = asyncHandler(async (req, res) => {
  const { sellerId } = req.params;
  const packages = await Package.find({ sellerId, isActive: true })
  .sort({ createdAt: -1 })
  .lean();
  res.json(new ApiResponse('Packages fetched', packages));
});

export const addGalleryImage = asyncHandler(async (req, res) => {
  const profile = await getOwnProfile(req.user._id);
  const data = gallerySchema.parse(req.body);
  const image = await GalleryImage.create({ sellerId: profile._id, ...data });
  res.status(201).json(new ApiResponse('Image added to gallery', image));
});

export const deleteGalleryImage = asyncHandler(async (req, res) => {
  const profile = await getOwnProfile(req.user._id);
  const image = await getOwnedResource(GalleryImage, String(req.params.id), profile._id);
  await image.deleteOne();
  res.json(new ApiResponse('Image removed', { id: image._id }));
});

export const listSellerGallery = asyncHandler(async (req, res) => {
  const { sellerId } = req.params;
  const images = await GalleryImage.find({ sellerId })
  .sort({ isCover: -1, sortOrder: 1, createdAt: -1 })
  .lean();
  res.json(new ApiResponse('Gallery fetched', images));
});
