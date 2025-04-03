import Post from '../models/post.js';
import User from '../models/user.js';
import { deleteDataFromCache, storeDataInCache } from '../utils/cache-posts.js';
import { HTTP_STATUS, REDIS_KEYS, RESPONSE_MESSAGES, validCategories } from '../utils/constants.js';
export const createPostHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, authorName, imageLink, categories, description, isFeaturedPost = false, } = req.body;
        const userId = req.user._id;
        // Validation - check if all fields are filled
        if (!title || !authorName || !imageLink || !description || !categories) {
            return res
                .status(HTTP_STATUS.BAD_REQUEST)
                .json({ message: RESPONSE_MESSAGES.COMMON.REQUIRED_FIELDS });
        }
        // Validation - check if imageLink is a valid URL
        const imageLinkRegex = /\.(jpg|jpeg|png|webp)$/i;
        if (!imageLinkRegex.test(imageLink)) {
            return res
                .status(HTTP_STATUS.BAD_REQUEST)
                .json({ message: RESPONSE_MESSAGES.POSTS.INVALID_IMAGE_URL });
        }
        // Validation - check if categories array has more than 3 items
        if (categories.length > 3) {
            return res
                .status(HTTP_STATUS.BAD_REQUEST)
                .json({ message: RESPONSE_MESSAGES.POSTS.MAX_CATEGORIES });
        }
        const post = new Post({
            title,
            authorName,
            imageLink,
            description,
            categories,
            isFeaturedPost,
            authorId: req.user._id,
        });
        const [savedPost] = yield Promise.all([
            post.save(), // Save the post
            deleteDataFromCache(REDIS_KEYS.ALL_POSTS), // Invalidate cache for all posts
            deleteDataFromCache(REDIS_KEYS.FEATURED_POSTS), // Invalidate cache for featured posts
            deleteDataFromCache(REDIS_KEYS.LATEST_POSTS), // Invalidate cache for latest posts
        ]);
        // updating user doc to include the ObjectId of the created post
        yield User.findByIdAndUpdate(userId, { $push: { posts: savedPost._id } });
        res.status(HTTP_STATUS.OK).json(savedPost);
    }
    catch (err) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: err });
    }
});
export const getAllPostsHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const posts = yield Post.find();
        yield storeDataInCache(REDIS_KEYS.ALL_POSTS, posts);
        return res.status(HTTP_STATUS.OK).json(posts);
    }
    catch (err) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: err.message });
    }
});


export const getFeaturedPostsHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const featuredPosts = yield Post.find({ isFeaturedPost: true });
        yield storeDataInCache(REDIS_KEYS.FEATURED_POSTS, featuredPosts);
        res.status(HTTP_STATUS.OK).json(featuredPosts);
    }
    catch (err) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: err.message });
    }
});


export const getPostByCategoryHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const category = req.params.category;
    try {
        // Validation - check if category is valid
        if (!validCategories.includes(category)) {
            return res
                .status(HTTP_STATUS.BAD_REQUEST)
                .json({ message: RESPONSE_MESSAGES.POSTS.INVALID_CATEGORY });
        }
        const categoryPosts = yield Post.find({ categories: category });
        res.status(HTTP_STATUS.OK).json(categoryPosts);
    }
    catch (err) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: err.message });
    }
});

export const getLatestPostsHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const latestPosts = yield Post.find().sort({ timeOfPost: -1 });
        yield storeDataInCache(REDIS_KEYS.LATEST_POSTS, latestPosts);
        res.status(HTTP_STATUS.OK).json(latestPosts);
    }
    catch (err) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: err.message });
    }
});
export const getPostByIdHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = yield Post.findById(req.params.id);
        // Validation - check if post exists
        if (!post) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ message: RESPONSE_MESSAGES.POSTS.NOT_FOUND });
        }
        res.status(HTTP_STATUS.OK).json(post);
    }
    catch (err) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: err.message });
    }
});
export const updatePostHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updatedPost = yield Post.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });
        // Validation - check if post exists
        if (!updatedPost) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ message: RESPONSE_MESSAGES.POSTS.NOT_FOUND });
        }
        // invalidate the redis cache
        yield deleteDataFromCache(REDIS_KEYS.ALL_POSTS),
            yield deleteDataFromCache(REDIS_KEYS.FEATURED_POSTS),
            yield deleteDataFromCache(REDIS_KEYS.LATEST_POSTS),
            yield res.status(HTTP_STATUS.OK).json(updatedPost);
    }
    catch (err) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: err.message });
    }
});
export const deletePostByIdHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = yield Post.findByIdAndDelete(req.params.id);
        // Validation - check if post exists
        if (!post) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ message: RESPONSE_MESSAGES.POSTS.NOT_FOUND });
        }
        yield User.findByIdAndUpdate(post.authorId, { $pull: { posts: req.params.id } });
        // invalidate the redis cache
        yield deleteDataFromCache(REDIS_KEYS.ALL_POSTS),
            yield deleteDataFromCache(REDIS_KEYS.FEATURED_POSTS),
            yield deleteDataFromCache(REDIS_KEYS.LATEST_POSTS),
            res.status(HTTP_STATUS.OK).json({ message: RESPONSE_MESSAGES.POSTS.DELETED });
    }
    catch (err) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: err.message });
    }
});
export const getRelatedPostsByCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { categories } = req.query;
    if (!categories) {
        return res
            .status(HTTP_STATUS.NOT_FOUND)
            .json({ message: RESPONSE_MESSAGES.POSTS.INVALID_CATEGORY });
    }
    try {
        const filteredCategoryPosts = yield Post.find({
            categories: { $in: categories },
        });
        res.status(HTTP_STATUS.OK).json(filteredCategoryPosts);
    }
    catch (err) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: err.message });
    }
});
