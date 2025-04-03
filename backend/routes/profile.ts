import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth-middleware.js';
import {
  getUserProfile,
  updateUserProfile,
  changeUsername,
  changePassword,
  uploadProfilePicture,
  upload
} from '../controllers/profile-controller.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get user profile
router.get('/', getUserProfile);

// Update user profile
router.patch('/update', updateUserProfile);

// Change username
router.patch('/username', changeUsername);

// Change password
router.patch('/password', changePassword);

// Upload profile picture
router.post('/avatar', upload.single('avatar'), uploadProfilePicture);

export default router;