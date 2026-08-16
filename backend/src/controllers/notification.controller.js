import { Notification } from '../models/Notification.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listNotifications = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));

  const filter = { userId: req.user._id };

  const [total, unreadCount, notifications] = await Promise.all([
  Notification.countDocuments(filter),
  Notification.countDocuments({ ...filter, isRead: false }),
  Notification.find(filter)
  .sort({ createdAt: -1 })
  .skip((page - 1) * limit)
  .limit(limit)
  .lean(),
  ]);

  res.json(
  new ApiResponse('Notifications fetched', {
  notifications,
  unreadCount,
  total,
  page,
  pages: Math.ceil(total / limit) || 1,
  })
  );
});

export const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
  { _id: req.params.id, userId: req.user._id },
  { isRead: true, readAt: new Date() },
  { new: true }
  );

  if (!notification) {
  return res.status(404).json(new ApiResponse('Notification not found', null));
  }

  res.json(new ApiResponse('Notification marked as read', notification));
});

export const markAllNotificationsRead = asyncHandler(async (req, res) => {
  const result = await Notification.updateMany(
  { userId: req.user._id, isRead: false },
  { $set: { isRead: true, readAt: new Date() } }
  );

  res.json(new ApiResponse('All notifications marked as read', { updated: result.modifiedCount }));
});