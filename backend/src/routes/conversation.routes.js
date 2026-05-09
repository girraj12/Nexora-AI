import express from 'express';

import {
  createConversation,
  getConversations,
  getMessages,
  deleteConversation,
  shareConversation,
  getSharedConversation,
} from '../controllers/conversation.controller.js';

import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/create', authMiddleware, createConversation);

router.get('/', authMiddleware, getConversations);

router.get('/:id/messages', authMiddleware, getMessages);

router.delete('/:id', authMiddleware, deleteConversation);

router.post('/:id/share', authMiddleware, shareConversation);

router.get('/share/:shareId', getSharedConversation);

export default router;