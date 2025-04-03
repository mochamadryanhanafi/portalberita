var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Post from '../models/post.js';
import { HTTP_STATUS, RESPONSE_MESSAGES } from '../utils/constants.js';
export const isAuthorMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user._id;
        const postId = req.params.id;
        const post = yield Post.findById(postId);
        if (!post) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ message: RESPONSE_MESSAGES.POSTS.NOT_FOUND });
        }
        console.log(post.authorId, userId);
        if (post.authorId.toString() !== userId) {
            return res
                .status(HTTP_STATUS.FORBIDDEN)
                .json({ message: RESPONSE_MESSAGES.POSTS.NOT_ALLOWED });
        }
        next();
    }
    catch (error) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
});
