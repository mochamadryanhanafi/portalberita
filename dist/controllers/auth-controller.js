import User from '../models/user.js';
import jwt from 'jsonwebtoken';
import { HTTP_STATUS, RESPONSE_MESSAGES } from '../utils/constants.js';
import { cookieOptions } from '../utils/cookie_options.js';
import { JWT_SECRET } from '../config/utils.js';
import { ApiError } from '../utils/api-error.js';
import { ApiResponse } from '../utils/api-response.js';
import { asyncHandler } from '../utils/async-handler.js';

// SIGN UP USER
export const signUpWithEmail = asyncHandler(async (req, res) => {
    const { userName, fullName, email, password } = req.body;

    // Validasi input
    if (!userName || !fullName || !email || !password) {
        throw new ApiError({
            status: HTTP_STATUS.BAD_REQUEST,
            message: RESPONSE_MESSAGES.COMMON.REQUIRED_FIELDS,
        });
    }

    // Cek apakah userName atau email sudah terdaftar
    const existingUser = await User.findOne({ $or: [{ userName }, { email }] });
    if (existingUser) {
        const message = existingUser.userName === userName
            ? RESPONSE_MESSAGES.USERS.USER_USERNAME_EXISTS
            : RESPONSE_MESSAGES.USERS.USER_EMAIL_EXISTS;
        throw new ApiError({ status: HTTP_STATUS.BAD_REQUEST, message });
    }

    // Buat user baru
    const user = new User({ userName, fullName, email, password });
    await user.validate();
    
    // Buat access dan refresh token
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken;

    // Simpan user ke database
    await user.save();
    user.password = undefined; // Jangan kirim password ke response

    res.status(HTTP_STATUS.OK)
        .cookie('access_token', accessToken, cookieOptions)
        .cookie('refresh_token', refreshToken, cookieOptions)
        .json(new ApiResponse(HTTP_STATUS.OK, { accessToken, refreshToken, user }, RESPONSE_MESSAGES.USERS.SIGNED_UP));
});

// SIGN IN USER
export const signInWithEmailOrUsername = asyncHandler(async (req, res) => {
    const { userNameOrEmail, password } = req.body;

    // Validasi input
    if (!userNameOrEmail || !password) {
        throw new ApiError({
            status: HTTP_STATUS.BAD_REQUEST,
            message: RESPONSE_MESSAGES.COMMON.REQUIRED_FIELDS,
        });
    }

    // Cari user berdasarkan email atau username
    const user = await User.findOne({
        $or: [{ email: userNameOrEmail }, { userName: userNameOrEmail }],
    }).select('+password');

    if (!user || !(await user.isPasswordCorrect(password))) {
        throw new ApiError({
            status: HTTP_STATUS.UNAUTHORIZED,
            message: RESPONSE_MESSAGES.USERS.INVALID_CREDENTIALS,
        });
    }

    // Buat access dan refresh token
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save();
    user.password = undefined;

    res.status(HTTP_STATUS.OK)
        .cookie('access_token', accessToken, cookieOptions)
        .cookie('refresh_token', refreshToken, cookieOptions)
        .json(new ApiResponse(HTTP_STATUS.OK, { accessToken, refreshToken, user }, RESPONSE_MESSAGES.USERS.SIGNED_IN));
});

// SIGN OUT USER
export const signOutUser = asyncHandler(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user?._id, { refreshToken: '' }, { new: true });
    
    req.logout((err) => {
        if (err) {
            return next(new ApiError({
                status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
                message: 'Logout failed',
            }));
        }
        res.status(HTTP_STATUS.OK)
            .clearCookie('access_token', cookieOptions)
            .clearCookie('refresh_token', cookieOptions)
            .json(new ApiResponse(HTTP_STATUS.OK, '', RESPONSE_MESSAGES.USERS.SIGNED_OUT));
    });
});

// CHECK USER LOGIN STATUS
export const isLoggedIn = asyncHandler(async (req, res) => {
    let { access_token, refresh_token } = req.cookies;
    const { _id } = req.params;

    if (!_id) {
        return res.status(HTTP_STATUS.BAD_REQUEST)
            .json(new ApiResponse(HTTP_STATUS.BAD_REQUEST, '', 'User ID is required'));
    }

    // Verifikasi access token
    try {
        if (access_token && JWT_SECRET) {
            await jwt.verify(access_token, JWT_SECRET);
            return res.status(HTTP_STATUS.OK)
                .json(new ApiResponse(HTTP_STATUS.OK, access_token, RESPONSE_MESSAGES.USERS.VALID_TOKEN));
        }
    } catch (error) {
        console.log('Access token expired:', error.message);
    }

    // Jika access token kadaluarsa, gunakan refresh token
    if (refresh_token) {
        try {
            if (JWT_SECRET) {
                await jwt.verify(refresh_token, JWT_SECRET);
            }
            const user = await User.findById(_id);
            if (!user) {
                return res.status(HTTP_STATUS.NOT_FOUND)
                    .json(new ApiResponse(HTTP_STATUS.NOT_FOUND, '', RESPONSE_MESSAGES.USERS.USER_NOT_EXISTS));
            }
            
            // Generate token baru
            access_token = await user.generateAccessToken();
            refresh_token = await user.generateRefreshToken();
            user.refreshToken = refresh_token;
            await user.save();

            return res.status(HTTP_STATUS.OK)
                .cookie('access_token', access_token, cookieOptions)
                .cookie('refresh_token', refresh_token, cookieOptions)
                .json(new ApiResponse(HTTP_STATUS.OK, access_token, RESPONSE_MESSAGES.USERS.VALID_TOKEN));
        } catch (error) {
            return res.status(HTTP_STATUS.UNAUTHORIZED)
                .json(new ApiResponse(HTTP_STATUS.UNAUTHORIZED, error.message, RESPONSE_MESSAGES.USERS.INVALID_TOKEN));
        }
    }

    return res.status(HTTP_STATUS.UNAUTHORIZED)
        .json(new ApiResponse(HTTP_STATUS.UNAUTHORIZED, '', RESPONSE_MESSAGES.USERS.INVALID_TOKEN));
});
