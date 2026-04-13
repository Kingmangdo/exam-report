import express from 'express';
import * as attendanceController from '../controllers/attendanceController.js';

const router = express.Router();

// 월간 출결 요약 (캘린더용)
router.get('/summary/:month', attendanceController.getMonthlySummary);

// 특정 날짜 전체 출결 조회
router.get('/by-date/:date', attendanceController.getAttendanceByDate);

// 연속 결석 학생 조회
router.get('/consecutive-absent', attendanceController.getConsecutiveAbsent);

// 학생별 월간 출결 조회
router.get('/student/:studentId', attendanceController.getStudentMonthly);

// 특정 반 + 날짜 출결 조회
router.get('/class/:classId', attendanceController.getAttendance);

// 출결 입력/수정
router.post('/', attendanceController.updateAttendance);

export default router;
