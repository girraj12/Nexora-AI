import express from 'express';
import multer from 'multer';

import { analyzeResumeController } from './resume.controller.js';

const router = express.Router();

const upload = multer({
  dest: 'uploads/',
});

router.post(
  '/analyze',
  upload.single('resume'),
  analyzeResumeController
);

export default router;