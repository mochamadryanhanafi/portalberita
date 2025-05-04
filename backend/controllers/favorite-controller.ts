import { Request, Response } from 'express';
import Favorite from '../models/favorite.js';
import News from '../models/news.js';
import { HTTP_STATUS, RESPONSE_MESSAGES } from '../utils/constants.js';

// Add a news article to user's favorites
export const addToFavorites = async (req: Request, res: Response) => {
  try {
    const { newsId } = req.body;
    const userId = req.user._id;
    
    if (!newsId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: 'News ID is required',
      });
    }
    
    // Check if the news article exists
    const news = await News.findById(newsId);
    if (!news) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: 'News article not found',
      });
    }
    
    // Check if the article is already in favorites
    const existingFavorite = await Favorite.findOne({ user: userId, news: newsId });
    if (existingFavorite) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: 'News article is already in favorites',
      });
    }
    
    // Add to favorites
    const favorite = new Favorite({
      user: userId,
      news: newsId,
    });
    
    await favorite.save();
    
    return res.status(HTTP_STATUS.CREATED).json({
      message: 'News article added to favorites',
      favorite,
    });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR,
    });
  }
};

// Remove a news article from user's favorites
export const removeFromFavorites = async (req: Request, res: Response) => {
  try {
    const { newsId } = req.params;
    const userId = req.user._id;
    
    const favorite = await Favorite.findOne({ user: userId, news: newsId });
    
    if (!favorite) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: 'News article not found in favorites',
      });
    }
    
    await Favorite.findByIdAndDelete(favorite._id);
    
    return res.status(HTTP_STATUS.OK).json({
      message: 'News article removed from favorites',
    });
  } catch (error) {
    console.error('Error removing from favorites:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR,
    });
  }
};

// Get all favorite news articles for a user
export const getUserFavorites = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    const favorites = await Favorite.find({ user: userId })
      .populate('news')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Favorite.countDocuments({ user: userId });
    
    return res.status(HTTP_STATUS.OK).json({
      favorites: favorites.map(fav => fav.news),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error getting user favorites:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR,
    });
  }
};

// Check if a news article is in user's favorites
export const checkIsFavorite = async (req: Request, res: Response) => {
  try {
    const { newsId } = req.params;
    const userId = req.user._id;
    
    const favorite = await Favorite.findOne({ user: userId, news: newsId });
    
    return res.status(HTTP_STATUS.OK).json({
      isFavorite: !!favorite,
    });
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR,
    });
  }
};