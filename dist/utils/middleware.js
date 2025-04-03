var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { retrieveDataFromCache } from './cache-posts.js';
import { HTTP_STATUS } from './constants.js';
export const cacheHandler = (key) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cachedData = yield retrieveDataFromCache(key);
        if (cachedData) {
            console.log(`Getting cached data for key: ${key}`);
            return res.status(HTTP_STATUS.OK).json(cachedData);
        }
        next(); // Proceed to the route handler if data is not cached
    }
    catch (err) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: err.message });
    }
});
