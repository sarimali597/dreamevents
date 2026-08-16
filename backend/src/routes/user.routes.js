import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { getMe, updateMe } from '../controllers/user.controller.js';

const router = Router();

router.get('/me', authMiddleware, getMe);
router.put('/me', authMiddleware, updateMe);

export default router;