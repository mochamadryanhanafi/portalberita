var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { createClient } from 'redis';
import { REDIS_URL } from '../config/utils.js';
let redis = null;
export function connectToRedis() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (REDIS_URL) {
                redis = yield createClient({
                    url: REDIS_URL,
                    disableOfflineQueue: true,
                }).connect();
                console.log('Redis Connected: ' + REDIS_URL);
            }
            else {
                console.log('Redis not configured, cache disabled.');
            }
        }
        catch (error) {
            console.error('Error connecting to Redis:', error.message);
        }
    });
}
export function getRedisClient() {
    return redis;
}
