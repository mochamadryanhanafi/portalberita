import { validCategories } from '../../utils/constants.js';
import { jest } from '@jest/globals';
export const createPostObject = (options = {}) => {
    return Object.assign({ _id: options._id, title: options.title || 'Test Post', authorName: options.authorName || 'Test Author', imageLink: options.imageLink || 'https://www.forTestingPurposeOnly/my-image.jpg', categories: options.categories || [validCategories[0]], description: options.description || 'This is a test post.', isFeaturedPost: options.isFeaturedPost || false }, options);
};
export const createRequestObject = (options = {}) => {
    return {
        body: options.body || {},
        params: options.params || {},
    };
};
export const res = {
    json: jest.fn().mockReturnThis(),
    status: jest.fn().mockReturnThis(),
};
