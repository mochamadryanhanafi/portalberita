import { Router } from 'express';
import {
  fetchNewsFromAPI,
  getAllNews,
  getNewsByCategory,
  getFeaturedNews,
  getLatestNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
  searchNews,
} from '../controllers/news-controller.js';
import { authMiddleware, isAdminMiddleware } from '../middlewares/auth-middleware.js';

const router = Router();

// Public routes
router.get('/', getAllNews);
router.get('/category/:category', getNewsByCategory);
router.get('/featured', getFeaturedNews);
router.get('/latest', getLatestNews);
router.get('/search', searchNews);
router.get('/:id', getNewsById);

// Admin routes
router.post('/fetch-from-api', authMiddleware, isAdminMiddleware, fetchNewsFromAPI);
router.post('/', authMiddleware, isAdminMiddleware, createNews);
router.patch('/:id', authMiddleware, isAdminMiddleware, updateNews);
router.delete('/:id', authMiddleware, isAdminMiddleware, deleteNews);

export default router;