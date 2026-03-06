import express from 'express';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';

import { PORT, FRONTEND_URL } from './config/env.js';
import healthRoutes from './routes/health.routes.js';
import pubRoutes from './routes/public.routes.js';
import authRoutes from './routes/auth.routes.js';
import locationRoutes from './routes/location.routes.js';
import gameRoutes from './routes/game.routes.js';
import leaderboardRoutes from './routes/leaderboard.routes.js';
import { authenticate } from './middleware/auth.middleware.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  "http://localhost:5173",
  FRONTEND_URL
];

export const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});


// Socket connection
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});


// Rate Limiter
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 90,
  message: "Too many requests, slow down."
});


// Middlewares
app.set("trust proxy", 1);

app.use(limiter);

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(cookieParser());
app.use(express.json());


// Routes
app.use('/health', healthRoutes);
app.use('/', pubRoutes);

app.use('/auth', authenticate, authRoutes);
app.use('/game', authenticate, gameRoutes);
app.use('/leaderboard', authenticate, leaderboardRoutes);
app.use('/locations', locationRoutes);


// Start server (IMPORTANT)
const port = process.env.PORT || PORT || 5000;

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});