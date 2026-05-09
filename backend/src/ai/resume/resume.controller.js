import fs from 'fs';
import pdf from 'pdf-parse/lib/pdf-parse.js';

import { analyzeResume } from './resumeAnalyzer.service.js';

export const analyzeResumeController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: 'Resume file required',
      });
    }

    const fileBuffer = fs.readFileSync(req.file.path);

    const parsed = await pdf(fileBuffer);
    
    const result = await analyzeResume({
      resumeText: parsed.text,
      targetRole: req.body.targetRole,
    });

    fs.unlinkSync(req.file.path);

    return res.json(result);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: 'Resume analysis failed',
    });
  }
};