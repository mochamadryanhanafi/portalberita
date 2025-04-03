import User from '../models/user.js';
import { HTTP_STATUS, RESPONSE_MESSAGES } from '../utils/constants.js';
import { ApiError } from '../utils/api-error.js';
import { ApiResponse } from '../utils/api-response.js';
import { asyncHandler } from '../utils/async-handler.js';
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), 'public/uploads/profiles');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'profile-' + uniqueSuffix + ext);
  },
});

// File filter to only allow image files
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedFileTypes = /jpeg|jpg|png|webp/;
  const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedFileTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Get user profile
export const getUserProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError({
      status: HTTP_STATUS.UNAUTHORIZED,
      message: RESPONSE_MESSAGES.USERS.RE_LOGIN,
    });
  }

  const user = await User.findById(userId).select('-password -refreshToken');

  if (!user) {
    throw new ApiError({
      status: HTTP_STATUS.NOT_FOUND,
      message: RESPONSE_MESSAGES.USERS.USER_NOT_EXISTS,
    });
  }

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(
      HTTP_STATUS.OK,
      { user },
      'User profile retrieved successfully'
    )
  );
});

// Update user profile
export const updateUserProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const { fullName } = req.body;

  if (!userId) {
    throw new ApiError({
      status: HTTP_STATUS.UNAUTHORIZED,
      message: RESPONSE_MESSAGES.USERS.RE_LOGIN,
    });
  }

  if (!fullName) {
    throw new ApiError({
      status: HTTP_STATUS.BAD_REQUEST,
      message: RESPONSE_MESSAGES.COMMON.REQUIRED_FIELDS,
    });
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { fullName },
    { new: true }
  ).select('-password -refreshToken');

  if (!user) {
    throw new ApiError({
      status: HTTP_STATUS.NOT_FOUND,
      message: RESPONSE_MESSAGES.USERS.USER_NOT_EXISTS,
    });
  }

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(
      HTTP_STATUS.OK,
      { user },
      RESPONSE_MESSAGES.USERS.UPDATE
    )
  );
});

// Change username
export const changeUsername = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const { userName } = req.body;

  if (!userId) {
    throw new ApiError({
      status: HTTP_STATUS.UNAUTHORIZED,
      message: RESPONSE_MESSAGES.USERS.RE_LOGIN,
    });
  }

  if (!userName) {
    throw new ApiError({
      status: HTTP_STATUS.BAD_REQUEST,
      message: RESPONSE_MESSAGES.COMMON.REQUIRED_FIELDS,
    });
  }

  // Check if username already exists
  const existingUser = await User.findOne({ userName });
  if (existingUser && existingUser._id.toString() !== userId.toString()) {
    throw new ApiError({
      status: HTTP_STATUS.BAD_REQUEST,
      message: RESPONSE_MESSAGES.USERS.USER_USERNAME_EXISTS,
    });
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { userName },
    { new: true }
  ).select('-password -refreshToken');

  if (!user) {
    throw new ApiError({
      status: HTTP_STATUS.NOT_FOUND,
      message: RESPONSE_MESSAGES.USERS.USER_NOT_EXISTS,
    });
  }

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(
      HTTP_STATUS.OK,
      { user },
      RESPONSE_MESSAGES.USERS.UPDATE
    )
  );
});

// Change password
export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const { currentPassword, newPassword } = req.body;

  if (!userId) {
    throw new ApiError({
      status: HTTP_STATUS.UNAUTHORIZED,
      message: RESPONSE_MESSAGES.USERS.RE_LOGIN,
    });
  }

  if (!currentPassword || !newPassword) {
    throw new ApiError({
      status: HTTP_STATUS.BAD_REQUEST,
      message: RESPONSE_MESSAGES.COMMON.REQUIRED_FIELDS,
    });
  }

  // Get user with password
  const user = await User.findById(userId).select('+password');

  if (!user) {
    throw new ApiError({
      status: HTTP_STATUS.NOT_FOUND,
      message: RESPONSE_MESSAGES.USERS.USER_NOT_EXISTS,
    });
  }

  // Verify current password
  const isPasswordCorrect = await user.isPasswordCorrect(currentPassword);
  if (!isPasswordCorrect) {
    throw new ApiError({
      status: HTTP_STATUS.UNAUTHORIZED,
      message: RESPONSE_MESSAGES.USERS.INVALID_PASSWORD,
    });
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(
      HTTP_STATUS.OK,
      {},
      'Password updated successfully'
    )
  );
});

// Upload profile picture
export const uploadProfilePicture = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError({
      status: HTTP_STATUS.UNAUTHORIZED,
      message: RESPONSE_MESSAGES.USERS.RE_LOGIN,
    });
  }

  if (!req.file) {
    throw new ApiError({
      status: HTTP_STATUS.BAD_REQUEST,
      message: 'No file uploaded',
    });
  }

  // Get the file path relative to the server
  const filePath = `/uploads/profiles/${path.basename(req.file.path)}`;

  // Update user with new avatar
  const user = await User.findByIdAndUpdate(
    userId,
    { avatar: filePath },
    { new: true }
  ).select('-password -refreshToken');

  if (!user) {
    throw new ApiError({
      status: HTTP_STATUS.NOT_FOUND,
      message: RESPONSE_MESSAGES.USERS.USER_NOT_EXISTS,
    });
  }

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(
      HTTP_STATUS.OK,
      { user },
      'Profile picture updated successfully'
    )
  );
});