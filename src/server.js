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
import { adminAccess, authenticate } from './middleware/auth.middleware.js';
import profileRoutes from './routes/profile.routes.js';
import adminRoutes from './routes/admin.routes.js';
import groupRoutes from './routes/group.routes.js';
import invitesRoutes from './routes/invite.routes.js';
import { validateToken } from './controllers/invite.controller.js';

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

app.use('/invites/validate', authenticate, validateToken)
app.use('/auth', authenticate, authRoutes);
app.use('/game', authenticate, gameRoutes);
app.use('/users', authenticate, profileRoutes);
app.use('/leaderboard', authenticate, leaderboardRoutes);
app.use('/locations', authenticate, locationRoutes);
app.use('/admin', authenticate, adminRoutes);
app.use('/groups', authenticate, adminAccess, groupRoutes);
app.use('/invites', authenticate, adminAccess, invitesRoutes);

// Start server (IMPORTANT)
const port = process.env.PORT || PORT || 5000;

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});