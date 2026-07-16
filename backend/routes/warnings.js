import express from 'express';
import { AcademicWarning } from '../models/AcademicWarning.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

// 활성 경고 전체 조회 (대시보드용)
router.get('/', async (req, res) => {
  try {
    const data = await AcademicWarning.getActiveWarnings();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 원장님: 강사 배정 및 커스텀 메시지 업데이트
router.put('/:id/admin-settings', async (req, res) => {
  try {
    // 권한 검증: 관리자만 설정 가능
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: '권한이 없습니다.' });
    }
    const data = await AcademicWarning.updateAdminSettings(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 강사: 학생 관리 상황 (피드백) 입력
router.put('/:id/feedback', async (req, res) => {
  try {
    const { reason, solution } = req.body;
    const teacherName = req.user.name; // 현재 로그인한 강사 이름
    const data = await AcademicWarning.updateTeacherFeedback(req.params.id, teacherName, reason, solution);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 원장님: 최종 확인 처리 (상태를 resolved로 변경)
router.put('/:id/acknowledge', async (req, res) => {
  try {
    const data = await AcademicWarning.acknowledge(req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
