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

export default router;
