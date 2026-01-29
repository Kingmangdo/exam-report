import express from 'express';
import * as paymentController from '../controllers/paymentController.js';
import { authenticate, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// 모든 결제 관련 라우트는 인증 필요, 조회/생성/수정/삭제는 관리자만 가능하게 설정
router.use(authenticate, adminOnly);

router.get('/', paymentController.getAllPayments);
router.get('/student/:studentId', paymentController.getStudentPayments);
router.post('/', paymentController.createPayment);
router.put('/:id', paymentController.updatePayment);
router.delete('/:id', paymentController.deletePayment);

export default router;
