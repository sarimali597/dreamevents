import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { uploadImage } from '../controllers/upload.controller.js';
import { uploadImage as uploadMiddleware } from '../middleware/upload.middleware.js';

const router = Router();

router.post('/', authMiddleware, uploadMiddleware, uploadImage);

export default router;
