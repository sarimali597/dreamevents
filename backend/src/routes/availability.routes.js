import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { roleMiddleware } from '../middleware/role.middleware.js';
import {
  getSellerCalendar,
  updateSellerCalendar,
} from '../controllers/availability.controller.js';

const router = Router();

router.get('/:sellerId', getSellerCalendar);
router.post('/:sellerId', authMiddleware, roleMiddleware('seller'), updateSellerCalendar);

export default router;