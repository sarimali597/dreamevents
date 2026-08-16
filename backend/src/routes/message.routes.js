import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import {
  listThreadMessages,
  sendMessage,
  listConversations,
} from '../controllers/message.controller.js';
import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../controllers/notification.controller.js';

const messageRouter = Router();
const notificationRouter = Router();

messageRouter.use(authMiddleware);
messageRouter.get('/conversations', listConversations);
messageRouter.get('/:bookingRequestId', listThreadMessages);
messageRouter.post('/', sendMessage);

notificationRouter.use(authMiddleware);
notificationRouter.get('/', listNotifications);
notificationRouter.put('/:id/read', markNotificationRead);
notificationRouter.put('/read-all', markAllNotificationsRead);

export { messageRouter, notificationRouter };