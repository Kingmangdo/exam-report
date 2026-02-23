
import express from 'express';
import * as supplementaryController from '../controllers/supplementaryController.js';

const router = express.Router();

// 보강 일정 조회
router.get('/class/:classId', supplementaryController.getSessions);

// 보강 일정 생성
router.post('/', supplementaryController.createSession);

// 보강 일정 수정
router.put('/:id', supplementaryController.updateSession);

// 보강 일정 삭제
router.delete('/:id', supplementaryController.deleteSession);

// 보강 참여 학생 추가
router.post('/:id/students', supplementaryController.addStudents);

// 보강 참여 학생 제거
router.delete('/:id/students/:studentId', supplementaryController.removeStudent);

// 학생별 보강 히스토리 조회
router.get('/student/:studentId', supplementaryController.getStudentHistory);

export default router;
