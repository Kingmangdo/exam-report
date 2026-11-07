import express from 'express';
import rateLimit from 'express-rate-limit';
import * as publicController from '../controllers/publicController.js';

const router = express.Router();

// 스팸 봇 방지를 위한 Rate Limiter 설정
// 같은 IP에서 1시간 동안 최대 5번의 상담 신청만 가능하도록 제한
const consultingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1시간
  max: 5, // 최대 5번 요청 허용
  message: {
    success: false,
    message: '너무 많은 상담 신청이 접수되었습니다. 잠시 후 다시 시도해주시거나 전화로 문의해주세요.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 퍼블릭 상담 접수 (인증 없음)
router.post('/consulting', consultingLimiter, publicController.submitPublicConsulting);

export default router;
