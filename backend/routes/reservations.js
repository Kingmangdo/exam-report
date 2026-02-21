import express from 'express';
import * as reservationController from '../controllers/reservationController.js';

const router = express.Router();

// 예약자 CRUD
router.get('/', reservationController.getAllReservations);
router.post('/', reservationController.createReservation);

// 레벨테스트 (구체적 경로를 /:id 보다 먼저 등록)
router.post('/level-test', reservationController.saveLevelTest);
router.get('/level-test/:id', reservationController.getLevelTestById);
router.delete('/level-test/:id', reservationController.deleteLevelTest);

// 예약자 개별 조회/수정/삭제
router.get('/:id', reservationController.getReservationById);
router.put('/:id', reservationController.updateReservation);
router.delete('/:id', reservationController.deleteReservation);

// 입학 처리 (학생 자동 등록)
router.post('/:id/enroll', reservationController.enrollStudent);

// 예약자별 레벨테스트 조회
router.get('/:reservationId/level-test', reservationController.getLevelTest);

export default router;
