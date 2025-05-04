import express from 'express';
import { isAdminMiddleware as isAdmin } from '../middlewares/auth-middleware';
import {
  getAllBanners,
  getActiveBannersByPosition,
  createBanner,
  updateBanner,
  deleteBanner,
  toggleBannerStatus
} from '../controllers/banner-controller';

const router = express.Router();

// Public routes
router.get('/position/:position', getActiveBannersByPosition);

// Admin routes
router.get('/', isAdmin, getAllBanners);
router.post('/', isAdmin, createBanner);
router.patch('/:id', isAdmin, updateBanner);
router.delete('/:id', isAdmin, deleteBanner);
router.patch('/toggle/:id', isAdmin, toggleBannerStatus);

export default router;