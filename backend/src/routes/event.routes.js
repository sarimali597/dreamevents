import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { roleMiddleware } from '../middleware/role.middleware.js';
import {
  createEvent,
  listMyEvents,
  getEvent,
  updateEvent,
  deleteEvent,
} from '../controllers/event.controller.js';

const router = Router();

router.use(authMiddleware, roleMiddleware('customer'));

router.post('/', createEvent);
router.get('/', listMyEvents);
router.get('/:id', getEvent);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);

export default router;
