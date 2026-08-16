import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { roleMiddleware } from '../middleware/role.middleware.js';
import {
  confirmDeposit,
  listBookings,
  getBooking,
  listLedgerEntries,
  createLedgerEntry,
} from '../controllers/booking.controller.js';

const router = Router();

router.use(authMiddleware);

router.get('/', listBookings);
router.get('/:id', getBooking);
router.post('/:id/confirm-deposit', roleMiddleware('seller'), confirmDeposit);
router.get('/:bookingRequestId/ledger', listLedgerEntries);
router.post('/:bookingRequestId/ledger', createLedgerEntry);

export default router;