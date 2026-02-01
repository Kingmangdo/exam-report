import express from 'express';
import * as classController from '../controllers/classController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', classController.getAllClasses);
router.get('/:className/students', classController.getClassStudents);
router.post('/', classController.createClass);
router.put('/:id', classController.updateClass);
router.delete('/:id', classController.deleteClass);
router.post('/assign-students', classController.assignStudentsToClass);
router.get('/:id/learning-log', classController.getLearningLog);
router.post('/:id/learning-log', classController.saveLearningLog);
router.get('/:id/learning-logs', classController.getAllLearningLogs);
router.get('/:id/learning-log/recent-dates', classController.getRecentLogDates);

export default router;
