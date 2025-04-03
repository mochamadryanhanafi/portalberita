var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/user.js';
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`,
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Cari user berdasarkan googleId atau email
        let user = await User.findOne({
            $or: [
                { googleId: profile.id },
                { email: profile.emails[0].value }
            ]
        });

        if (!user) {
            const email = profile.emails && profile.emails[0] ? profile.emails[0].value : '';
            let fullName = profile.displayName || '';

            if (fullName.length > 15) {
                fullName = fullName.slice(0, 15); // Batas nama maksimal 15 karakter
            }

            const userName = email.split('@')[0] || fullName.replace(/\s+/g, '').toLowerCase();
            user = new User({
                googleId: profile.id,
                email,
                fullName,
                userName,
                avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : '',
            });

            await user.save();
        } else if (!user.googleId) {
            // Jika user ditemukan tetapi belum memiliki googleId, tambahkan googleId
            user.googleId = profile.id;
            await user.save();
        }

        done(null, user);
    } catch (err) {
        done(err, null);
    }
}));


passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User.findById(id);
        done(null, user);
    }
    catch (err) {
        done(err, null);
    }
}));
export default passport;
