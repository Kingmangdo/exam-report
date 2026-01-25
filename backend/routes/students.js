import express from 'express';
import {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  updateStudentsClasses
} from '../controllers/studentController.js';

const router = express.Router();

// GET /api/students - 모든 학생 조회 (필터링 가능)
router.get('/', getAllStudents);

// GET /api/students/:id - 학생 ID로 조회
router.get('/:id', getStudentById);

// POST /api/students - 학생 등록
router.post('/', createStudent);

// PUT /api/students/:id - 학생 수정
router.put('/:id', updateStudent);

// DELETE /api/students/:id - 학생 삭제
router.delete('/:id', deleteStudent);

// POST /api/students/update-classes - 학생 일괄 반 이동
router.post('/update-classes', updateStudentsClasses);

export default router;
