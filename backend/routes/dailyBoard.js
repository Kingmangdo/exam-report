import express from 'express';
import { getDailyBoard, saveDailyBoard, getDailyBoardsByMonth } from '../controllers/dailyBoardController.js';

const router = express.Router();

// GET /api/daily-board/month/:month
router.get('/month/:month', getDailyBoardsByMonth);

// GET /api/daily-board/:date
router.get('/:date', getDailyBoard);

// POST /api/daily-board/:date
router.post('/:date', saveDailyBoard);

export default router;
