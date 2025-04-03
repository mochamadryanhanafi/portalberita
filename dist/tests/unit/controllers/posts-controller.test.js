var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { createPostHandler, deletePostByIdHandler, getAllPostsHandler, getFeaturedPostsHandler, getLatestPostsHandler, getPostByCategoryHandler, getPostByIdHandler, updatePostHandler, } from '../../../controllers/posts-controller.js';
import Post from '../../../models/post.js';
import { expect, jest, it, describe } from '@jest/globals';
import { validCategories, HTTP_STATUS, RESPONSE_MESSAGES } from '../../../utils/constants.js';
import { createPostObject, createRequestObject, res } from '../../utils/helper-objects.js';
jest.mock('../../../models/post.js', () => ({
    __esModule: true,
    default: jest.fn(),
}));
describe('createPostHandler', () => {
    it('Post creation: Success - All fields are valid', () => __awaiter(void 0, void 0, void 0, function* () {
        const postObject = createPostObject();
        const req = createRequestObject({ body: postObject });
        jest.spyOn(Post.prototype, 'save').mockImplementationOnce(() => Promise.resolve(postObject));
        yield createPostHandler(req, res);
        expect(Post).toHaveBeenCalledTimes(1);
        expect(Post).toHaveBeenCalledWith(postObject);
        expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(res.json).toHaveBeenCalledWith(postObject);
    }));
    it('Post creation: Failure - Invalid image url', () => __awaiter(void 0, void 0, void 0, function* () {
        const postObject = createPostObject({
            imageLink: 'https://www.forTestingPurposeOnly/my-image.gif', // Invalid image URL
        });
        const req = createRequestObject({ body: postObject });
        yield createPostHandler(req, res);
        expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(res.json).toHaveBeenCalledWith({
            message: RESPONSE_MESSAGES.POSTS.INVALID_IMAGE_URL,
        });
    }));
    it('Post creation: Failure - Some fields are missing', () => __awaiter(void 0, void 0, void 0, function* () {
        const postObject = createPostObject();
        delete postObject.title;
        delete postObject.authorName;
        const req = createRequestObject({ body: postObject });
        yield createPostHandler(req, res);
        expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(res.json).toHaveBeenCalledWith({ message: RESPONSE_MESSAGES.COMMON.REQUIRED_FIELDS });
    }));
    it('Post creation: Failure - Too Many Categories', () => __awaiter(void 0, void 0, void 0, function* () {
        const postObject = createPostObject({
            categories: [validCategories[0], validCategories[1], validCategories[2], validCategories[3]], // 4 categories
        });
        const req = createRequestObject({ body: postObject });
        yield createPostHandler(req, res);
        expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(res.json).toHaveBeenCalledWith({
            message: RESPONSE_MESSAGES.POSTS.MAX_CATEGORIES,
        });
    }));
    it('Post creation: Failure - Internal server error', () => __awaiter(void 0, void 0, void 0, function* () {
        const postObject = createPostObject();
        const req = createRequestObject({ body: postObject });
        jest.spyOn(Post.prototype, 'save').mockImplementationOnce(() => Promise.resolve(postObject));
        yield createPostHandler(req, res);
        expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(res.json).toHaveBeenCalledWith({
            message: RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR,
        });
    }));
});
describe('getAllPostsHandler', () => {
    it('Get all posts: Success - Retrieving all posts list', () => __awaiter(void 0, void 0, void 0, function* () {
        const req = createRequestObject();
        const mockPosts = [
            createPostObject({ title: 'Test Post - 1' }),
            createPostObject({ title: 'Test Post - 2', isFeaturedPost: true }),
            createPostObject({ title: 'Test Post - 3' }),
        ];
        jest.spyOn(Post, 'find').mockResolvedValue(mockPosts);
        yield getAllPostsHandler(req, res);
        expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(res.json).toHaveBeenCalledWith(mockPosts);
    }));
    it('Get all posts: Failure - Internal Server Error', () => __awaiter(void 0, void 0, void 0, function* () {
        const req = createRequestObject();
        jest
            .spyOn(Post, 'find')
            .mockRejectedValueOnce(new Error(RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR));
        yield getAllPostsHandler(req, res);
        expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(res.json).toHaveBeenCalledWith({
            message: RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR,
        });
    }));
});
describe('getFeaturedPostsHandler', () => {
    it('Get featured posts: Success - Retrieving all featured posts list', () => __awaiter(void 0, void 0, void 0, function* () {
        const req = createRequestObject();
        const mockFeaturedPosts = [
            createPostObject({ title: 'Test Post - 1', isFeaturedPost: true }),
            createPostObject({ title: 'Test Post - 2', isFeaturedPost: true }),
            createPostObject({ title: 'Test Post - 3', isFeaturedPost: true }),
        ];
        jest.spyOn(Post, 'find').mockResolvedValue(mockFeaturedPosts);
        yield getFeaturedPostsHandler(req, res);
        expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(res.json).toHaveBeenCalledWith(mockFeaturedPosts);
    }));
    it('Get featured posts: Failure - Internal Server Error', () => __awaiter(void 0, void 0, void 0, function* () {
        const req = createRequestObject();
        jest
            .spyOn(Post, 'find')
            .mockRejectedValueOnce(new Error(RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR));
        yield getFeaturedPostsHandler(req, res);
        expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(res.json).toHaveBeenCalledWith({
            message: RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR,
        });
    }));
});
describe('getPostByCategoryHandler', () => {
    it('Get posts by category: Success - Retrieving posts list of specified category', () => __awaiter(void 0, void 0, void 0, function* () {
        const req = createRequestObject({ params: { category: validCategories[1] } });
        const mockPosts = [
            createPostObject({ title: 'Test Post - 1', categories: [validCategories[1]] }),
            createPostObject({ title: 'Test Post - 2', categories: [validCategories[1]] }),
            createPostObject({ title: 'Test Post - 3', categories: [validCategories[1]] }),
        ];
        jest.spyOn(Post, 'find').mockResolvedValue(mockPosts);
        yield getPostByCategoryHandler(req, res);
        expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(res.json).toHaveBeenCalledWith(mockPosts);
    }));
    it('Get posts by category: Failure - Invalid category', () => __awaiter(void 0, void 0, void 0, function* () {
        const req = createRequestObject({ params: { category: 'Invalid Category' } });
        yield getPostByCategoryHandler(req, res);
        expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(res.json).toHaveBeenCalledWith({ message: RESPONSE_MESSAGES.POSTS.INVALID_CATEGORY });
    }));
    it('Get posts by category: Failure - Internal Server Error', () => __awaiter(void 0, void 0, void 0, function* () {
        const req = createRequestObject({ params: { category: validCategories[1] } });
        jest
            .spyOn(Post, 'find')
            .mockRejectedValueOnce(new Error(RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR));
        yield getPostByCategoryHandler(req, res);
        expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(res.json).toHaveBeenCalledWith({
            message: RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR,
        });
    }));
});
describe('getLatestPostsHandler', () => {
    it('Get latest posts: Success - Retrieving most recent posts list', () => __awaiter(void 0, void 0, void 0, function* () {
        const req = createRequestObject();
        const mockPosts = [
            createPostObject({ title: 'Test Post - 1' }),
            createPostObject({ title: 'Test Post - 2' }),
            createPostObject({ title: 'Test Post - 3' }),
        ];
        jest.spyOn(Post, 'find').mockResolvedValueOnce(mockPosts);
        yield getLatestPostsHandler(req, res);
        expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(res.json).toHaveBeenCalledWith(mockPosts);
    }));
    it('Get latest posts: Failure - Internal Server Error', () => __awaiter(void 0, void 0, void 0, function* () {
        const req = createRequestObject();
        jest
            .spyOn(Post, 'find')
            .mockRejectedValueOnce(new Error(RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR));
        yield getLatestPostsHandler(req, res);
        expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(res.json).toHaveBeenCalledWith({
            message: RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR,
        });
    }));
});
describe('getPostByIdHandler', () => {
    it('Get post by ID: Success - Retrieving Specific Post', () => __awaiter(void 0, void 0, void 0, function* () {
        const req = createRequestObject({ params: { id: '6910293383' } });
        const mockPost = createPostObject({ _id: '6910293383' });
        jest.spyOn(Post, 'find').mockResolvedValueOnce(mockPost);
        yield getPostByIdHandler(req, res);
        expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(res.json).toHaveBeenCalledWith(mockPost);
    }));
    it('Get post by ID: Failure - Post not found (Specified post ID is invalid)', () => __awaiter(void 0, void 0, void 0, function* () {
        const req = createRequestObject({ params: { id: '6910293383' } });
        jest.spyOn(Post, 'findById').mockResolvedValue(null);
        yield getPostByIdHandler(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: RESPONSE_MESSAGES.POSTS.NOT_FOUND });
    }));
    it('Get post by ID: Failure - Internal Server Error', () => __awaiter(void 0, void 0, void 0, function* () {
        const req = createRequestObject({ params: { id: '6910293383' } });
        jest
            .spyOn(Post, 'findById')
            .mockRejectedValueOnce(new Error(RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR));
        yield getPostByIdHandler(req, res);
        expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(res.json).toHaveBeenCalledWith({
            message: RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR,
        });
    }));
});
describe('updatePostHandler', () => {
    it('Update post: Success - Modifying post content', () => __awaiter(void 0, void 0, void 0, function* () {
        const req = createRequestObject({
            params: { id: '6910293383' },
            body: { title: 'Updated Post' },
        });
        const mockPost = createPostObject({ _id: '6910293383', title: 'Updated Post' });
        // Mock the behavior of Post.findByIdAndUpdate
        jest.spyOn(Post, 'findByIdAndUpdate').mockResolvedValueOnce(mockPost);
        yield updatePostHandler(req, res);
        expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(res.json).toHaveBeenCalledWith(mockPost);
    }));
    it('Update post: Failure - Post not found (Specified post ID is invalid)', () => __awaiter(void 0, void 0, void 0, function* () {
        const req = createRequestObject({
            params: { id: '6910293383' },
            body: { title: 'Updated Post' },
        });
        // Mock the behavior of Post.findByIdAndUpdate
        jest.spyOn(Post, 'findByIdAndUpdate').mockResolvedValueOnce(null);
        yield updatePostHandler(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: RESPONSE_MESSAGES.POSTS.NOT_FOUND });
    }));
    it('Update post: Failure - Internal Server Error', () => __awaiter(void 0, void 0, void 0, function* () {
        const req = createRequestObject({
            params: { id: '6910293383' },
            body: { title: 'Updated Post' },
        });
        // Mock the behavior of Post.findByIdAndUpdate
        jest
            .spyOn(Post, 'findByIdAndUpdate')
            .mockRejectedValueOnce(new Error(RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR));
        yield updatePostHandler(req, res);
        expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(res.json).toHaveBeenCalledWith({
            message: RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR,
        });
    }));
});
describe('deletePostByIdHandler', () => {
    it('Delete Post: Success - Removing Post with specified ID', () => __awaiter(void 0, void 0, void 0, function* () {
        const req = createRequestObject({ params: { id: '6910293383' } });
        const mockPost = createPostObject({ _id: '6910293383' });
        // Mock the behavior of Post.findByIdAndRemove
        jest.spyOn(Post, 'findByIdAndDelete').mockResolvedValueOnce(mockPost);
        yield deletePostByIdHandler(req, res);
        expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(res.json).toHaveBeenCalledWith({
            message: RESPONSE_MESSAGES.POSTS.DELETED,
        });
    }));
    it('Delete Post: Failure - Post not found (Specified post ID is invalid)', () => __awaiter(void 0, void 0, void 0, function* () {
        const req = createRequestObject({ params: { id: '6910293383' } });
        // Mock the behavior of Post.findByIdAndRemove
        jest
            .spyOn(Post, 'findByIdAndDelete')
            .mockRejectedValueOnce(new Error(RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR));
        yield deletePostByIdHandler(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: RESPONSE_MESSAGES.POSTS.NOT_FOUND });
    }));
    it('Delete Post: Failure - Internal Server Error', () => __awaiter(void 0, void 0, void 0, function* () {
        const req = createRequestObject({ params: { id: '6910293383' } });
        // Mock the behavior of Post.findByIdAndRemove
        jest
            .spyOn(Post, 'findByIdAndDelete')
            .mockRejectedValueOnce(new Error(RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR));
        yield deletePostByIdHandler(req, res);
        expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(res.json).toHaveBeenCalledWith({
            message: RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR,
        });
    }));
});
