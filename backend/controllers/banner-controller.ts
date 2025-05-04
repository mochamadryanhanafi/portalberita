import { Request, Response } from 'express';
import Banner, { IBanner } from '../models/banner';
import { asyncHandler } from '../utils/async-handler';
import { ApiResponse } from '../utils/api-response';
import { ApiError } from '../utils/api-error';

// Get all banners
export const getAllBanners = asyncHandler(async (req: Request, res: Response) => {
  const banners = await Banner.find({}).sort({ createdAt: -1 });
  return res.status(200).json(
    new ApiResponse(200, banners, 'Banners fetched successfully')
  );
});

// Get active banners by position
export const getActiveBannersByPosition = asyncHandler(async (req: Request, res: Response) => {
  const { position } = req.params;
  
  const banners = await Banner.find({ position, isActive: true }).sort({ createdAt: -1 });
  
  return res.status(200).json(
    new ApiResponse(200, banners, `Active banners for position ${position} fetched successfully`)
  );
});

// Create a new banner
export const createBanner = asyncHandler(async (req: Request, res: Response) => {
  const { imageUrl, targetUrl, position, isActive } = req.body;

  if (!imageUrl || !targetUrl || !position) {
    throw new ApiError(400, 'All fields are required');
  }

  const banner = await Banner.create({
    imageUrl,
    targetUrl,
    position,
    isActive: isActive !== undefined ? isActive : true
  });

  return res.status(201).json(
    new ApiResponse(201, banner, 'Banner created successfully')
  );
});

// Update a banner
export const updateBanner = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { imageUrl, targetUrl, position, isActive } = req.body;

  const banner = await Banner.findById(id);

  if (!banner) {
    throw new ApiError(404, 'Banner not found');
  }

  if (imageUrl) banner.imageUrl = imageUrl;
  if (targetUrl) banner.targetUrl = targetUrl;
  if (position) banner.position = position;
  if (isActive !== undefined) banner.isActive = isActive;

  await banner.save();

  return res.status(200).json(
    new ApiResponse(200, banner, 'Banner updated successfully')
  );
});

// Delete a banner
export const deleteBanner = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const banner = await Banner.findByIdAndDelete(id);

  if (!banner) {
    throw new ApiError(404, 'Banner not found');
  }

  return res.status(200).json(
    new ApiResponse(200, {}, 'Banner deleted successfully')
  );
});

// Toggle banner active status
export const toggleBannerStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const banner = await Banner.findById(id);

  if (!banner) {
    throw new ApiError(404, 'Banner not found');
  }

  banner.isActive = !banner.isActive;
  await banner.save();

  return res.status(200).json(
    new ApiResponse(200, banner, `Banner ${banner.isActive ? 'activated' : 'deactivated'} successfully`)
  );
});