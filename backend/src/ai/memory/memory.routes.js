import express from 'express';

import {
  getMemories,
  addMemory,
  removeMemory,
} from './memory.controller.js';

import { authMiddleware } from '../../middleware/auth.js';

const router = express.Router();

router.get('/', authMiddleware, getMemories);

router.post('/', authMiddleware, addMemory);

router.delete('/:id', authMiddleware, removeMemory);

export default router;