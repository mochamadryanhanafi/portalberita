import { Router } from 'express';
import {
  getCommentsByNewsId,
  createComment,
  updateComment,
  deleteComment,
} from '../controllers/comment-controller.js';
import { authMiddleware } from '../middlewares/auth-middleware.js';

const router = Router();

// Get all comments for a news article
router.get('/news/:newsId', getCommentsByNewsId);

// Create a new comment (requires authentication)
router.post('/', authMiddleware, createComment);

// Update a comment (requires authentication)
router.patch('/:id', authMiddleware, updateComment);

// Delete a comment (requires authentication)
router.delete('/:id', authMiddleware, deleteComment);

export default router;