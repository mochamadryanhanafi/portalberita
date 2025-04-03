import { JWT_SECRET } from '../config/utils.js';
import { ApiError } from '../utils/api-error.js';
import { HTTP_STATUS, RESPONSE_MESSAGES } from '../utils/constants.js';
import jwt from 'jsonwebtoken';
import { Role } from '../types/role-type.js';
import User from '../models/user.js';

import { Request, Response, NextFunction } from 'express';
import { ObjectId } from 'mongoose';

interface JwtPayload {
  _id: ObjectId;
}

// Middleware untuk otentikasi pengguna
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.access_token;

    if (!token) {
      return next(
        new ApiError({
          status: HTTP_STATUS.UNAUTHORIZED,
          message: RESPONSE_MESSAGES.USERS.RE_LOGIN,
        })
      );
    }

    // Verifikasi token JWT
    const decoded = jwt.verify(token, JWT_SECRET as string) as JwtPayload;

    if (!decoded || !decoded._id) {
      return next(
        new ApiError({
          status: HTTP_STATUS.FORBIDDEN,
          message: RESPONSE_MESSAGES.USERS.INVALID_TOKEN,
        })
      );
    }

    // Mencari user berdasarkan ID
    const user = await User.findById(decoded._id);
    if (!user) {
      return next(
        new ApiError({
          status: HTTP_STATUS.NOT_FOUND,
          message: RESPONSE_MESSAGES.USERS.USER_NOT_EXISTS,
        })
      );
    }

    // Sanitasi user data untuk menghindari karakter ekstra
    req.user = {
      ...user.toObject(),
      userName: user.userName.trim(),
      fullName: user.fullName.trim(),
      email: user.email.trim(),
      role: user.role.trim(),
    };

    next();
  } catch (error: any) {
    console.error('Token verification error:', error);
    return next(
      new ApiError({
        status: HTTP_STATUS.FORBIDDEN,
        message: RESPONSE_MESSAGES.USERS.INVALID_TOKEN,
      })
    );
  }
};

// Middleware untuk mengecek apakah pengguna adalah admin
export const isAdminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== Role.Admin.trim()) {
    return next(
      new ApiError({
        status: HTTP_STATUS.UNAUTHORIZED,
        message: RESPONSE_MESSAGES.USERS.UNAUTHORIZED_USER,
      })
    );
  }
  next();
};
