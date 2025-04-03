var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import mongoose from 'mongoose';
import request from 'supertest';
import Post from '../../../models/post.js';
import server from '../../../server.js';
import { validCategories, HTTP_STATUS, RESPONSE_MESSAGES } from '../../../utils/constants.js';
import { createPostObject } from '../../utils/helper-objects.js';
import { expect, jest, it, afterAll, describe } from '@jest/globals';
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield mongoose.disconnect();
}));
let postId;
const invalidPostId = '609c16c69405b14574c99999';
describe('Integration Tests: Post creation', () => {
    it('Post creation: Success - All fields are valid', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield request(server).post('/api/posts').send(createPostObject());
        postId = response.body._id;
        const fetchedPost = yield Post.findById(postId);
        expect(response.status).toBe(HTTP_STATUS.OK);
        expect(response.body).toHaveProperty('_id');
        expect(fetchedPost).not.toBeNull();
        expect(fetchedPost === null || fetchedPost === void 0 ? void 0 : fetchedPost.title).toBe(createPostObject().title);
    }));
    it('Post creation: Failure - Missing required fields', () => __awaiter(void 0, void 0, void 0, function* () {
        const postObject = createPostObject();
        delete postObject.title;
        const response = yield request(server).post('/api/posts').send(postObject);
        expect(JSON.parse(response.text)).toEqual({
            message: RESPONSE_MESSAGES.COMMON.REQUIRED_FIELDS,
        });
        expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    }));
    it('Post creation: Failure - Invalid category count', () => __awaiter(void 0, void 0, void 0, function* () {
        const postObject = createPostObject({
            categories: [validCategories[0], validCategories[1], validCategories[2], validCategories[3]],
        });
        const response = yield request(server).post('/api/posts').send(postObject);
        expect(JSON.parse(response.text)).toEqual({
            message: RESPONSE_MESSAGES.POSTS.MAX_CATEGORIES,
        });
        expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    }));
    it('Post creation: Failure - Invalid image URL format', () => __awaiter(void 0, void 0, void 0, function* () {
        const postObject = createPostObject({
            imageLink: 'https://www.invalid-image.gif',
        });
        const response = yield request(server).post('/api/posts').send(postObject);
        expect(JSON.parse(response.text)).toEqual({
            message: RESPONSE_MESSAGES.POSTS.INVALID_IMAGE_URL,
        });
        expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    }));
    it('Post creation: Failure - Internal server error', () => __awaiter(void 0, void 0, void 0, function* () {
        // Mocking a scenario where the server encounters an internal error during post creation
        jest
            .spyOn(Post.prototype, 'save')
            .mockRejectedValueOnce(new Error(RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR));
        const postObject = createPostObject();
        const response = yield request(server).post('/api/posts').send(postObject);
        expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(JSON.parse(response.text)).toEqual({
            message: RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR,
        });
    }));
});
describe('Integration Tests: Get all posts', () => {
    it('Get all posts: Success', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield request(server).get('/api/posts');
        expect(response.status).toBe(HTTP_STATUS.OK);
        expect(response.body).toBeInstanceOf(Array);
    }));
});
describe('Integration Tests: Get all posts by category', () => {
    it('Get all posts by category: Success', () => __awaiter(void 0, void 0, void 0, function* () {
        const category = validCategories[0];
        const response = yield request(server).get(`/api/posts/categories/${category}`);
        expect(response.status).toBe(HTTP_STATUS.OK);
        expect(response.body).toBeInstanceOf(Array);
    }));
    it('Get all posts by category: Failure - Invalid category', () => __awaiter(void 0, void 0, void 0, function* () {
        const category = 'invalid-category';
        const response = yield request(server).get(`/api/posts/categories/${category}`);
        expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
        expect(JSON.parse(response.text)).toEqual({
            message: RESPONSE_MESSAGES.POSTS.INVALID_CATEGORY,
        });
    }));
});
describe('Integration Tests: Get all featured posts', () => {
    it('Get all featured posts: Success', () => __awaiter(void 0, void 0, void 0, function* () {
        const responseFeatured = yield request(server).get('/api/posts/featured');
        expect(responseFeatured.status).toBe(HTTP_STATUS.OK);
        expect(responseFeatured.body.length).toBeGreaterThan(1);
    }));
});
describe('Integration Tests: Get all latest posts', () => {
    it('Get all latest posts: Success', () => __awaiter(void 0, void 0, void 0, function* () {
        const responseLatest = yield request(server).get('/api/posts/latest');
        expect(responseLatest.status).toBe(HTTP_STATUS.OK);
        expect(responseLatest.body.length).toBeGreaterThan(1);
    }));
});
describe('Integration Tests: Update Post', () => {
    it('Update Post: Success - Update Post of existing ID', () => __awaiter(void 0, void 0, void 0, function* () {
        let updatedPost;
        const response = yield request(server)
            .patch(`/api/posts/${postId}`)
            .send(createPostObject({ title: 'Updated Post' }));
        updatedPost = yield Post.findById(postId);
        expect(response.status).toBe(HTTP_STATUS.OK);
        expect(updatedPost).not.toBeNull();
        expect(updatedPost === null || updatedPost === void 0 ? void 0 : updatedPost.title).toBe('Updated Post');
    }));
    it('Update Post: Failure - Invalid post ID', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield request(server)
            .patch(`/api/posts/${invalidPostId}`)
            .send(createPostObject({ title: 'Updated Post' }));
        expect(response.status).toBe(HTTP_STATUS.NOT_FOUND);
        expect(JSON.parse(response.text)).toEqual({
            message: RESPONSE_MESSAGES.POSTS.NOT_FOUND,
        });
    }));
});
describe('Integration Tests: Delete Post', () => {
    it('Delete Post: Success - Removing Post with specific ID', () => __awaiter(void 0, void 0, void 0, function* () {
        let deletedPost;
        const response = yield request(server).delete(`/api/posts/${postId}`);
        deletedPost = yield Post.findById(postId);
        expect(response.status).toBe(HTTP_STATUS.OK);
        expect(response.body).toHaveProperty('message', RESPONSE_MESSAGES.POSTS.DELETED);
        expect(deletedPost).toBeNull();
    }));
    it('Delete Post: Failure - Invalid post ID', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield request(server).delete(`/api/posts/${invalidPostId}`);
        expect(response.status).toBe(HTTP_STATUS.NOT_FOUND);
        expect(JSON.parse(response.text)).toEqual({
            message: RESPONSE_MESSAGES.POSTS.NOT_FOUND,
        });
    }));
});
