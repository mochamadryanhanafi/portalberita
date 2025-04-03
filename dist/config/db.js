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
import { MONGODB_URI } from './utils.js';
export default function connectDB() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield mongoose.connect(MONGODB_URI, {
                dbName: 'wanderlust',
            });
            console.log(`Database connected: ${MONGODB_URI}`);
        }
        catch (err) {
            console.error(err.message);
            process.exit(1);
        }
        const dbConnection = mongoose.connection;
        dbConnection.on('error', (err) => {
            console.error(`connection error: ${err}`);
        });
        return;
    });
}
