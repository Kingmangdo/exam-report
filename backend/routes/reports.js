import express from 'express';
import {
  generateReportLink,
  verifyReportAccess,
  getReportData,
  previewReport,
  checkReportLink
} from '../controllers/reportController.js';

const router = express.Router();

// POST /api/reports/generate - 성적표 링크 생성
router.post('/generate', generateReportLink);

// GET /api/reports/check/:token - 링크 상태 확인
router.get('/check/:token', checkReportLink);

// POST /api/reports/verify/:token - 성적표 접근 인증
router.post('/verify/:token', verifyReportAccess);

// GET /api/reports/:token - 성적표 데이터 조회 (인증 필요)
router.get('/:token', getReportData);

// GET /api/reports/preview/:scoreId - 성적표 미리보기 (관리자용)
router.get('/preview/:scoreId', previewReport);

export default router;
