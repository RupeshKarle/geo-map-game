import express from 'express';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { PORT } from './config/env.js';
import healthRoutes from './routes/health.routes.js';
import pubRoutes from './routes/public.routes.js';
import authRoutes from './routes/auth.routes.js';
import locationRoutes from './routes/location.routes.js';
import { authenticate } from './middleware/auth.middleware.js'
import gameRoutes from './routes/game.routes.js';
import leaderboardRoutes from './routes/leaderboard.routes.js';

dotenv.config();

const app = express();

const limiter = rateLimit({
 windowMs: 60 * 1000, // 1 min
 max: 60, //per IP
 message: 'Too many requests, slow down.'
});

app.use(limiter);
app.use(cors());
app.use(cookieParser());
app.use(express.json());

app.use('/health', healthRoutes);
app.use('/', pubRoutes);

app.use('/auth', authenticate, authRoutes);
app.use('/game', authenticate, gameRoutes);
app.use('/leaderboard', authenticate, leaderboardRoutes);
app.use('/locations', locationRoutes);

app.listen(PORT, () => {
 console.log(`Server is running on port ${PORT}`);
});