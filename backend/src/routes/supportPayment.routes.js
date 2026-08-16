import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import {
  createCoffeeSession,
  handleSafepayWebhook,
  listMySupportPayments,
} from '../controllers/supportPayment.controller.js';

const router = Router();

router.post('/checkout', createCoffeeSession);
router.post('/webhook', handleSafepayWebhook);
router.get('/mine', authMiddleware, listMySupportPayments);

export default router;