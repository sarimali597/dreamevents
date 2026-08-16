import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { rateLimitMiddleware } from '../middleware/rateLimit.middleware.js';
import {
  signup,
  login,
  refresh,
  logout,
  me,
  googleAuth,
} from '../controllers/auth.controller.js';

const router = Router();

router.post('/signup', rateLimitMiddleware, signup);
router.post('/login', rateLimitMiddleware, login);
router.post('/refresh', refresh);
router.post('/google', rateLimitMiddleware, googleAuth);
router.post('/logout', authMiddleware, logout);
router.get('/me', authMiddleware, me);

export default router;