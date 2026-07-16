import express from 'express';
import { AcademicWarning } from '../models/AcademicWarning.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

// 아직 확인되지 않은 최신 경고 조회 (대시보드용)
router.get('/', async (req, res) => {
  try {
    const data = await AcademicWarning.getUnacknowledged();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 경고 확인 처리 (원장님이 확인 버튼 클릭 시)
router.put('/:id/acknowledge', async (req, res) => {
  try {
    const data = await AcademicWarning.acknowledge(req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
