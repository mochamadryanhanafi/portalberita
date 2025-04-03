var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getRedisClient } from '../services/redis.js';
import { REDIS_PREFIX } from './constants.js';
// Helper function to check if Redis is available
function isRedisEnabled() {
    return getRedisClient() !== null;
}
export function retrieveDataFromCache(key) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!isRedisEnabled())
            return null; // Skip cache if Redis is not available
        const cacheKey = `${REDIS_PREFIX}:${key}`;
        const cachedData = yield getRedisClient().get(cacheKey);
        if (cachedData) {
            return JSON.parse(cachedData);
        }
        return null;
    });
}
export function storeDataInCache(key, data) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!isRedisEnabled())
            return; // Skip cache if Redis is not available
        const cacheKey = `${REDIS_PREFIX}:${key}`;
        yield getRedisClient().set(cacheKey, JSON.stringify(data));
    });
}
export function deleteDataFromCache(key) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!isRedisEnabled())
            return; // Skip cache if Redis is not available
        const cacheKey = `${REDIS_PREFIX}:${key}`;
        if (getRedisClient().exists(cacheKey)) {
            yield getRedisClient().del(cacheKey);
        }
    });
}
