import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { roleMiddleware } from '../middleware/role.middleware.js';
import { runSeed } from '../seed/runner.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// Admin-only seed endpoint — triggers database seeding on the live server
router.post('/seed', authMiddleware, roleMiddleware('admin'), asyncHandler(async (req, res) => {
  const result = await runSeed();
  res.json(new ApiResponse('Seed complete', result));
}));

export default router;
