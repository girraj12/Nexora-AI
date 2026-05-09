import express from 'express';

import { migrateGuestChat } from '../controllers/guest.controller.js';

import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/migrate', authMiddleware, migrateGuestChat);

export default router;