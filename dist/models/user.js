var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Schema, model } from 'mongoose';
import JWT from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { ACCESS_TOKEN_EXPIRES_IN, JWT_SECRET, REFRESH_TOKEN_EXPIRES_IN } from '../config/utils.js';
import { Role } from '../types/role-type.js';
const userSchema = new Schema({
    userName: {
        type: String,
        required: [true, 'Username is required'],
        lowercase: true,
        unique: true,
        trim: true,
        index: true,
    },
    fullName: {
        type: String,
        required: [true, 'Name is required'],
        minLength: [3, 'Name must be at least 3 character'],
        maxLength: [15, 'Name should be less than 15 character'],
        trim: true,
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'Email is required'],
        trim: true,
        match: [
            /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/,
            'Please Enter a valid email address',
        ],
    },
    password: {
        type: String,
        required: false,
        minLength: [8, 'Password must be at least 8 character '],
        match: [
            /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
            'Password must be contains at least one uppercase and one lowercase and one digit and one special character',
        ],
        select: false,
    },
    avatar: {
        type: String,
        required: false,
    },
    role: {
        type: String,
        default: Role.User,
        enum: [Role.User, Role.Admin],
    },
    posts: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Post',
        },
    ],
    refreshToken: String,
    forgotPasswordToken: String,
    forgotPasswordExpiry: Date,
    googleId: {
        type: String,
        unique: true,
        required: false,
    },
}, { timestamps: true });
userSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isModified('password')) {
            return next();
        }
        this.password = yield bcrypt.hash(this.password, 10);
    });
});
userSchema.methods = {
    isPasswordCorrect: function (password) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield bcrypt.compare(password, this.password);
        });
    },
    generateAccessToken: function () {
        return __awaiter(this, void 0, void 0, function* () {
            if (JWT_SECRET) {
                return JWT.sign({
                    _id: this._id,
                    username: this.userName,
                    email: this.email,
                    role: this.role,
                }, JWT_SECRET, {
                    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
                });
            }
        });
    },
    generateRefreshToken: function () {
        return __awaiter(this, void 0, void 0, function* () {
            if (JWT_SECRET) {
                return JWT.sign({
                    _id: this._id,
                    username: this.userName,
                    email: this.email,
                    role: this.role,
                }, JWT_SECRET, {
                    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
                });
            }
        });
    },
    generateResetToken: function () {
        return __awaiter(this, void 0, void 0, function* () {
            const resetToken = crypto.randomBytes(20).toString('hex');
            this.forgotPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
            this.forgotPasswordExpiry = Date.now() + 15 * 60 * 1000;
            return resetToken;
        });
    },
};
const User = model('User', userSchema);
export default User;
