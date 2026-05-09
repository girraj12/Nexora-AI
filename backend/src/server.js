
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';

import { connectDB } from './config/db.js';
import './config/redis.js';

import authRoutes from './routes/auth.routes.js';
import registerSocket from './sockets/chat.socket.js';
import conversationRoutes from './routes/conversation.routes.js';
import documentRoutes from './routes/document.routes.js';
import guestRoutes from './routes/guest.routes.js';
import memoryRoutes from './ai/memory/memory.routes.js';
import resumeRoutes from './ai/resume/resume.routes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/guest', guestRoutes);
app.use('/api/memories', memoryRoutes);
app.use('/api/resume', resumeRoutes);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*'
  }
});

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  registerSocket(io, socket);

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
