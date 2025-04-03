import { Request, Response } from 'express';
import Comment from '../models/comment.js';
import { HTTP_STATUS, RESPONSE_MESSAGES } from '../utils/constants.js';

// Get all comments for a news article
export const getCommentsByNewsId = async (req: Request, res: Response) => {
  try {
    const { newsId } = req.params;
    
    const comments = await Comment.find({ news: newsId })
      .populate('user', 'userName fullName avatar')
      .sort({ createdAt: -1 });
    
    return res.status(HTTP_STATUS.OK).json(comments);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error getting comments:', errorMessage);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR,
    });
  }
};

// Create a new comment
export const createComment = async (req: Request, res: Response) => {
  try {
    const { content, newsId } = req.body;
    
    if (!content) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: 'Comment content is required',
      });
    }
    
    const comment = new Comment({
      content,
      user: req.user._id,
      news: newsId,
    });
    
    await comment.save();
    
    // Populate user information before sending response
    const populatedComment = await Comment.findById(comment._id).populate(
      'user',
      'userName fullName avatar'
    );
    
    return res.status(HTTP_STATUS.CREATED).json({
      message: 'Comment added successfully',
      comment: populatedComment,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error creating comment:', errorMessage);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR,
    });
  }
};

// Update a comment
export const updateComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    
    if (!content) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: 'Comment content is required',
      });
    }
    
    const comment = await Comment.findById(id);
    
    if (!comment) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: 'Comment not found',
      });
    }
    
    // Check if the user is the author of the comment
    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        message: 'You are not authorized to update this comment',
      });
    }
    
    comment.content = content;
    await comment.save();
    
    return res.status(HTTP_STATUS.OK).json({
      message: 'Comment updated successfully',
      comment,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error updating comment:', errorMessage);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR,
    });
  }
};

// Delete a comment
export const deleteComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const comment = await Comment.findById(id);
    
    if (!comment) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: 'Comment not found',
      });
    }
    
    // Check if the user is the author of the comment or an admin
    if (
      comment.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'ADMIN'
    ) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        message: 'You are not authorized to delete this comment',
      });
    }
    
    await Comment.findByIdAndDelete(id);
    
    return res.status(HTTP_STATUS.OK).json({
      message: 'Comment deleted successfully',
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error deleting comment:', errorMessage);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR,
    });
  }
};