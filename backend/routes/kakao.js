import express from 'express';
import { 
  sendScoreReport,
  sendBimonthlyReport,
  generateBimonthlyReportLink,
  previewBimonthlyReport,
  getBimonthlyReportData,
  verifyBimonthlyReportAccess,
  getBimonthlySendStatus,
  sendReservationNotification,
  getReservationSendStatus
} from '../controllers/kakaoController.js';

const router = express.Router();

// POST /api/kakao/send-report - Daily Report 알림톡 발송
router.post('/send-report', sendScoreReport);

// POST /api/kakao/send-bimonthly - 성취평가 알림톡 발송
router.post('/send-bimonthly', sendBimonthlyReport);

// POST /api/kakao/bimonthly-link - 성취평가 성적표 링크 생성
router.post('/bimonthly-link', generateBimonthlyReportLink);

// GET /api/kakao/bimonthly-preview/:scoreId - 성취평가 성적표 미리보기
router.get('/bimonthly-preview/:scoreId', previewBimonthlyReport);

// POST /api/kakao/bimonthly-verify/:token - 성취평가 성적표 인증
router.post('/bimonthly-verify/:token', verifyBimonthlyReportAccess);

// GET /api/kakao/bimonthly-report/:token - 성취평가 성적표 공개 조회
router.get('/bimonthly-report/:token', getBimonthlyReportData);

// GET /api/kakao/bimonthly-send-status - 성취평가 발송 상태 조회
router.get('/bimonthly-send-status', getBimonthlySendStatus);

// POST /api/kakao/send-reservation - 예약 안내 알림톡 발송
router.post('/send-reservation', sendReservationNotification);

// GET /api/kakao/reservation-send-status - 예약 안내 발송 상태 조회
router.get('/reservation-send-status', getReservationSendStatus);

export default router;
