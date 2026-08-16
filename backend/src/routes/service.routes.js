import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { roleMiddleware } from '../middleware/role.middleware.js';
import { rateLimitMiddleware } from '../middleware/rateLimit.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { SellerProfile } from '../models/SellerProfile.js';
import {
  createService,
  updateService,
  deleteService,
  listSellerServices,
  createMenuCategory,
  updateMenuCategory,
  deleteMenuCategory,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  listMenu,
  createPackage,
  updatePackage,
  deletePackage,
  listSellerPackages,
  addGalleryImage,
  deleteGalleryImage,
  listSellerGallery,
} from '../controllers/service.controller.js';

const router = Router();

/**
 * Resolve the authenticated seller's SellerProfile._id and inject it as
 * `req.params.sellerId` so the existing list controllers (which read by
 * sellerId) can be reused for the seller's own dashboard reads.
 */
const asSeller = asyncHandler(async (req, _res, next) => {
  const profile = await SellerProfile.findOne({ userId: req.user._id });
  if (!profile) {
  throw new ApiError(404, 'Seller profile not found — complete onboarding first');
  }
  req.params.sellerId = String(profile._id);
  next();
});

// ── Reads: seller's own data (dashboard) ──
router.get('/services', authMiddleware, roleMiddleware('seller'), asSeller, listSellerServices);
router.get('/packages', authMiddleware, roleMiddleware('seller'), asSeller, listSellerPackages);
router.get('/menu', authMiddleware, roleMiddleware('seller'), asSeller, listMenu);
router.get('/gallery-images', authMiddleware, roleMiddleware('seller'), asSeller, listSellerGallery);

// ── Reads: public storefront (any visitor, by seller id) ──
router.get('/sellers/:sellerId/services', listSellerServices);
router.get('/sellers/:sellerId/packages', listSellerPackages);
router.get('/sellers/:sellerId/menu', listMenu);
router.get('/sellers/:sellerId/gallery', listSellerGallery);

// ── Writes ──
router.post('/services', authMiddleware, roleMiddleware('seller'), rateLimitMiddleware, createService);
router.put('/services/:id', authMiddleware, roleMiddleware('seller'), updateService);
router.delete('/services/:id', authMiddleware, roleMiddleware('seller'), deleteService);

router.post('/menu-categories', authMiddleware, roleMiddleware('seller'), createMenuCategory);
router.put('/menu-categories/:id', authMiddleware, roleMiddleware('seller'), updateMenuCategory);
router.delete('/menu-categories/:id', authMiddleware, roleMiddleware('seller'), deleteMenuCategory);

router.post('/menu-items', authMiddleware, roleMiddleware('seller'), createMenuItem);
router.put('/menu-items/:id', authMiddleware, roleMiddleware('seller'), updateMenuItem);
router.delete('/menu-items/:id', authMiddleware, roleMiddleware('seller'), deleteMenuItem);

router.post('/packages', authMiddleware, roleMiddleware('seller'), createPackage);
router.put('/packages/:id', authMiddleware, roleMiddleware('seller'), updatePackage);
router.delete('/packages/:id', authMiddleware, roleMiddleware('seller'), deletePackage);

router.post('/gallery-images', authMiddleware, roleMiddleware('seller'), rateLimitMiddleware, addGalleryImage);
router.delete('/gallery-images/:id', authMiddleware, roleMiddleware('seller'), deleteGalleryImage);

export default router;
