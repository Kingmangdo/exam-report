import express from 'express';
import {
  getTargetStudents,
  updateExclusion,
  updateInitialLevel,
  upsertCheckpoint,
  generateReportLink,
  verifyReportAccess,
  getReportData
} from '../controllers/softLandingController.js';

const router = express.Router();

// GET /api/soft-landing/students
router.get('/students', getTargetStudents);

// PUT /api/soft-landing/students/:studentId/exclusion
router.put('/students/:studentId/exclusion', updateExclusion);

// PUT /api/soft-landing/students/:studentId/initial-level
router.put('/students/:studentId/initial-level', updateInitialLevel);

// PUT /api/soft-landing/students/:studentId/checkpoints/:phase
router.put('/students/:studentId/checkpoints/:phase', upsertCheckpoint);

// POST /api/soft-landing/report/link
router.post('/report/link', generateReportLink);

// POST /api/soft-landing/report/verify/:token
router.post('/report/verify/:token', verifyReportAccess);

// GET /api/soft-landing/report/data/:token
router.get('/report/data/:token', getReportData);

export default router;
