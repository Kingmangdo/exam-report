import express from 'express';
import {
  getComment,
  setComment,
  getAllSettings,
  getSetting,
  setSetting
} from '../controllers/settingController.js';

const router = express.Router();

// GET /api/settings/comment - 종합 문구 조회
router.get('/comment', getComment);

// POST /api/settings/comment - 종합 문구 저장/수정
router.post('/comment', setComment);

// GET /api/settings - 모든 설정 조회
router.get('/', getAllSettings);

// GET /api/settings/:key - 설정 조회 (키로)
router.get('/:key', getSetting);

// POST /api/settings/:key - 설정 저장/수정 (키로)
router.post('/:key', setSetting);

export default router;
