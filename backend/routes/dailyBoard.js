import express from 'express';
import { getDailyBoard, saveDailyBoard } from '../controllers/dailyBoardController.js';

const router = express.Router();

// GET /api/daily-board/:date
router.get('/:date', getDailyBoard);

// POST /api/daily-board/:date
router.post('/:date', saveDailyBoard);

export default router;
