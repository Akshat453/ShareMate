import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './config/db.js';
import errorHandler from './middleware/errorHandler.js';
import { globalLimiter } from './middleware/rateLimiter.js';
import { setupSocket } from './services/socketService.js';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import eventRoutes from './routes/events.js';
import listingRoutes from './routes/listings.js';
import chatRoutes from './routes/chat.js';
import notificationRoutes from './routes/notifications.js';
import squadRoutes from './routes/squad.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(globalLimiter);

// Make io accessible
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/squad', squadRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'ShareMate API is running.', data: null, errors: [] });
});

// Error handler
app.use(errorHandler);

// Socket.io
setupSocket(io);

// Start server
const PORT = process.env.PORT || 8000;

const startServer = async () => {
  await connectDB();
  httpServer.listen(PORT, () => {
    console.log(`ShareMate server running on port ${PORT}`);
  });
};

startServer();

export { app, io };
