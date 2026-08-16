import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { roleMiddleware } from '../middleware/role.middleware.js';
import {
  createSellerProfile,
  updateSellerProfile,
  advanceOnboardingStep,
  listPublicSellers,
  getPublicSellerProfile,
  getSellerDashboard,
} from '../controllers/seller.controller.js';
import {
  listSellerServices,
  listMenu,
  listSellerPackages,
  listSellerGallery,
} from '../controllers/service.controller.js';

const router = Router();

router.get('/', listPublicSellers);
router.get('/dashboard', authMiddleware, roleMiddleware('seller'), getSellerDashboard);
router.get('/:slug', getPublicSellerProfile);

router.post('/', authMiddleware, roleMiddleware('seller'), createSellerProfile);
router.put('/:id', authMiddleware, roleMiddleware('seller'), updateSellerProfile);
router.post('/onboarding/step', authMiddleware, roleMiddleware('seller'), advanceOnboardingStep);

router.get('/:sellerId/services', listSellerServices);
router.get('/:sellerId/menu', listMenu);
router.get('/:sellerId/packages', listSellerPackages);
router.get('/:sellerId/gallery', listSellerGallery);

export default router;