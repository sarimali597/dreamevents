import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { roleMiddleware } from '../middleware/role.middleware.js';
import {
  createReview,
  listSellerReviews,
  replyToReview,
  flagReview,
  listMyReviews,
} from '../controllers/review.controller.js';
import {
  createFavorite,
  listFavorites,
  removeFavorite,
  checkFavorite,
} from '../controllers/favorite.controller.js';
import {
  listFeedPosts,
  createFeedPost,
  deleteFeedPost,
} from '../controllers/feedPost.controller.js';

const reviewRouter = Router();
const favoriteRouter = Router();
const feedPostRouter = Router();

reviewRouter.get('/', listSellerReviews);
reviewRouter.post('/', authMiddleware, roleMiddleware('customer'), createReview);
reviewRouter.get('/mine', authMiddleware, listMyReviews);
reviewRouter.post('/:id/reply', authMiddleware, roleMiddleware('seller'), replyToReview);
reviewRouter.post('/:id/flag', authMiddleware, flagReview);

favoriteRouter.use(authMiddleware);
favoriteRouter.get('/', listFavorites);
favoriteRouter.post('/', createFavorite);
favoriteRouter.get('/check', checkFavorite);
favoriteRouter.delete('/:id', removeFavorite);

feedPostRouter.get('/', listFeedPosts);
feedPostRouter.post('/', authMiddleware, roleMiddleware('seller'), createFeedPost);
feedPostRouter.delete('/:id', authMiddleware, roleMiddleware('seller'), deleteFeedPost);

export { reviewRouter, favoriteRouter, feedPostRouter };