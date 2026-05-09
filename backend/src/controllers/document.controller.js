import fs from 'fs';
import { createRequire } from 'module';

import Document from '../models/Document.js';
import { generateAIResponseFromText } from '../services/documentAI.service.js';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: 'File is required',
      });
    }

    let extractedText = '';

    if (req.file.mimetype === 'application/pdf') {
      const buffer = fs.readFileSync(req.file.path);
      const data = await pdfParse(buffer);
      extractedText = data.text;
    } else {
      extractedText = fs.readFileSync(req.file.path, 'utf-8');
    }

    if (!extractedText || !extractedText.trim()) {
      return res.status(400).json({
        message: 'No readable text found in this document',
      });
    }

    const document = await Document.create({
      userId: req.user.id,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      extractedText,
    });

    return res.json({
      success: true,
      message: 'Document uploaded successfully',
      document,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const getDocuments = async (req, res) => {
  try {
    const documents = await Document.find({
      userId: req.user.id,
    })
      .select('-extractedText')
      .sort({ createdAt: -1 });

    return res.json(documents);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const askDocument = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({
        message: 'Question is required',
      });
    }

    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!document) {
      return res.status(404).json({
        message: 'Document not found',
      });
    }

    const answer = await generateAIResponseFromText(
      document.extractedText,
      question
    );

    return res.json({
      answer,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    if (document.fileName) {
      const filePath = `uploads/${document.fileName}`;

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Document.deleteOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    return res.json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};