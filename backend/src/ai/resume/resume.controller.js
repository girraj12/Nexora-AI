import fs from 'fs';
import pdf from 'pdf-parse/lib/pdf-parse.js';
import { matchResumeWithJD } from './jdMatcher.service.js';
import { analyzeResume } from './resumeAnalyzer.service.js';
import { generateBetterResumeBullets } from './bulletGenerator.service.js';

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

export const matchJDController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: 'Resume file required',
      });
    }

    const { jobDescription, targetRole } = req.body;

    if (!jobDescription || jobDescription.trim().length < 50) {
      return res.status(400).json({
        message: 'Job description is required',
      });
    }

    const fileBuffer = fs.readFileSync(req.file.path);

    const parsed = await pdf(fileBuffer);

    const result = await matchResumeWithJD({
      resumeText: parsed.text,
      jobDescription,
      targetRole: targetRole || 'General',
    });

    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error(error);

    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(500).json({
      message: 'JD matching failed',
    });
  }
};

export const generateBulletsController = async (req, res) => {
  try {
    const { bullets, targetRole } = req.body;

    if (!bullets || bullets.trim().length < 10) {
      return res.status(400).json({
        message: 'Bullet points are required',
      });
    }

    const result = await generateBetterResumeBullets({
      bullets,
      targetRole: targetRole || 'General',
    });

    return res.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: 'Bullet generation failed',
    });
  }
};