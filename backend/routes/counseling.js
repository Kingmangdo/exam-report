import express from 'express';
import * as counselingController from '../controllers/counselingController.js';

const router = express.Router();

router.get('/student/:studentId', counselingController.getLogsByStudent);
router.post('/', counselingController.createLog);
router.put('/:id', counselingController.updateLog);
router.delete('/:id', counselingController.deleteLog);

export default router;
