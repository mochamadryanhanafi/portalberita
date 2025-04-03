import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Favorite from '../models/favorite.js';
import Post from '../models/post.js'; // Ubah dari News ke Post
import { HTTP_STATUS, RESPONSE_MESSAGES } from '../utils/constants.js';

// Helper function untuk validasi ObjectId MongoDB
const isValidObjectId = (id: string): boolean => mongoose.Types.ObjectId.isValid(id);

// Tambahkan post ke daftar tersimpan
export const addToFavorites = async (req: Request, res: Response) => {
  try {
    const { postId } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Unauthorized user',
      });
    }

    if (!postId || !isValidObjectId(postId)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Invalid post ID format',
      });
    }

    // Cek apakah post ada di database
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Cek apakah post sudah tersimpan
    const existingFavorite = await Favorite.findOne({ user: userId, post: postId });
    if (existingFavorite) {
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Post is already saved',
        favorite: existingFavorite,
      });
    }

    // Simpan post
    const favorite = new Favorite({ user: userId, post: postId });
    await favorite.save();

    return res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Post saved successfully',
      favorite,
    });
  } catch (error: any) {
    console.error('Error saving post:', error.message);

    if (error.code === 11000) {
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Post is already saved',
      });
    }

    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR,
    });
  }
};

// Hapus post dari daftar tersimpan
export const removeFromFavorites = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Unauthorized user',
      });
    }

    if (!postId || !isValidObjectId(postId)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Invalid post ID format',
      });
    }

    // Cek apakah post ada di daftar tersimpan
    const favorite = await Favorite.findOne({ user: userId, post: postId });
    if (!favorite) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Post not found in saved items',
      });
    }

    await Favorite.findByIdAndDelete(favorite._id);

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Post removed from saved items',
    });
  } catch (error: any) {
    console.error('Error removing saved post:', error.message);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR,
    });
  }
};

// Ambil daftar post tersimpan pengguna
export const getUserFavorites = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    if (!userId) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Unauthorized user',
      });
    }

    const favorites = await Favorite.find({ user: userId })
      .populate('post') // Ubah dari 'news' ke 'post'
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Favorite.countDocuments({ user: userId });

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      savedPosts: favorites.map(fav => fav.post),
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    console.error('Error getting saved posts:', error.message);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR,
    });
  }
};

// Cek apakah post sudah tersimpan
export const checkIsFavorite = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Unauthorized user',
      });
    }

    if (!postId || !isValidObjectId(postId)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Invalid post ID format',
      });
    }

    const favorite = await Favorite.findOne({ user: userId, post: postId });

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      isSaved: !!favorite,
    });
  } catch (error: any) {
    console.error('Error checking saved status:', error.message);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR,
    });
  }
};
