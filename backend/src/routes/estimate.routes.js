import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { roleMiddleware } from '../middleware/role.middleware.js';
import {
  createEstimate,
  listEstimates,
  acceptEstimate,
  rejectEstimate,
} from '../controllers/estimate.controller.js';

const router = Router();

router.post('/', authMiddleware, roleMiddleware('seller'), createEstimate);
router.get('/', authMiddleware, listEstimates);
router.post('/:id/accept', authMiddleware, roleMiddleware('customer'), acceptEstimate);
router.post('/:id/reject', authMiddleware, roleMiddleware('customer'), rejectEstimate);

export default router;