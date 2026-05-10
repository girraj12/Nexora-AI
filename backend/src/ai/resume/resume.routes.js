import express from 'express';
import multer from 'multer';

import {
  analyzeResumeController,
  matchJDController,
  generateBulletsController,
} from './resume.controller.js';

const router = express.Router();

const upload = multer({
  dest: 'uploads/',
});

router.post('/analyze', upload.single('resume'), analyzeResumeController);

router.post('/match-jd', upload.single('resume'), matchJDController);

router.post('/generate-bullets', generateBulletsController);

export default router;