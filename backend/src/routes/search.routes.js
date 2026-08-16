import { Router } from 'express';
import {
  searchSellers,
  listCategories,
  getCategoryBySlug,
  listCities,
  getCityBySlug,
} from '../controllers/search.controller.js';

const router = Router();

router.get('/', searchSellers);
router.get('/categories', listCategories);
router.get('/categories/:slug', getCategoryBySlug);
router.get('/cities', listCities);
router.get('/cities/:slug', getCityBySlug);

export default router;