import express from 'express';
import {
  generateReportLink,
  verifyReportAccess,
  getReportData,
  previewReport,
  checkReportLink
} from '../controllers/reportController.js';
import { LevelTestReport } from '../models/LevelTestReport.js';

const router = express.Router();

// POST /api/reports/generate - 성적표 링크 생성
router.post('/generate', generateReportLink);

// GET /api/reports/check/:token - 링크 상태 확인
router.get('/check/:token', checkReportLink);

// POST /api/reports/verify/:token - 성적표 접근 인증
router.post('/verify/:token', verifyReportAccess);

// ========== 레벨테스트 성적표 ==========
// POST /api/reports/level-test/generate - 레벨테스트 링크 생성
router.post('/level-test/generate', async (req, res) => {
  try {
    const { level_test_id, name, phone_last4 } = req.body;
    if (!level_test_id) {
      return res.status(400).json({ success: false, message: '레벨테스트 ID가 필요합니다.' });
    }
    const token = await LevelTestReport.createAccessLink(level_test_id, name, phone_last4);
    const url = `${req.protocol}://${req.get('host')}/report/level-test/${token}`;
    res.json({ success: true, data: { token, url } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/reports/level-test/check/:token - 레벨테스트 링크 확인
router.get('/level-test/check/:token', async (req, res) => {
  try {
    const access = await LevelTestReport.getAccessByToken(req.params.token);
    if (!access) {
      return res.status(404).json({ success: false, message: '유효하지 않은 링크입니다.' });
    }
    const expired = new Date() > new Date(access.expires_at);
    res.json({ success: true, data: { ...access, expired } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/reports/level-test/verify/:token - 레벨테스트 인증
router.post('/level-test/verify/:token', async (req, res) => {
  try {
    const { name, phone_last4 } = req.body;
    const result = await LevelTestReport.verifyAccess(req.params.token, name, phone_last4);
    if (!result.valid) {
      return res.status(401).json({ success: false, message: result.message });
    }
    res.json({ success: true, data: { level_test_id: result.access.level_test_id, verified: true } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/reports/level-test/:token - 레벨테스트 성적표 데이터
router.get('/level-test/:token', async (req, res) => {
  try {
    const access = await LevelTestReport.getAccessByToken(req.params.token);
    if (!access) {
      return res.status(404).json({ success: false, message: '유효하지 않은 링크입니다.' });
    }
    if (new Date() > new Date(access.expires_at)) {
      return res.status(410).json({ success: false, message: '링크가 만료되었습니다.' });
    }
    const reportData = await LevelTestReport.getReportData(access.level_test_id);
    res.json({ success: true, data: reportData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/reports/level-test/preview/:levelTestId - 레벨테스트 미리보기
router.get('/level-test/preview/:levelTestId', async (req, res) => {
  try {
    const reportData = await LevelTestReport.getReportData(req.params.levelTestId);
    res.json({ success: true, data: reportData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/reports/preview/:scoreId - 성적표 미리보기 (관리자용)
router.get('/preview/:scoreId', previewReport);

// GET /api/reports/:token - 성적표 데이터 조회 (인증 필요) - 반드시 맨 아래
router.get('/:token', getReportData);

export default router;
