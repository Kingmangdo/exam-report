import express from 'express';
import { generateBimonthlyComment } from '../controllers/aiController.js';

const router = express.Router();

// POST /api/ai/generate-comment - 성취평가 코멘트 AI 초안 생성
router.post('/generate-comment', generateBimonthlyComment);

export default router;
