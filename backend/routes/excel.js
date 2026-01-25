import express from 'express';
import { downloadTemplate, uploadStudents } from '../controllers/excelController.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// GET /api/excel/template - Excel 양식 다운로드
router.get('/template', downloadTemplate);

// POST /api/excel/upload - Excel 파일 업로드 및 학생 일괄 등록
router.post('/upload', upload.single('file'), uploadStudents);

export default router;
