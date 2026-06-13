import express from 'express';
import {
  getTargetStudents,
  updateExclusion,
  updateInitialLevel,
  upsertCheckpoint
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

export default router;
