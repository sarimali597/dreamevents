import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { roleMiddleware } from '../middleware/role.middleware.js';
import {
  createBookingRequest,
  listBookingRequests,
  getBookingRequest,
  respondToRequest,
  cancelRequest,
} from '../controllers/bookingRequest.controller.js';

const router = Router();

router.post('/', authMiddleware, roleMiddleware('customer'), createBookingRequest);
router.get('/', authMiddleware, listBookingRequests);
router.get('/:id', authMiddleware, getBookingRequest);
router.put('/:id/status', authMiddleware, roleMiddleware('seller'), respondToRequest);
router.post('/:id/cancel', authMiddleware, cancelRequest);

export default router;