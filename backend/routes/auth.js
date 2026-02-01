import express from 'express';
import * as authController from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', authController.login);
router.post('/init-admin', authController.createFirstAdmin);

// 인증이 필요한 라우트
router.use(authenticate);
router.get('/me', authController.getMe);

// 관리자 전용 라우트
router.get('/users', authController.getAllUsers);
router.put('/users/:id', authController.updateUser);
router.delete('/users/:id', authController.deleteUser);

export default router;
