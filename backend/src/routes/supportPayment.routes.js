import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { listMySupportPayments } from '../controllers/supportPayment.controller.js';

const router = Router();

// Support payments — list only (no payment processing; IBAN is shown on the frontend)
router.get('/mine', authMiddleware, listMySupportPayments);

export default router;
