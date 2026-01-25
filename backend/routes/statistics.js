import express from 'express';
import {
  getStudentStatistics,
  getClassStatistics,
  getOverallStatistics
} from '../controllers/statisticsController.js';

const router = express.Router();

// GET /api/statistics/overall - 전체 통계 (대시보드용)
router.get('/overall', getOverallStatistics);

// GET /api/statistics/student/:studentId - 학생별 통계
router.get('/student/:studentId', getStudentStatistics);

// GET /api/statistics/class/:classId - 반별 통계
router.get('/class/:classId', getClassStatistics);

export default router;
