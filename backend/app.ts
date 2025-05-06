import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import authRouter from './routes/auth.js';
import postsRouter from './routes/posts.js';
import userRouter from './routes/user.js';
import newsRouter from './routes/news.js';
import commentsRouter from './routes/comments.js';
import favoritesRouter from './routes/favorites.js';
import profileRouter from './routes/profile.js';
import bannersRouter from './routes/banners.js';
import errorMiddleware from './middlewares/error-middleware.js';
import passport from './config/passport.js';
import session from 'express-session';
import { FRONTEND_URL } from './config/utils.js';

const app = express();

app.use(
  cors({
    // added origin
    origin: [FRONTEND_URL as string, 'http://localhost:3000'],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression());
app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// API route
app.use('/api/posts', postsRouter);
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/news', newsRouter);
app.use('/api/comments', commentsRouter);
app.use('/api/favorites', favoritesRouter);
app.use('/api/profile', profileRouter);
app.use('/api/banners', bannersRouter);

app.get('/', (req, res) => {
  res.send('Yay!! Backend of wanderlust app is now accessible');
});

app.all('*', (req, res) => {
  res.status(404).json({
    status: 404,
    success: false,
    message: '!Oops page not found',
  });
});

app.use(errorMiddleware);
export default app;
