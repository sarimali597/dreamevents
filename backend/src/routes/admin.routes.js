import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { roleMiddleware } from '../middleware/role.middleware.js';
import {
  getAdminStats,
  listAdminSellers,
  getAdminSeller,
  approveSeller,
  rejectSeller,
  suspendSeller,
  listAdminUsers,
  suspendUser,
  listAdminBookings,
  listAdminReports,
  removeReview,
  resolveReport,
  dismissReport,
  listAdminCategories,
  upsertCategory,
  listAdminCities,
  upsertCity,
  setFeaturedSellers,
} from '../controllers/admin.controller.js';

const router = Router();

router.use(authMiddleware, roleMiddleware('admin'));

router.get('/stats', getAdminStats);

router.get('/sellers', listAdminSellers);
router.get('/sellers/:id', getAdminSeller);
router.post('/sellers/:id/approve', approveSeller);
router.post('/sellers/:id/reject', rejectSeller);
router.post('/sellers/:id/suspend', suspendSeller);

router.get('/users', listAdminUsers);
router.post('/users/:id/suspend', suspendUser);

router.get('/bookings', listAdminBookings);

router.get('/moderation', listAdminReports);
router.delete('/reviews/:id', removeReview);
router.post('/reports/:id/resolve', resolveReport);
router.post('/reports/:id/dismiss', dismissReport);

router.get('/categories', listAdminCategories);
router.post('/categories', upsertCategory);
router.get('/cities', listAdminCities);
router.post('/cities', upsertCity);

router.post('/homepage/featured-sellers', setFeaturedSellers);

export default router;