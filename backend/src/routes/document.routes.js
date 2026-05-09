import express from 'express';
import multer from 'multer';

import {
  uploadDocument,
  getDocuments,
  askDocument,
  deleteDocument
} from '../controllers/document.controller.js';

import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

const upload = multer({
  dest: 'uploads/',
});

router.post('/upload', authMiddleware, upload.single('file'), uploadDocument);

router.get('/', authMiddleware, getDocuments);

router.post('/:id/ask', authMiddleware, askDocument);

router.delete('/:id', authMiddleware, deleteDocument);

export default router;