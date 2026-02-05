import express from 'express';
import { sendScoreReport } from '../controllers/kakaoController.js';

const router = express.Router();

// POST /api/kakao/send-report - 성적표 알림톡 발송
router.post('/send-report', sendScoreReport);

export default router;
