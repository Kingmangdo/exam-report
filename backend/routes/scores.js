import express from 'express';
import {
  getAllScores,
  getScoreById,
  createScore,
  updateScore,
  deleteScore
} from '../controllers/scoreController.js';

const router = express.Router();

// GET /api/scores - 모든 성적 조회 (필터링 가능)
router.get('/', getAllScores);

// GET /api/scores/:id - 성적 ID로 조회
router.get('/:id', getScoreById);

// POST /api/scores - 성적 등록
router.post('/', createScore);

// PUT /api/scores/:id - 성적 수정
router.put('/:id', updateScore);

// DELETE /api/scores/:id - 성적 삭제
router.delete('/:id', deleteScore);

export default router;
