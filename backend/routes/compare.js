import express from 'express';
import {
  getClassAverage,
  compareWithPrevious
} from '../controllers/compareController.js';

const router = express.Router();

// GET /api/compare/class-average/:classId - 반 평균 계산
router.get('/class-average/:classId', getClassAverage);

// GET /api/compare/previous/:studentId - 이전 성적과 비교
router.get('/previous/:studentId', compareWithPrevious);

export default router;
