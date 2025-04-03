import { Router } from 'express';
import {
  addToFavorites,
  removeFromFavorites,
  getUserFavorites,
  checkIsFavorite,
} from '../controllers/favorite-controller.js';
import { authMiddleware } from '../middlewares/auth-middleware.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Add a news article to favorites
router.post('/', addToFavorites);

// Remove a news article from favorites
router.delete('/:newsId', removeFromFavorites);

// Get all favorite news articles for the logged-in user
router.get('/', getUserFavorites);

// Check if a news article is in user's favorites
router.get('/check/:newsId', checkIsFavorite);

export default router;