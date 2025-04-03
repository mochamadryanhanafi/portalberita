import { JWT_SECRET } from '../config/utils.js';
import { ApiError } from '../utils/api-error.js';
import { HTTP_STATUS, RESPONSE_MESSAGES } from '../utils/constants.js';
import jwt from 'jsonwebtoken';
import { Role } from '../types/role-type.js';
import User from '../models/user.js';

// Middleware untuk otentikasi pengguna
export const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies?.access_token;
        if (!token) {
            return next(new ApiError({
                status: HTTP_STATUS.UNAUTHORIZED,
                message: RESPONSE_MESSAGES.USERS.RE_LOGIN,
            }));
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded._id);

        if (!user) {
            return next(new ApiError({
                status: HTTP_STATUS.NOT_FOUND,
                message: RESPONSE_MESSAGES.USERS.NOT_FOUND,
            }));
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        return next(new ApiError({
            status: HTTP_STATUS.FORBIDDEN,
            message: RESPONSE_MESSAGES.USERS.INVALID_TOKEN,
        }));
    }
};

// Middleware untuk memeriksa apakah pengguna adalah admin
export const isAdminMiddleware = async (req, res, next) => {
    try {
        if (!req.user) {
            return next(new ApiError({
                status: HTTP_STATUS.UNAUTHORIZED,
                message: RESPONSE_MESSAGES.USERS.UNAUTHORIZED_USER,
            }));
        }

        if (req.user.role !== Role.Admin) {
            return next(new ApiError({
                status: HTTP_STATUS.UNAUTHORIZED,
                message: RESPONSE_MESSAGES.USERS.UNAUTHORIZED_USER,
            }));
        }

        next();
    } catch (error) {
        console.error('Admin check error:', error);
        return next(new ApiError({
            status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
            message: RESPONSE_MESSAGES.SERVER_ERROR,
        }));
    }
};
